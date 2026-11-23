import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { getGardenOverview } from "@/lib/gardenService";
import type { GardenView } from "@/lib/types";
import { getAllSupportedPlants } from "@/lib/plantData";
import { OnboardingForm } from "./OnboardingForm";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  // The proxy already refreshed the session cookie; this just reads who is signed in.
  const user = await getAuthUser();
  if (!user) redirect("/");

  // Returning gardeners get their saved settings pre-filled and a "Skip" button.
  // A database hiccup shouldn't block the form, so failures fall back to the blank first-time form.
  let existing: GardenView | null = null;
  try {
    existing = (await getGardenOverview(user.email))?.garden ?? null;
  } catch {
    existing = null;
  }

  const plants = getAllSupportedPlants().map((p) => p.name);
  return <OnboardingForm userName={user.name} plants={plants} existing={existing} />;
}
