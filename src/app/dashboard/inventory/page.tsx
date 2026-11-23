import { ErrorPanel, PageHeader } from "@/components/PageHeader";
import { getSupportedPlantNames } from "@/lib/plantData";
import { loadGardenPage } from "@/lib/serverGuards";
import { InventoryClient } from "./InventoryClient";
import { SupplyShelves } from "./SupplyShelves";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const data = await loadGardenPage();
  if (!data.ok) return <ErrorPanel message={data.error} />;

  return (
    <>
      <PageHeader title="Inventory" subtitle="Everything growing in your garden — add or delete plants, and stock up on supplies from the shelves below." />
      <InventoryClient plants={data.overview.plants} supported={getSupportedPlantNames()} />
      <div className="mt-12">
        <SupplyShelves />
      </div>
    </>
  );
}
