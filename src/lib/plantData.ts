import rawData from "../../data/plants.json";

/**
 * One entry in data/plants.json. Only `name` is required — every other field is
 * optional so you can grow the file gradually. Rootly never invents a value for a
 * field that is missing here; it says the detail isn't in the plant file yet.
 */
export interface PlantEntry {
  name: string;
  aliases: string[];
  scientificName?: string;
  wateringIntervalDays?: number;
  wateringNotes?: string;
  sunlightAdjustIntervalDays?: number;
  sunlightHoursPerDay?: string;
  sunlightRule?: string;
  fertilizerIntervalDays?: number;
  fertilizerNotes?: string;
  lightNotes?: string;
  humidityNotes?: string;
  soilNotes?: string;
  careTips: string[];
}

type Json = Record<string, unknown>;

const isObj = (v: unknown): v is Json => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown): string | undefined =>
  typeof v === "string" && v.trim() ? v.trim() : undefined;
const num = (v: unknown): number | undefined =>
  typeof v === "number" && Number.isFinite(v) && v > 0 ? v : undefined;
const strList = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && !!x.trim()) : [];

function normalizeEntry(r: Json, fallbackName?: string): PlantEntry | null {
  const name = str(r.name) ?? str(r.species) ?? fallbackName;
  if (!name) return null;
  return {
    name,
    aliases: strList(r.aliases),
    scientificName: str(r.scientificName),
    wateringIntervalDays: num(r.wateringIntervalDays),
    wateringNotes: str(r.wateringNotes),
    sunlightAdjustIntervalDays: num(r.sunlightAdjustIntervalDays),
    sunlightHoursPerDay: str(r.sunlightHoursPerDay),
    sunlightRule: str(r.sunlightRule),
    fertilizerIntervalDays: num(r.fertilizerIntervalDays),
    fertilizerNotes: str(r.fertilizerNotes),
    lightNotes: str(r.lightNotes),
    humidityNotes: str(r.humidityNotes),
    soilNotes: str(r.soilNotes),
    careTips: strList(r.careTips),
  };
}

/** Accepts `{ plants: [...] }`, a bare array, or an object keyed by plant name. */
function loadEntries(data: unknown): PlantEntry[] {
  let list: Array<[Json, string | undefined]> = [];
  if (Array.isArray(data)) {
    list = data.filter(isObj).map((o) => [o, undefined]);
  } else if (isObj(data)) {
    const plants = data.plants;
    if (Array.isArray(plants)) {
      list = plants.filter(isObj).map((o) => [o, undefined]);
    } else if (isObj(plants)) {
      list = Object.entries(plants).filter(([, v]) => isObj(v)).map(([k, v]) => [v as Json, k]);
    } else {
      // Object keyed directly by plant name (ignoring metadata like "version"/"notes")
      list = Object.entries(data).filter(([, v]) => isObj(v)).map(([k, v]) => [v as Json, k]);
    }
  }
  const out: PlantEntry[] = [];
  const seen = new Set<string>();
  for (const [obj, fallback] of list) {
    const entry = normalizeEntry(obj, fallback);
    if (entry && !seen.has(entry.name.toLowerCase())) {
      seen.add(entry.name.toLowerCase());
      out.push(entry);
    }
  }
  return out;
}

const ENTRIES: PlantEntry[] = loadEntries(rawData);

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();

function keysOf(entry: PlantEntry): string[] {
  return [entry.name, ...entry.aliases].map(norm).filter(Boolean);
}

/** Every plant in data/plants.json. */
export function getAllSupportedPlants(): PlantEntry[] {
  return ENTRIES;
}

export function getSupportedPlantNames(): string[] {
  return ENTRIES.map((e) => e.name);
}

/** Exact (case-insensitive) lookup by plant name or alias. */
export function getPlantSpeciesData(species: string): PlantEntry | null {
  const q = norm(species);
  if (!q) return null;
  return ENTRIES.find((e) => keysOf(e).includes(q)) ?? null;
}

/**
 * Find a supported plant mentioned anywhere in free text
 * ("how often should I water my tulsi?"). Longest name/alias wins.
 */
export function findPlantInData(query: string): PlantEntry | null {
  const text = ` ${norm(query)} `;
  let best: { entry: PlantEntry; len: number } | null = null;
  for (const entry of ENTRIES) {
    for (const key of keysOf(entry)) {
      const variants = new Set([key, `${key}s`, `${key}es`]);
      for (const v of variants) {
        if (text.includes(` ${v} `) && (!best || key.length > best.len)) {
          best = { entry, len: key.length };
        }
      }
    }
  }
  return best?.entry ?? null;
}
