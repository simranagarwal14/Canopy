import Link from "next/link";
import { CloudSun, Droplets, Home, Mountain, PlusCircle, type LucideIcon } from "lucide-react";
import { ErrorPanel, PageHeader } from "@/components/PageHeader";
import { HealthBadge } from "@/components/HealthBadge";
import { PlantSprite } from "@/components/PlantSprite";
import {
  describeHumidity,
  describePlacement,
  describeSoil,
  describeSunlight,
  type GardenOption,
} from "@/lib/gardenOptions";
import { loadGardenPage } from "@/lib/serverGuards";

export const dynamic = "force-dynamic";

function Metric({
  icon: Icon,
  title,
  option,
  fallback,
  tone,
}: {
  icon: LucideIcon;
  title: string;
  option?: GardenOption;
  fallback: string;
  tone: string;
}) {
  return (
    <section className="card p-4" aria-label={title}>
      <div className="flex items-center gap-2.5">
        <span className={`grid h-9 w-9 place-items-center rounded-xl border-2 border-inkline ${tone}`}>
          <Icon size={18} aria-hidden="true" />
        </span>
        <h2 className="font-sans text-xs font-bold uppercase tracking-wide text-muted">{title}</h2>
      </div>
      <p className="mt-2.5 font-display text-lg font-semibold leading-snug">{option?.label ?? fallback}</p>
      <ul className="mt-1.5 space-y-0.5 text-xs text-muted">
        {option?.details.map((d) => (
          <li key={d}>{d}</li>
        ))}
      </ul>
    </section>
  );
}

export default async function VirtualGardenPage() {
  const data = await loadGardenPage();
  if (!data.ok) return <ErrorPanel message={data.error} />;
  const { user, overview } = data;
  const { garden, plants } = overview;

  return (
    <>
      <PageHeader
        title="Virtual Garden"
        subtitle={`Welcome back, ${user.name}. Here's the little corner of the world your plants call home.`}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={Droplets} title="Humidity" option={describeHumidity(garden.humidity)} fallback={garden.humidity} tone="bg-pond" />
        <Metric icon={CloudSun} title="Sunlight" option={describeSunlight(garden.sunlight)} fallback={garden.sunlight} tone="bg-sand" />
        <Metric icon={Mountain} title="Soil" option={describeSoil(garden.soiltype)} fallback={garden.soiltype} tone="bg-lotus" />
        <Metric icon={Home} title="Placement" option={describePlacement(garden.placement)} fallback={garden.placement} tone="bg-leaf" />
      </div>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Your plants</h2>
        <Link href="/dashboard/inventory" className="btn btn-ghost !py-2 text-sm">
          <PlusCircle size={16} aria-hidden="true" /> Add plant
        </Link>
      </div>

      {plants.length === 0 ? (
        <div className="card mt-4 p-8 text-center">
          <p className="font-display text-xl font-semibold">Your garden is empty</p>
          <p className="mt-1 text-sm text-muted">Add your first plant from the Inventory.</p>
        </div>
      ) : (
        <ul className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {plants.map((plant) => (
            <li key={plant.id} className="card overflow-hidden">
              <div className="flex items-start justify-between gap-3 p-4 pb-0">
                <div className="min-w-0">
                  <h3 className="truncate font-display text-xl font-bold">{plant.name}</h3>
                  <p className="text-xs text-muted">
                    {plant.species} · {plant.growthStage}
                  </p>
                </div>
                <HealthBadge state={plant.healthState} />
              </div>
              <div className="flex justify-center px-4 pt-3">
                <PlantSprite species={plant.species} state={plant.healthState} size={150} />
              </div>
              <div className="plank h-4" aria-hidden="true" />
              <div className="p-4">
                <p className="text-sm">{plant.health.summary}</p>
                <Link
                  href="/dashboard/care-log"
                  className="mt-3 inline-block text-sm font-bold text-moss underline decoration-2 underline-offset-4 hover:text-lotus"
                >
                  Open care log →
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
