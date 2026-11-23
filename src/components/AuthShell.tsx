import { CanopyLogo } from "./CanopyLogo";
import { PondScene } from "./PondScene";

/** Shared frame for Login / Sign Up: shop awning on top, pond at the bottom. */
export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="awning" aria-hidden="true" />
      <main className="relative z-10 flex flex-1 items-start justify-center px-4 pb-40 pt-14 sm:items-center sm:pt-8">
        <div className="card w-full max-w-md p-7 sm:p-9">
          <h1 className="text-center font-display text-4xl font-bold text-ink">{title}</h1>
          <div className="mt-3 flex flex-col items-center gap-1">
            <CanopyLogo size={76} />
            <p className="font-display text-xl font-semibold text-moss">Canopy</p>
            {subtitle && <p className="text-center text-sm text-muted">{subtitle}</p>}
          </div>
          <div className="mt-6">{children}</div>
        </div>
      </main>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0">
        <PondScene />
      </div>
    </div>
  );
}
