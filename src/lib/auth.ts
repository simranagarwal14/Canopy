import { createSupabaseServer } from "./supabaseServer";

export interface AuthedUser {
  id: string;
  email: string;
  name: string;
}

/** The logged-in Supabase user (verified with Supabase), or null. */
export async function getAuthUser(): Promise<AuthedUser | null> {
  try {
    const supabase = await createSupabaseServer();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user || !data.user.email) return null;
    const meta = data.user.user_metadata as { name?: unknown } | undefined;
    const name =
      typeof meta?.name === "string" && meta.name.trim()
        ? meta.name.trim()
        : data.user.email.split("@")[0];
    return { id: data.user.id, email: data.user.email.toLowerCase(), name };
  } catch {
    return null;
  }
}
