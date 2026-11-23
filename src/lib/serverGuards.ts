import { redirect } from "next/navigation";
import { getAuthUser, type AuthedUser } from "./auth";
import { describeServerError, getGardenOverview, type GardenOverview } from "./gardenService";

export type GardenPageData =
  | { ok: true; user: AuthedUser; overview: GardenOverview }
  | { ok: false; user: AuthedUser; error: string };

/**
 * For dashboard pages: requires a logged-in user, sends users without a garden to
 * onboarding, and turns database failures into a readable message instead of a crash.
 */
export async function loadGardenPage(): Promise<GardenPageData> {
  const user = await getAuthUser();
  if (!user) redirect("/");

  let overview: GardenOverview | null = null;
  let error: string | null = null;
  try {
    overview = await getGardenOverview(user.email);
  } catch (err) {
    console.error("[loadGardenPage]", err);
    error = describeServerError(err);
  }

  if (error) return { ok: false, user, error };
  if (!overview) redirect("/onboarding");
  return { ok: true, user, overview };
}
