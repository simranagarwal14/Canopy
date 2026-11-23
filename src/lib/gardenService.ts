import type { Plant } from "@prisma/client";
import { prisma } from "./prisma";
import { evaluatePlantHealth } from "./healthAlgorithm";
import type { AuthedUser } from "./auth";
import type { GardenView, HealthState, PlantView } from "./types";

/** Ensure a User row exists for the authenticated Supabase user. */
export async function ensureDbUser(auth: AuthedUser) {
  return prisma.user.upsert({
    where: { email: auth.email },
    update: { name: auth.name },
    create: { id: auth.id, email: auth.email, name: auth.name },
  });
}

export function toPlantView(plant: Plant, now: Date = new Date()): PlantView {
  const health = evaluatePlantHealth(plant, now);
  return {
    id: plant.id,
    name: plant.name,
    species: plant.species,
    growthStage: plant.growthStage,
    healthState: health.state,
    createdAt: plant.createdAt.toISOString(),
    lastWatered: plant.lastWatered?.toISOString() ?? null,
    lastSunMoved: plant.lastSunMoved?.toISOString() ?? null,
    lastFertilized: plant.lastFertilized?.toISOString() ?? null,
    health,
  };
}

/**
 * Health decays with time even when nobody logs anything, so whenever plants are
 * read we recompute their state and persist it if it changed.
 */
export async function refreshPlants(plants: Plant[]): Promise<PlantView[]> {
  const now = new Date();
  const views: PlantView[] = [];
  for (const plant of plants) {
    const view = toPlantView(plant, now);
    if (view.healthState !== (plant.healthState as HealthState)) {
      await prisma.plant.update({ where: { id: plant.id }, data: { healthState: view.healthState } });
    }
    views.push(view);
  }
  return views;
}

export interface GardenOverview {
  garden: GardenView;
  plants: PlantView[];
}

/** The user's garden + plants (with refreshed health), or null if they haven't onboarded. */
export async function getGardenOverview(email: string): Promise<GardenOverview | null> {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { garden: { include: { plants: { orderBy: { createdAt: "asc" } } } } },
  });
  const garden = user?.garden;
  if (!garden) return null;
  const plants = await refreshPlants(garden.plants);
  return {
    garden: {
      id: garden.id,
      humidity: garden.humidity,
      sunlight: garden.sunlight,
      soiltype: garden.soiltype,
      placement: garden.placement,
    },
    plants,
  };
}

/** Friendly message for common infrastructure failures. */
export function describeServerError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes("DATABASE_URL")) return msg;
  if (/ECONNREFUSED|ENOTFOUND|ETIMEDOUT|timeout|Can't reach database|password authentication/i.test(msg)) {
    return "Couldn't reach the database. Check DATABASE_URL in .env (and that you ran `npx prisma db push`).";
  }
  if (/does not exist|relation .* does not exist|P2021/i.test(msg)) {
    return "Database tables are missing. Run `npx prisma db push` and try again.";
  }
  return "Something went wrong on the server. Check the terminal running `npm run dev` for details.";
}
