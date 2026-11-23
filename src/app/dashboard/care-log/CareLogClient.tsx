"use client";

import Link from "next/link";
import { Fragment, useState, useSyncExternalStore } from "react";
import { ChevronDown, Trash2 } from "lucide-react";
import { HealthBadge } from "@/components/HealthBadge";
import { LocalTime } from "@/components/LocalTime";
import { dueLabel, scheduleFor, type DueTone } from "@/lib/careSchedule";
import { getPlantSpeciesData } from "@/lib/plantData";
import type { DimensionEvaluation, PlantView, TaskType } from "@/lib/types";

/** Column order requested for the table. */
const TASK_COLUMNS: Array<{ type: TaskType; title: string }> = [
  { type: "water", title: "Water" },
  { type: "soil", title: "Soil" },
  { type: "sunlight", title: "Sunlight" },
];

const TASK_NAME: Record<TaskType, string> = {
  water: "Watering",
  soil: "Manure & fertilizer",
  sunlight: "Sunlight shift",
};

/**
 * Re-renders every 30s so tick marks flip at midnight without a reload. Returns null on the
 * server and during hydration (time zone unknown), then the current time on the client.
 */
function subscribe(onChange: () => void) {
  const id = setInterval(onChange, 30_000);
  return () => clearInterval(id);
}
const clientTick = () => Math.floor(Date.now() / 30_000);
const serverTick = () => 0;
function useNow(): Date | null {
  const tick = useSyncExternalStore(subscribe, clientTick, serverTick);
  return tick === 0 ? null : new Date(tick * 30_000);
}

const TONE_CLASS: Record<DueTone, string> = {
  later: "bg-sand-soft text-ink",
  today: "bg-lotus text-ink",
  overdue: "bg-danger text-white",
};

interface CellProps {
  plant: PlantView;
  dim: DimensionEvaluation;
  now: Date | null;
  disabled: boolean;
  working: boolean;
  onToggle: (checked: boolean) => void;
}

function TaskCell({ plant, dim, now, disabled, working, onToggle }: CellProps) {
  // Before the client clock is known, fall back to the server's evaluation (no due badge yet).
  const schedule = now ? scheduleFor(dim.lastDone, plant.createdAt, dim.intervalDays, now) : null;
  const checked = schedule ? schedule.checked : dim.doneThisCycle;
  const due = schedule ? dueLabel(schedule.daysUntilDue) : null;
  const id = `${plant.id}-${dim.taskType}`;

  return (
    <td className="px-3 py-3 align-top">
      <div className="flex items-start gap-2.5">
        <input
          id={id}
          type="checkbox"
          className="tick mt-0.5"
          checked={checked}
          disabled={disabled || working}
          onChange={() => onToggle(checked)}
          aria-label={`${TASK_NAME[dim.taskType]} for ${plant.name}`}
          title={checked ? "Done — click to undo" : "Click when you've done this"}
        />
        <div className="min-w-0 text-xs leading-snug" aria-live="polite">
          {working ? (
            <span className="font-semibold">Saving…</span>
          ) : (
            <>
              {checked && dim.lastDone && (
                <span className="block whitespace-nowrap font-semibold text-ink">
                  <LocalTime iso={dim.lastDone} short />
                </span>
              )}
              {due ? (
                <span className={`mt-1 inline-block whitespace-nowrap rounded-full border-2 border-inkline px-2 py-px font-bold ${TONE_CLASS[due.tone]}`}>
                  {due.text}
                </span>
              ) : (
                <span className="mt-1 inline-block h-5 w-16" aria-hidden="true" />
              )}
            </>
          )}
        </div>
      </div>
    </td>
  );
}

function Note({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="font-sans text-xs font-bold uppercase tracking-wide text-muted">{title}</h4>
      <p className="mt-1 text-sm">{children}</p>
    </div>
  );
}

const NOT_IN_FILE = <span className="text-muted">Not in the plant file yet.</span>;

