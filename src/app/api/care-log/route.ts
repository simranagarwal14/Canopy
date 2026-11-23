import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { describeServerError, getGardenOverview, toPlantView } from "@/lib/gardenService";
import { TASK_TYPES, type TaskType } from "@/lib/types";

export const dynamic = "force-dynamic";

const TIMESTAMP_FIELD = {
  water: "lastWatered",
  sunlight: "lastSunMoved",
  soil: "lastFertilized",
} as const satisfies Record<TaskType, string>;

/** GET /api/care-log — every plant with live health + task status. */
export async function GET() {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Please log in first." }, { status: 401 });
  try {
    const overview = await getGardenOverview(auth.email);
    return NextResponse.json({ plants: overview?.plants ?? [] });
  } catch (err) {
    console.error("[api/care-log GET]", err);
    return NextResponse.json({ error: describeServerError(err) }, { status: 500 });
  }
}

/**
 * POST /api/care-log { plantId, taskType, action?: "complete" | "undo" }
 *
 * complete (default): writes a CareLog row, stamps the matching Plant timestamp,
 *                     recomputes + saves healthState.
 * undo:               marks the most recent completed CareLog for that task as not completed
 *                     (history is kept), rewinds the Plant timestamp to the previous completed
 *                     entry (or null), and recomputes healthState.
 */
export async function POST(request: Request) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Please log in first." }, { status: 401 });

  let body: { plantId?: unknown; taskType?: unknown; action?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const { plantId, taskType } = body;
  const action = body.action === undefined ? "complete" : body.action;
  if (typeof plantId !== "string" || !plantId) {
    return NextResponse.json({ error: "plantId is required." }, { status: 400 });
  }
  if (typeof taskType !== "string" || !(TASK_TYPES as readonly string[]).includes(taskType)) {
    return NextResponse.json({ error: "taskType must be water, sunlight or soil." }, { status: 400 });
  }
  if (action !== "complete" && action !== "undo") {
    return NextResponse.json({ error: "action must be complete or undo." }, { status: 400 });
  }
  const task = taskType as TaskType;
  const field = TIMESTAMP_FIELD[task];

  try {
    // The plant must belong to the signed-in user's garden.
    const plant = await prisma.plant.findFirst({
      where: { id: plantId, garden: { user: { email: auth.email } } },
    });
    if (!plant) return NextResponse.json({ error: "Plant not found." }, { status: 404 });

    if (toPlantView(plant).healthState === "dead") {
      return NextResponse.json(
        { error: "This plant has died. Delete it and plant a new one." },
        { status: 409 },
      );
    }

    const now = new Date();

    if (action === "complete") {
      const view = toPlantView({ ...plant, [field]: now }, now);
      const [log] = await prisma.$transaction([
        prisma.careLog.create({ data: { plantId: plant.id, taskType: task, completed: true, timestamp: now } }),
        prisma.plant.update({ where: { id: plant.id }, data: { [field]: now, healthState: view.healthState } }),
      ]);
      return NextResponse.json({ ok: true, action, timestamp: log.timestamp.toISOString(), plant: view });
    }

    // undo
    const completed = await prisma.careLog.findMany({
      where: { plantId: plant.id, taskType: task, completed: true },
      orderBy: { timestamp: "desc" },
      take: 2,
    });
    const latest = completed[0];
    if (!latest) {
      return NextResponse.json({ error: "There's nothing to undo for this task." }, { status: 409 });
    }
    const previous = completed[1]?.timestamp ?? null;
    const view = toPlantView({ ...plant, [field]: previous }, now);
    await prisma.$transaction([
      prisma.careLog.update({ where: { id: latest.id }, data: { completed: false } }),
      prisma.plant.update({ where: { id: plant.id }, data: { [field]: previous, healthState: view.healthState } }),
    ]);
    return NextResponse.json({ ok: true, action, timestamp: null, plant: view });
  } catch (err) {
    console.error("[api/care-log POST]", err);
    return NextResponse.json({ error: describeServerError(err) }, { status: 500 });
  }
}
