"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { LogIn } from "lucide-react";
import { AuthShell } from "@/components/AuthShell";
import { SUPABASE_ENV_ERROR, getSupabase, isSupabaseConfigured } from "@/lib/supabase";

function friendlyLoginError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("email not confirmed")) {
    return "Your email isn't confirmed yet. Check your inbox for the confirmation link — or, while developing, turn off “Confirm email” in Supabase → Authentication → Providers → Email.";
  }
  if (m.includes("invalid login credentials")) {
    return "That email and password don't match an account. Double-check them, or create an account below.";
  }
  if (m.includes("failed to fetch") || m.includes("network")) {
    return "Couldn't reach Supabase. Check NEXT_PUBLIC_SUPABASE_URL and your internet connection.";
  }
  return message;
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const registered = params.get("registered");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(isSupabaseConfigured ? null : SUPABASE_ENV_ERROR);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { error: authError } = await getSupabase().auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (authError) {
        setError(friendlyLoginError(authError.message));
        return;
      }
      router.replace("/onboarding");
      router.refresh();
    } catch (err) {
      setError(friendlyLoginError(err instanceof Error ? err.message : "Something went wrong."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title="Login" subtitle="Welcome back to your garden.">
      {registered && (
        <p role="status" className="mb-4 rounded-xl border-2 border-inkline bg-pond/40 px-3.5 py-2.5 text-sm font-medium">
          {registered === "confirm"
            ? "Account created! We sent you a confirmation email — click the link in it, then log in here."
            : "Account created! Log in below to start your garden."}
        </p>
      )}

      <form onSubmit={onSubmit} className="space-y-4" noValidate={false}>
        <div>
          <label htmlFor="email" className="label">User ID (Email)</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="field"
          />
        </div>
        <div>
          <label htmlFor="password" className="label">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            className="field"
          />
        </div>

        <div aria-live="polite">
          {error && (
            <p role="alert" className="rounded-xl border-2 border-danger bg-[#fbe9e4] px-3.5 py-2.5 text-sm font-medium text-danger">
              {error}
            </p>
          )}
        </div>

        <button type="submit" disabled={busy || !isSupabaseConfigured} className="btn btn-primary w-full">
          <LogIn size={18} aria-hidden="true" />
          {busy ? "Logging in…" : "Login"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm">
        New here?{" "}
        <Link href="/signup" className="font-bold text-moss underline decoration-2 underline-offset-4 hover:text-lotus">
          Create account
        </Link>
      </p>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
