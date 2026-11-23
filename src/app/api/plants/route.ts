import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { describeServerError, toPlantView } from "@/lib/gardenService";
import { getPlantSpeciesData } from "@/lib/plantData";
import { GROWTH_STAGES } from "@/lib/types";

export const dynamic = "force-dynamic";

/** POST /api/plants { species, name?, growthStage? } — add a plant to the garden. */
export async function POST(request: Request) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Please log in first." }, { status: 401 });

  let body: { species?: unknown; name?: unknown; growthStage?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const entry = typeof body.species === "string" ? getPlantSpeciesData(body.species) : null;
  if (!entry) return NextResponse.json({ error: "Please choose a supported plant." }, { status: 400 });

  const stage =
    typeof body.growthStage === "string" && (GROWTH_STAGES as readonly string[]).includes(body.growthStage)
      ? body.growthStage
      : "Sprout";
  const name =
    typeof body.name === "string" && body.name.trim() ? body.name.trim().slice(0, 40) : entry.name;

  try {
    const garden = await prisma.garden.findFirst({ where: { user: { email: auth.email } } });
    if (!garden) return NextResponse.json({ error: "Create your garden first." }, { status: 409 });
    const plant = await prisma.plant.create({
      data: { gardenId: garden.id, name, species: entry.name, growthStage: stage, healthState: "happy" },
    });
    return NextResponse.json({ ok: true, plant: toPlantView(plant) });
  } catch (err) {
    console.error("[api/plants POST]", err);
    return NextResponse.json({ error: describeServerError(err) }, { status: 500 });
  }
}
