"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { UserPlus } from "lucide-react";
import { AuthShell } from "@/components/AuthShell";
import { SUPABASE_ENV_ERROR, getSupabase, isSupabaseConfigured } from "@/lib/supabase";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(isSupabaseConfigured ? null : SUPABASE_ENV_ERROR);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError("Please tell us your name.");
    if (password.length < 6) return setError("Your password needs at least 6 characters.");

    setBusy(true);
    try {
      const { data, error: authError } = await getSupabase().auth.signUp({
        email: email.trim(),
        password,
        options: { data: { name: name.trim() } },
      });

      if (authError) {
        const m = authError.message.toLowerCase();
        setError(
          m.includes("already registered") || m.includes("already been registered")
            ? "That email already has an account — try logging in instead."
            : m.includes("rate limit")
              ? "Supabase's email limit was hit. Wait a few minutes and try again (or turn off “Confirm email” while developing)."
              : authError.message,
        );
        return;
      }

      // Supabase hides "email already exists" (to prevent enumeration) by returning a user with no identities.
      if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        setError("That email already has an account — try logging in instead.");
        return;
      }

      // With "Confirm email" ON there is no session yet: the user must click the email link first.
      router.push(data.session ? "/?registered=1" : "/?registered=confirm");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title="Sign Up" subtitle="Plant your first seed — it only takes a minute.">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="label">Name</label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="field"
          />
        </div>
        <div>
          <label htmlFor="email" className="label">Email Address</label>
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
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
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
          <UserPlus size={18} aria-hidden="true" />
          {busy ? "Creating account…" : "Sign Up"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm">
        Already have an account?{" "}
        <Link href="/" className="font-bold text-moss underline decoration-2 underline-offset-4 hover:text-lotus">
          Login
        </Link>
      </p>
    </AuthShell>
  );
}
