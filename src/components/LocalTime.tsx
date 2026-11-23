/** Formats an ISO timestamp in the viewer's own locale + time zone, e.g. "22 Nov 2026, 9:42 pm". */
export function formatTimestamp(iso: string, short = false): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    ...(short ? {} : { year: "numeric" }),
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Server and browser can be in different time zones, so the text is allowed to differ
 * between server render and hydration (suppressHydrationWarning).
 */
export function LocalTime({ iso, className, short }: { iso: string; className?: string; short?: boolean }) {
  return (
    <time dateTime={iso} className={className} suppressHydrationWarning>
      {formatTimestamp(iso, short)}
    </time>
  );
}
