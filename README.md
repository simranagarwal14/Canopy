# Canopy 🌿

A cozy virtual-garden app: Next.js 16 (App Router) · TypeScript · Tailwind v4 · Framer Motion · Supabase Auth + Postgres · Prisma 7 · LangChain (Rootly).

## Setup

1. **Env** — copy `.env.example` to `.env.local` and fill it in (Supabase URL + anon key, and the Postgres connection string).
   Use the **Session pooler** string from Supabase → Project Settings → Database for `DATABASE_URL` and `DIRECT_URL`.
2. **Supabase auth** — Authentication → Providers → Email → turn **off "Confirm email"** while developing
   (otherwise new users must click an emailed link before they can log in).
3. **Install + create tables**
   ```bash
   npm install
   npx prisma db push
   npm run dev
   ```
4. Open http://localhost:3000 → Create account → Login → build your garden.

`OPENAI_API_KEY` is optional. Without it Rootly answers straight from `data/plants.json`.

## How sessions work

The Supabase session is stored in long-lived cookies (400 days) and refreshed by `src/proxy.ts` on every page request,
so closing and reopening the browser keeps you signed in. Opening `/` while signed in goes straight to your garden;
use **Log out** or **Not you? Switch account** (on `/onboarding`) to sign in as someone else (`/?switch=1`).

## Care log rules

- Each task has an interval in `data/plants.json` (e.g. Rose water = 2 days).
- A task you've logged stays **ticked until the day it is due again** (your local calendar day), then unticks itself
  and shows *Due today* / *Overdue by Nd*. Click a tick to undo it (the log entry is kept, marked not-completed).
- Every tick/untick re-runs `src/lib/healthAlgorithm.ts` and saves `Plant.healthState`.
- Supplies on the Inventory shelves live in `src/lib/supplies.ts`.

## Your plant data — `data/plants.json`

Replace or extend the `plants` array. Only `name` is required; every other field is optional
(anything missing is reported by Rootly as "not in the plant file yet" instead of being guessed).

| field | meaning |
| --- | --- |
| `name`, `aliases[]`, `scientificName` | how the plant is matched in questions |
| `wateringIntervalDays`, `wateringNotes` | water schedule used by the health algorithm |
| `sunlightAdjustIntervalDays`, `sunlightHoursPerDay`, `sunlightRule`, `lightNotes` | sunlight-shift schedule + rule |
| `fertilizerIntervalDays`, `fertilizerNotes` | manure / fertilizer schedule |
| `humidityNotes`, `soilNotes`, `careTips[]` | extra grounding for Rootly |

A bare array, `{ "plants": [...] }`, or an object keyed by plant name all work. Restart `npm run dev` after editing.
New plants automatically appear in onboarding, Inventory and Rootly.

## Layout

```
data/plants.json           plant knowledge
prisma/schema.prisma       DB schema (Prisma 7: URL lives in prisma.config.ts)
src/proxy.ts               session refresh + route protection (Next 16's "middleware")
src/lib/healthAlgorithm.ts dancing / happy / sad / browning / dead + reasons
src/lib/rootlyService.ts   deterministic guardrails + grounding for the AI
src/app/api/*              garden, care-log, plants, rootly
src/app/dashboard/*        Virtual Garden, Plant Care Log, Rootly, Inventory
```
