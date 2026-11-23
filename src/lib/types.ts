export const HEALTH_STATES = ["dancing", "happy", "sad", "browning", "dead"] as const;
export type HealthState = (typeof HEALTH_STATES)[number];

export const TASK_TYPES = ["water", "sunlight", "soil"] as const;
export type TaskType = (typeof TASK_TYPES)[number];

export const GROWTH_STAGES = ["Seed", "Sprout", "Mature", "Grafted"] as const;
export type GrowthStage = (typeof GROWTH_STAGES)[number];

export type DimensionLevel = "ontime" | "grace" | "overdue" | "neglected";

export interface DimensionEvaluation {
  taskType: TaskType;
  label: string;
  intervalDays: number;
  /** True when the interval came from the built-in default (species data missing it). */
  usedDefault: boolean;
  lastDone: string | null;
  /** Has the user ever explicitly logged this task? */
  everLogged: boolean;
  daysSince: number;
  overdueDays: number;
  level: DimensionLevel;
  nextDueAt: string;
  /** Logged within the current cycle — drives the tick in the care log. */
  doneThisCycle: boolean;
  message: string;
}

export interface HealthEvaluation {
  state: HealthState;
  summary: string;
  reasons: string[];
  dimensions: DimensionEvaluation[];
}

/** A plant as the UI consumes it — fully JSON-serialisable. */
export interface PlantView {
  id: string;
  name: string;
  species: string;
  growthStage: string;
  healthState: HealthState;
  createdAt: string;
  lastWatered: string | null;
  lastSunMoved: string | null;
  lastFertilized: string | null;
  health: HealthEvaluation;
}

export interface GardenView {
  id: string;
  humidity: string;
  sunlight: string;
  soiltype: string;
  placement: string;
}
