import { ErrorPanel, PageHeader } from "@/components/PageHeader";
import { loadGardenPage } from "@/lib/serverGuards";
import { CareLogClient } from "./CareLogClient";

export const dynamic = "force-dynamic";

export default async function CareLogPage() {
  const data = await loadGardenPage();
  if (!data.ok) return <ErrorPanel message={data.error} />;

  return (
    <>
      <PageHeader
        title="Plant Care Log"
        subtitle="One row per plant. Tick a task when you do it — it stays ticked until it's due again, and your plant's mood updates right away."
      />
      <CareLogClient initialPlants={data.overview.plants} />
    </>
  );
}