export function CareLogClient({ initialPlants }: { initialPlants: PlantView[] }) {
  const now = useNow();
  const [plants, setPlants] = useState<PlantView[]>(initialPlants);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState<string | null>(null); // `${plantId}:${task}` or `${plantId}:delete`
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  async function toggleTask(plant: PlantView, task: TaskType, currentlyChecked: boolean) {
    setError(null);
    setBusy(`${plant.id}:${task}`);
    try {
      const res = await fetch("/api/care-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plantId: plant.id, taskType: task, action: currentlyChecked ? "undo" : "complete" }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; plant?: PlantView };
      if (!res.ok || !data.plant) {
        setError(data.error ?? "Couldn't save that task. Please try again.");
        return;
      }
      const updated = data.plant;
      setPlants((prev) => prev.map((p) => (p.id === plant.id ? updated : p)));
      setStatus(`${TASK_NAME[task]} ${currentlyChecked ? "undone" : "logged"} for ${plant.name}.`);
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setBusy(null);
    }
  }

  async function deletePlant(plant: PlantView) {
    if (!window.confirm(`Delete ${plant.name}? This also removes its care history and can't be undone.`)) return;
    setError(null);
    setBusy(`${plant.id}:delete`);
    try {
      const res = await fetch(`/api/plants/${encodeURIComponent(plant.id)}`, { method: "DELETE" });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Couldn't delete that plant.");
        return;
      }
      setPlants((prev) => prev.filter((p) => p.id !== plant.id));
      setStatus(`${plant.name} was deleted.`);
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setBusy(null);
    }
  }

  if (plants.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="font-display text-xl font-semibold">No plants to care for yet</p>
        <p className="mt-1 text-sm text-muted">
          Add one in the{" "}
          <Link href="/dashboard/inventory" className="font-bold text-moss underline">Inventory</Link>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div aria-live="polite">
        {error && (
          <p role="alert" className="rounded-xl border-2 border-danger bg-[#fbe9e4] px-4 py-3 text-sm font-medium text-danger">
            {error}
          </p>
        )}
      </div>
      <p className="sr-only" role="status">{status}</p>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-left text-sm">
            <caption className="sr-only">Care schedule for each plant in your garden</caption>
            <thead className="bg-sand-soft/70">
              <tr className="border-b-2 border-inkline text-xs uppercase tracking-wide text-muted">
                <th scope="col" className="px-3 py-3 font-bold">Plant</th>
                <th scope="col" className="px-3 py-3 font-bold">Plant name</th>
                {TASK_COLUMNS.map((c) => (
                  <th key={c.type} scope="col" className="px-3 py-3 font-bold">{c.title}</th>
                ))}
                <th scope="col" className="px-3 py-3 text-right font-bold">Care notes</th>
              </tr>
            </thead>
            <tbody>
              {plants.map((plant) => {
                const dead = plant.healthState === "dead";
                const entry = getPlantSpeciesData(plant.species);
                const isOpen = !!open[plant.id];
                const panelId = `notes-${plant.id}`;
                return (
                  <Fragment key={plant.id}>
                    <tr className={`border-b border-inkline/20 ${isOpen ? "bg-sand-soft/40" : "hover:bg-sand-soft/30"}`}>
                      <th scope="row" className="px-3 py-3 text-left align-top font-normal">
                        <span className="block font-bold">{plant.species}</span>
                        <span className="block text-xs text-muted">{plant.growthStage}</span>
                      </th>
                      <td className="px-3 py-3 align-top">
                        <span className="block font-display text-base font-bold leading-tight">{plant.name}</span>
                        <span className="mt-1 inline-block"><HealthBadge state={plant.healthState} /></span>
                      </td>
                      {TASK_COLUMNS.map(({ type }) => {
                        const dim = plant.health.dimensions.find((d) => d.taskType === type)!;
                        return (
                          <TaskCell
                            key={type}
                            plant={plant}
                            dim={dim}
                            now={now}
                            disabled={dead || busy !== null}
                            working={busy === `${plant.id}:${type}`}
                            onToggle={(checked) => toggleTask(plant, type, checked)}
                          />
                        );
                      })}
                      <td className="px-3 py-3 text-right align-top">
                        <button
                          type="button"
                          onClick={() => setOpen((o) => ({ ...o, [plant.id]: !o[plant.id] }))}
                          aria-expanded={isOpen}
                          aria-controls={panelId}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-moss hover:bg-sand-soft"
                        >
                          {isOpen ? "Hide" : "Details"}
                          <ChevronDown size={15} aria-hidden="true" className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
                        </button>
                      </td>
                    </tr>

                    {isOpen && (
                      <tr id={panelId} className="border-b-2 border-inkline/30 bg-sand-soft/40">
                        <td colSpan={6} className="px-4 py-4">
                          {dead && (
                            <p role="status" className="mb-3 rounded-xl border-2 border-inkline bg-[#efe3dc] px-3 py-2 text-sm font-medium">
                              This plant has died from neglect — delete it and plant a fresh one.
                            </p>
                          )}
                          <div className="grid gap-4 md:grid-cols-3">
                            <Note title={`Watering · every ${plant.health.dimensions[0].intervalDays}d`}>
                              {entry?.wateringNotes ?? NOT_IN_FILE}
                            </Note>
                            <Note title={`Manure & fertilizer · every ${plant.health.dimensions.find((d) => d.taskType === "soil")!.intervalDays}d`}>
                              {entry?.fertilizerNotes ?? NOT_IN_FILE}
                            </Note>
                            <Note title={`Sunlight${entry?.sunlightHoursPerDay ? ` · ${entry.sunlightHoursPerDay}` : ""}`}>
                              {entry?.sunlightRule ?? NOT_IN_FILE}
                            </Note>
                          </div>

                          <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-inkline/20 pt-3">
                            <div className="min-w-0 flex-1 text-sm">
                              <p className="font-semibold">{plant.health.summary}</p>
                              <ul className="mt-1 list-disc space-y-0.5 pl-5 text-xs text-muted">
                                {plant.health.reasons.map((r) => (
                                  <li key={r}>{r}</li>
                                ))}
                              </ul>
                            </div>
                            <button
                              type="button"
                              onClick={() => deletePlant(plant)}
                              disabled={busy !== null}
                              className="btn btn-ghost !py-2 text-sm text-danger"
                            >
                              <Trash2 size={15} aria-hidden="true" />
                              {busy === `${plant.id}:delete` ? "Deleting…" : "Delete plant"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-xs text-muted">
        A ticked task stays ticked until the day it&apos;s due again. Tick it again after doing it — or click a tick to undo a slip.
      </p>
    </div>
  );
}
