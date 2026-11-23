import { ExternalLink } from "lucide-react";
import { SUPPLY_SHELVES, shopLinks, type SupplyIconKind } from "@/lib/supplies";

const INK = "#1E3A29";

/** Small hand-drawn icons, one per shelf. */
function SupplyIcon({ kind }: { kind: SupplyIconKind }) {
  const common = { stroke: INK, strokeWidth: 2.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg width="56" height="56" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      {kind === "hose" && (
        <g {...common}>
          <circle cx="30" cy="34" r="20" fill="#529471" />
          <circle cx="30" cy="34" r="13" fill="#fffdf7" />
          <circle cx="30" cy="34" r="6" fill="#529471" />
          <path d="M48 44 C56 44 58 52 52 56 L44 56" fill="none" />
          <rect x="40" y="52" width="10" height="7" rx="2" fill="#d9b77e" />
        </g>
      )}
      {kind === "soil" && (
        <g {...common}>
          <path d="M10 28 H54 L50 58 H14 Z" fill="#8b6a45" />
          <path d="M10 28 L16 14 H48 L54 28 Z" fill="#c9774f" />
          <path d="M22 38 q4 -4 8 0 t8 0" fill="none" stroke="#efe0be" />
          <circle cx="24" cy="48" r="2" fill="#efe0be" stroke="none" />
          <circle cx="40" cy="46" r="2" fill="#efe0be" stroke="none" />
        </g>
      )}
      {kind === "compost" && (
        <g {...common}>
          <path d="M8 56 C8 30 22 16 32 16 C42 16 56 30 56 56 Z" fill="#6b4f33" />
          <path d="M26 20 C26 10 34 8 40 10 C40 18 34 22 26 20 Z" fill="#529471" />
          <path d="M33 20 L36 14" fill="none" />
          <circle cx="22" cy="46" r="2.2" fill="#efe0be" stroke="none" />
          <circle cx="34" cy="40" r="2.2" fill="#efe0be" stroke="none" />
          <circle cx="44" cy="48" r="2.2" fill="#efe0be" stroke="none" />
        </g>
      )}
      {kind === "gloves" && (
        <g {...common}>
          <path d="M16 56 V34 L12 24 Q12 20 16 22 L20 28 V12 Q20 8 24 8 Q28 8 28 12 V26 V8 Q28 4 32 4 Q36 4 36 8 V26 V12 Q36 8 40 8 Q44 8 44 12 V30 L50 24 Q54 22 54 26 L46 46 V56 Z" fill="#e28f83" />
          <path d="M16 48 H46" fill="none" />
        </g>
      )}
      {kind === "can" && (
        <g {...common}>
          <path d="M14 26 H42 L40 54 H16 Z" fill="#8ec9e6" />
          <path d="M42 32 L58 18 L60 22 L44 40" fill="#8ec9e6" />
          <path d="M14 30 C4 30 4 44 14 44" fill="none" />
          <path d="M56 14 L62 10 M58 12 L62 18" fill="none" strokeWidth="2" />
          <path d="M20 26 C22 18 34 18 36 26" fill="none" />
        </g>
      )}
    </svg>
  );
}

/** Wooden shelf rows of gardening supplies, each tile linking to shop searches. */
export function SupplyShelves() {
  return (
    <section aria-labelledby="supplies-heading" className="space-y-8">
      <div>
        <h2 id="supplies-heading" className="font-display text-2xl font-bold">Garden supply shelves</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Handy kit for your garden. The links open shop searches on Amazon.in and Flipkart in a new tab —
          they&apos;re suggestions, not endorsements.
        </p>
      </div>

      {SUPPLY_SHELVES.map((shelf) => (
        <article key={shelf.id} aria-labelledby={`shelf-${shelf.id}`}>
          <div className="mb-3 flex items-baseline gap-3">
            <h3 id={`shelf-${shelf.id}`} className="font-display text-xl font-bold">{shelf.title}</h3>
            <p className="text-sm text-muted">{shelf.blurb}</p>
          </div>

          <ul className="grid gap-x-4 sm:grid-cols-3">
            {shelf.items.map((item) => {
              const links = shopLinks(item.query);
              return (
                <li
                  key={item.name}
                  className="flex flex-col gap-2 rounded-t-2xl border-2 border-b-0 border-inkline bg-surface px-4 pb-4 pt-3"
                >
                  <div className="flex items-start gap-3">
                    <SupplyIcon kind={shelf.icon} />
                    <div className="min-w-0">
                      <h4 className="font-sans text-sm font-bold leading-snug">{item.name}</h4>
                      <p className="mt-1 text-xs text-muted">{item.tip}</p>
                    </div>
                  </div>
                  <div className="mt-auto flex flex-wrap gap-2 pt-1 text-xs font-bold">
                    <a
                      href={links.amazon}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-full border-2 border-inkline bg-sand-soft px-2.5 py-1 hover:bg-sand"
                    >
                      Amazon.in <ExternalLink size={12} aria-hidden="true" />
                      <span className="sr-only">(opens in a new tab) — {item.name}</span>
                    </a>
                    <a
                      href={links.flipkart}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-full border-2 border-inkline bg-pond/50 px-2.5 py-1 hover:bg-pond"
                    >
                      Flipkart <ExternalLink size={12} aria-hidden="true" />
                      <span className="sr-only">(opens in a new tab) — {item.name}</span>
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* the wooden shelf the tiles sit on, with little brackets */}
          <div className="relative">
            <div className="plank h-5 rounded-sm shadow-[0_3px_0_rgba(30,58,41,0.35)]" aria-hidden="true" />
            <div className="absolute left-[12%] top-full h-3 w-5 border-2 border-t-0 border-inkline bg-sand" aria-hidden="true" />
            <div className="absolute right-[12%] top-full h-3 w-5 border-2 border-t-0 border-inkline bg-sand" aria-hidden="true" />
          </div>
        </article>
      ))}
    </section>
  );
}
