"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PlusCircle, Trash2 } from "lucide-react";
import { HealthBadge } from "@/components/HealthBadge";
import { LocalTime } from "@/components/LocalTime";
import { PlantSprite } from "@/components/PlantSprite";
import { GROWTH_STAGES, type PlantView } from "@/lib/types";

export function InventoryClient({ plants, supported }: { plants: PlantView[]; supported: string[] }) {
  const router = useRouter();
  const [species, setSpecies] = useState("");
  const [name, setName] = useState("");
  const [stage, setStage] = useState<string>("Sprout");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addPlant(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/plants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ species, name, growthStage: stage }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Couldn't add that plant.");
        return;
      }
      setSpecies("");
      setName("");
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function removePlant(p: PlantView) {
    if (!window.confirm(`Delete ${p.name}? This also removes its care history and can't be undone.`)) return;
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/plants/${encodeURIComponent(p.id)}`, { method: "DELETE" });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Couldn't delete that plant.");
        return;
      }
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={addPlant} className="card p-5">
        <h2 className="font-display text-xl font-bold">Add a plant</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_10rem_auto] sm:items-end">
          <div>
            <label htmlFor="inv-species" className="label">Plant</label>
            <select id="inv-species" required value={species} onChange={(e) => setSpecies(e.target.value)} className="field">
              <option value="" disabled>Choose a plant</option>
              {supported.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="inv-name" className="label">Nickname (optional)</label>
            <input id="inv-name" value={name} maxLength={40} onChange={(e) => setName(e.target.value)} placeholder="e.g. Balcony Tulsi" className="field" />
          </div>
          <div>
            <label htmlFor="inv-stage" className="label">Growth stage</label>
            <select id="inv-stage" value={stage} onChange={(e) => setStage(e.target.value)} className="field">
              {GROWTH_STAGES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={busy || !species} className="btn btn-primary">
            <PlusCircle size={16} aria-hidden="true" /> Add
          </button>
        </div>
        <div aria-live="polite">
          {error && (
            <p role="alert" className="mt-3 rounded-xl border-2 border-danger bg-[#fbe9e4] px-3 py-2 text-sm font-medium text-danger">
              {error}
            </p>
          )}
        </div>
      </form>

      {plants.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="font-display text-xl font-semibold">Nothing planted yet</p>
          <p className="mt-1 text-sm text-muted">Use the form above to add your first plant.</p>
        </div>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {plants.map((p) => (
            <li key={p.id} className="card flex flex-col gap-3 p-4">
              <div className="flex items-start gap-3">
                <PlantSprite species={p.species} state={p.healthState} size={72} className="shrink-0" />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-display text-lg font-bold">{p.name}</h3>
                  <p className="text-xs text-muted">{p.species}</p>
                  <div className="mt-1.5"><HealthBadge state={p.healthState} /></div>
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                <dt className="text-muted">Stage</dt>
                <dd className="font-semibold">{p.growthStage}</dd>
                <dt className="text-muted">Planted</dt>
                <dd className="font-semibold"><LocalTime iso={p.createdAt} /></dd>
                <dt className="text-muted">Last watered</dt>
                <dd className="font-semibold">{p.lastWatered ? <LocalTime iso={p.lastWatered} /> : "—"}</dd>
                <dt className="text-muted">Last sun shift</dt>
                <dd className="font-semibold">{p.lastSunMoved ? <LocalTime iso={p.lastSunMoved} /> : "—"}</dd>
                <dt className="text-muted">Last fertilized</dt>
                <dd className="font-semibold">{p.lastFertilized ? <LocalTime iso={p.lastFertilized} /> : "—"}</dd>
              </dl>
              <button
                type="button"
                onClick={() => removePlant(p)}
                disabled={busy}
                className="btn btn-ghost mt-auto !py-2 text-sm text-danger"
              >
                <Trash2 size={15} aria-hidden="true" />
                {p.healthState === "dead" ? "Delete dead plant" : "Delete plant"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
