import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { describeServerError, ensureDbUser, getGardenOverview } from "@/lib/gardenService";
import {
  HUMIDITY_OPTIONS,
  PLACEMENT_OPTIONS,
  SOIL_OPTIONS,
  SUNLIGHT_OPTIONS,
  isValidOption,
} from "@/lib/gardenOptions";
import { getPlantSpeciesData } from "@/lib/plantData";

export const dynamic = "force-dynamic";

/** GET /api/garden — the signed-in user's garden and plants (or { garden: null }). */
export async function GET() {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Please log in first." }, { status: 401 });
  try {
    const overview = await getGardenOverview(auth.email);
    return NextResponse.json(overview ?? { garden: null, plants: [] });
  } catch (err) {
    console.error("[api/garden GET]", err);
    return NextResponse.json({ error: describeServerError(err) }, { status: 500 });
  }
}

/** POST /api/garden — upsert User + Garden; create the starter Plant (required first time, optional after). */
export async function POST(request: Request) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Please log in first." }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { humidity, sunlight, soiltype, placement, plant } = body;
  if (!isValidOption(HUMIDITY_OPTIONS, humidity)) return badField("humidity");
  if (!isValidOption(SUNLIGHT_OPTIONS, sunlight)) return badField("sunlight");
  if (!isValidOption(SOIL_OPTIONS, soiltype)) return badField("soil type");
  if (!isValidOption(PLACEMENT_OPTIONS, placement)) return badField("placement");
  // A plant is required for a brand-new garden; returning users may just update the garden settings.
  const wantsPlant = typeof plant === "string" && plant.trim() !== "";
  const species = wantsPlant ? getPlantSpeciesData(plant) : null;
  if (wantsPlant && !species) return badField("plant");

  try {
    const existing = await prisma.garden.findFirst({ where: { user: { email: auth.email } }, select: { id: true } });
    if (!existing && !species) return badField("plant");

    const user = await ensureDbUser(auth);
    const garden = await prisma.garden.upsert({
      where: { userId: user.id },
      update: { humidity, sunlight, soiltype, placement },
      create: { userId: user.id, humidity, sunlight, soiltype, placement },
    });

    let plantId: string | null = null;
    let created = false;
    if (species) {
      // First-time setup is idempotent (a double-submit can't create two starters);
      // an existing gardener who picks a plant is explicitly adding another one.
      let plantRow = existing
        ? null
        : await prisma.plant.findFirst({ where: { gardenId: garden.id, species: species.name } });
      if (!plantRow) {
        plantRow = await prisma.plant.create({
          data: {
            gardenId: garden.id,
            name: species.name,
            species: species.name,
            growthStage: "Sprout",
            healthState: "happy",
          },
        });
        created = true;
      }
      plantId = plantRow.id;
    }
    return NextResponse.json({ ok: true, gardenId: garden.id, plantId, plantCreated: created });
  } catch (err) {
    console.error("[api/garden POST]", err);
    return NextResponse.json({ error: describeServerError(err) }, { status: 500 });
  }
}

function badField(field: string) {
  return NextResponse.json({ error: `Please choose a valid ${field}.` }, { status: 400 });
}
