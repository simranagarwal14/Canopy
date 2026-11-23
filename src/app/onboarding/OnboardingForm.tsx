"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Sprout } from "lucide-react";
import { CanopyLogo } from "@/components/CanopyLogo";
import { PondScene } from "@/components/PondScene";
import {
  HUMIDITY_OPTIONS,
  PLACEMENT_OPTIONS,
  SOIL_OPTIONS,
  SUNLIGHT_OPTIONS,
  type GardenOption,
} from "@/lib/gardenOptions";
import { getSupabase } from "@/lib/supabase";
import type { GardenView } from "@/lib/types";

function OptionSelect({
  id,
  label,
  options,
  value,
  onChange,
  hint,
}: {
  id: string;
  label: string;
  options: GardenOption[];
  value: string;
  onChange: (v: string) => void;
  hint: string;
}) {
  const selected = options.find((o) => o.value === value);
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <select id={id} required value={value} onChange={(e) => onChange(e.target.value)} className="field">
        <option value="" disabled>{hint}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ul aria-live="polite" className="mt-1.5 min-h-5 space-y-0.5 text-xs font-medium text-moss">
        {selected?.details.map((d) => (
          <li key={d}>• {d}</li>
        ))}
      </ul>
    </div>
  );
}

export function OnboardingForm({
  userName,
  plants,
  existing,
}: {
  userName: string;
  plants: string[];
  /** The user's saved garden, if they already made one. */
  existing: GardenView | null;
}) {
  const router = useRouter();
  const returning = existing !== null;
  const [humidity, setHumidity] = useState(existing?.humidity ?? "");
  const [sunlight, setSunlight] = useState(existing?.sunlight ?? "");
  const [placement, setPlacement] = useState(existing?.placement ?? "");
  const [soiltype, setSoiltype] = useState(existing?.soiltype ?? "");
  const [plant, setPlant] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function switchAccount() {
    setBusy(true);
    try {
      await getSupabase().auth.signOut();
    } finally {
      router.replace("/?switch=1");
      router.refresh();
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/garden", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ humidity, sunlight, placement, soiltype, plant }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (res.status === 401) {
        router.replace("/");
        return;
      }
      if (!res.ok) {
        setError(data.error ?? "We couldn't create your garden. Please try again.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="awning" aria-hidden="true" />
      <main className="relative z-10 mx-auto max-w-2xl px-4 pb-44 pt-12">
        <div className="card p-6 sm:p-9">
          <div className="flex items-center gap-4">
            <CanopyLogo size={64} />
            <div>
              <p className="text-sm font-semibold text-moss">Hello, {userName}!</p>
              <h1 className="font-display text-3xl font-bold leading-tight">
                {returning ? "Welcome back to your garden" : "Create Your Garden"}
              </h1>
            </div>
          </div>
          <p className="mt-3 text-sm text-muted">
            {returning
              ? "Your garden is already set up. Head straight in, or tweak its settings and add another plant below."
              : "Tell us about the spot you'll be growing in. We'll use it to set up your virtual garden and your first plant."}
          </p>

          {returning && (
            <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border-2 border-inkline bg-sand-soft/60 p-4">
              <Link href="/dashboard" className="btn btn-lotus">
                Skip &amp; go to garden <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <span className="text-xs text-muted">No changes needed? This takes you straight to your plants.</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-5">
            <OptionSelect id="humidity" label="Humidity" hint="Choose your climate zone" options={HUMIDITY_OPTIONS} value={humidity} onChange={setHumidity} />
            <OptionSelect id="sunlight" label="Sunlight" hint="How much light does the spot get?" options={SUNLIGHT_OPTIONS} value={sunlight} onChange={setSunlight} />
            <OptionSelect id="placement" label="Placement" hint="Where will your plants live?" options={PLACEMENT_OPTIONS} value={placement} onChange={setPlacement} />
            <OptionSelect id="soiltype" label="Soil Type" hint="Choose your soil" options={SOIL_OPTIONS} value={soiltype} onChange={setSoiltype} />

            <div>
              <label htmlFor="plant" className="label">
                Choose Plant{returning && <span className="font-normal text-muted"> (optional)</span>}
              </label>
              <select id="plant" required={!returning} value={plant} onChange={(e) => setPlant(e.target.value)} className="field">
                {returning ? (
                  <option value="">Don&apos;t add a plant — just save my garden</option>
                ) : (
                  <option value="" disabled>Pick your first plant</option>
                )}
                {plants.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div aria-live="polite">
              {error && (
                <p role="alert" className="rounded-xl border-2 border-danger bg-[#fbe9e4] px-3.5 py-2.5 text-sm font-medium text-danger">
                  {error}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button type="submit" disabled={busy} className="btn btn-primary w-full sm:w-auto">
                <Sprout size={18} aria-hidden="true" />
                {busy ? "Saving…" : returning ? (plant ? "Save & add plant" : "Save garden") : "Create Garden"}
              </button>
              {returning && (
                <Link href="/dashboard" className="btn btn-ghost w-full sm:w-auto">
                  Skip for now
                </Link>
              )}
            </div>
          </form>

          <p className="mt-5 border-t border-inkline/20 pt-4 text-xs text-muted">
            Signed in as {userName}.{" "}
            <button type="button" onClick={switchAccount} disabled={busy} className="font-bold text-moss underline underline-offset-2">
              Not you? Switch account
            </button>
          </p>
        </div>
      </main>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0">
        <PondScene />
      </div>
    </div>
  );
}
