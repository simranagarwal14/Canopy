import { getPlantSpeciesData } from "./plantData";
import type {
  DimensionEvaluation,
  DimensionLevel,
  HealthEvaluation,
  HealthState,
  TaskType,
} from "./types";

const DAY_MS = 86_400_000;

/** Used when a species isn't in data/plants.json or lacks an interval. */
export const DEFAULT_INTERVALS: Record<TaskType, number> = {
  water: 3,
  sunlight: 7,
  soil: 30,
};

/** Overdue up to this fraction of an interval is still "normal" (grace window). */
const GRACE_RATIO = 0.25;
/** Overdue by more than this many whole intervals => the task is neglected. */
const NEGLECT_RATIO = 2;
/** …or by this many days regardless of interval. */
const NEGLECT_DAYS = 7;
/** Severe neglect of an essential task (water / sunlight) => dead. */
const DEAD_SINGLE_DAYS = 21;
const DEAD_BOTH_DAYS = 14;

const LABELS: Record<TaskType, string> = {
  water: "Watering",
  sunlight: "Sunlight shift",
  soil: "Manure & fertilizer",
};

export interface HealthInput {
  species: string;
  createdAt: Date;
  lastWatered: Date | null;
  lastSunMoved: Date | null;
  lastFertilized: Date | null;
}

export function resolveIntervals(species: string): {
  intervals: Record<TaskType, number>;
  usedDefault: Record<TaskType, boolean>;
} {
  const data = getPlantSpeciesData(species);
  const water = data?.wateringIntervalDays;
  const sun = data?.sunlightAdjustIntervalDays;
  const soil = data?.fertilizerIntervalDays;
  return {
    intervals: {
      water: water ?? DEFAULT_INTERVALS.water,
      sunlight: sun ?? DEFAULT_INTERVALS.sunlight,
      soil: soil ?? DEFAULT_INTERVALS.soil,
    },
    usedDefault: { water: !water, sunlight: !sun, soil: !soil },
  };
}

/** "3 days", "1 day", "5 hours" — for human-readable reasons. */
export function humanDuration(days: number): string {
  if (days < 1) {
    const hours = Math.max(1, Math.round(days * 24));
    return `${hours} hour${hours === 1 ? "" : "s"}`;
  }
  const d = Math.round(days);
  return `${d} day${d === 1 ? "" : "s"}`;
}

function evaluateDimension(
  taskType: TaskType,
  last: Date | null,
  createdAt: Date,
  intervalDays: number,
  usedDefault: boolean,
  now: Date,
): DimensionEvaluation {
  const anchor = last ?? createdAt;
  const daysSince = Math.max(0, (now.getTime() - anchor.getTime()) / DAY_MS);
  const overdueDays = Math.max(0, daysSince - intervalDays);
  const ratio = overdueDays / intervalDays;

  let level: DimensionLevel;
  if (overdueDays <= 0) level = "ontime";
  else if (ratio <= GRACE_RATIO) level = "grace";
  else if (ratio > NEGLECT_RATIO || overdueDays >= NEGLECT_DAYS) level = "neglected";
  else level = "overdue";

  const label = LABELS[taskType];
  const every = `every ${humanDuration(intervalDays)}`;
  let message: string;
  if (level === "ontime") {
    const left = intervalDays - daysSince;
    message = last
      ? `${label} is up to date (${every}); next due in ${humanDuration(left)}.`
      : `${label} hasn't been logged yet, but isn't due until ${humanDuration(left)} from planting (${every}).`;
  } else if (level === "grace") {
    message = `${label} is just due (${every}) — ${humanDuration(overdueDays)} past the schedule.`;
  } else if (level === "overdue") {
    message = `${label} is ${humanDuration(overdueDays)} overdue (${every}).`;
  } else {
    message = `${label} has been neglected — ${humanDuration(overdueDays)} overdue (${every}).`;
  }

  return {
    taskType,
    label,
    intervalDays,
    usedDefault,
    lastDone: last ? last.toISOString() : null,
    everLogged: last !== null,
    daysSince,
    overdueDays,
    level,
    nextDueAt: new Date(anchor.getTime() + intervalDays * DAY_MS).toISOString(),
    doneThisCycle: last !== null && daysSince <= intervalDays,
    message,
  };
}

/**
 * Evaluate a plant's health from its three care timestamps against the species'
 * ideal intervals (data/plants.json, with sensible defaults).
 *
 *  dancing  — every task has been logged and none is overdue
 *  happy    — nothing meaningfully overdue (inside the grace window / still on schedule)
 *  sad      — one or two tasks overdue (≈ 1–2 missed intervals)
 *  browning — a task neglected for many cycles (>2 intervals or ≥7 days), or all three overdue
 *  dead     — water or sunlight ≥21 days past due, or both ≥14 days past due
 */
export function evaluatePlantHealth(input: HealthInput, now: Date = new Date()): HealthEvaluation {
  const { intervals, usedDefault } = resolveIntervals(input.species);

  const water = evaluateDimension("water", input.lastWatered, input.createdAt, intervals.water, usedDefault.water, now);
  const sunlight = evaluateDimension("sunlight", input.lastSunMoved, input.createdAt, intervals.sunlight, usedDefault.sunlight, now);
  const soil = evaluateDimension("soil", input.lastFertilized, input.createdAt, intervals.soil, usedDefault.soil, now);
  const dimensions = [water, sunlight, soil];

  const pastGrace = dimensions.filter((d) => d.level === "overdue" || d.level === "neglected");
  const neglected = dimensions.filter((d) => d.level === "neglected");

  let state: HealthState;
  let summary: string;

  const dead =
    water.overdueDays >= DEAD_SINGLE_DAYS ||
    sunlight.overdueDays >= DEAD_SINGLE_DAYS ||
    (water.overdueDays >= DEAD_BOTH_DAYS && sunlight.overdueDays >= DEAD_BOTH_DAYS);

  if (dead) {
    state = "dead";
    summary = "This plant has died from prolonged neglect of its essential care.";
  } else if (neglected.length > 0 || pastGrace.length === 3) {
    state = "browning";
    summary = "Care has been neglected for too long — the leaves are browning. Catch up on the overdue tasks now.";
  } else if (pastGrace.length > 0) {
    state = "sad";
    summary = `${pastGrace.length === 1 ? "A care task is" : "Some care tasks are"} overdue — your plant is feeling sad.`;
  } else if (dimensions.every((d) => d.level === "ontime" && d.everLogged)) {
    state = "dancing";
    summary = "Water, sunlight and soil are all freshly cared for — your plant is dancing!";
  } else {
    state = "happy";
    summary = "Care is within the normal schedule — your plant is happy.";
  }

  const reasons = dimensions.map((d) => d.message);
  return { state, summary, reasons, dimensions };
}
