import { PageHeader } from "@/components/PageHeader";
import { getAuthUser } from "@/lib/auth";
import { getGardenOverview } from "@/lib/gardenService";
import { getSupportedPlantNames } from "@/lib/plantData";
import { RootlyChat } from "./RootlyChat";

export const dynamic = "force-dynamic";

export default async function RootlyPage() {
  const user = await getAuthUser();
  let myPlants: string[] = [];
  if (user) {
    try {
      const overview = await getGardenOverview(user.email);
      myPlants = overview?.plants.map((p) => p.species) ?? [];
    } catch {
      myPlants = [];
    }
  }

  return (
    <>
      <PageHeader
        title="Rootly"
        subtitle="Your plant-care helper. Rootly only answers from Canopy's plant file — if something isn't in there yet, it will say so."
      />
      <RootlyChat
        supported={getSupportedPlantNames()}
        myPlants={Array.from(new Set(myPlants))}
        aiConfigured={Boolean(process.env.OPENAI_API_KEY?.trim())}
      />
    </>
  );
}
