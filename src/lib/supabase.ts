import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const SUPABASE_ENV_ERROR =
  "Supabase isn't configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local and restart `npm run dev`.";

let client: SupabaseClient | null = null;

/**
 * Browser Supabase client. Uses @supabase/ssr so the session is stored in cookies —
 * that is what lets API routes and server components know who is logged in.
 */
export function getSupabase(): SupabaseClient {
  if (!url || !anonKey) throw new Error(SUPABASE_ENV_ERROR);
  if (!client) client = createBrowserClient(url, anonKey);
  return client;
}
