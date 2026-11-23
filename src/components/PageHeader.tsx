export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="mb-7 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-muted sm:text-base">{subtitle}</p>}
      </div>
      {children}
    </header>
  );
}

export function ErrorPanel({ message }: { message: string }) {
  return (
    <div role="alert" className="card border-danger p-6">
      <h2 className="font-display text-xl font-bold text-danger">Something&apos;s not quite right</h2>
      <p className="mt-2 text-sm">{message}</p>
    </div>
  );
}
