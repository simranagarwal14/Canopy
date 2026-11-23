import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

// Next.js reads .env.local, the Prisma CLI does not — so load both here.
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

// `prisma db push` / migrations need a DIRECT (non-transaction-pooled) connection.
// Falls back to DATABASE_URL, then to a harmless placeholder so that
// `prisma generate` (run on npm install) never crashes when env isn't set up yet.
const url =
  process.env.DIRECT_URL ||
  process.env.DATABASE_URL ||
  "postgresql://placeholder:placeholder@localhost:5432/placeholder";

if (!process.env.DIRECT_URL && !process.env.DATABASE_URL) {
  console.warn(
    "[prisma.config] DATABASE_URL / DIRECT_URL not set — using a placeholder. Fill in .env before `npx prisma db push`.",
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: { url },
});
