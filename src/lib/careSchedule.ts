const DAY_MS = 86_400_000;

export interface TaskSchedule {
  /** Shown as ticked: the task was logged and its next due DAY hasn't started yet. */
  checked: boolean;
  /** Whole calendar days until the task is due again (0 = due today, negative = overdue). */
  daysUntilDue: number;
}

/** Local-midnight timestamp of the calendar day containing `d`. */
function startOfLocalDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/**
 * Schedule-aware checkbox rule, in the viewer's own time zone:
 *
 *   due day = calendar day of (last done + interval)
 *   ticked  = every day BEFORE the due day
 *   due day onwards = unticked again, so you know to do it anew
 *
 * e.g. watered Mon 9 pm with a 2-day interval -> ticked Mon + Tue, "Due today" and unticked Wed.
 * A task that was never logged is never ticked; its countdown runs from the planting date.
 */
export function scheduleFor(
  lastDone: string | null,
  plantedAt: string,
  intervalDays: number,
  now: Date,
): TaskSchedule {
  const anchor = new Date(lastDone ?? plantedAt);
  const dueDay = startOfLocalDay(new Date(anchor.getTime() + intervalDays * DAY_MS));
  const today = startOfLocalDay(now);
  const daysUntilDue = Math.round((dueDay - today) / DAY_MS); // round() absorbs DST 23/25h days
  return { checked: lastDone !== null && daysUntilDue > 0, daysUntilDue };
}

export type DueTone = "later" | "today" | "overdue";

export function dueLabel(daysUntilDue: number): { text: string; tone: DueTone } {
  if (daysUntilDue > 0) return { text: `Due in ${daysUntilDue}d`, tone: "later" };
  if (daysUntilDue === 0) return { text: "Due today", tone: "today" };
  return { text: `Overdue by ${-daysUntilDue}d`, tone: "overdue" };
}
