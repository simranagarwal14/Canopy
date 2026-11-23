import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

type GlobalPrisma = {
  __canopyPrisma?: PrismaClient;
  __canopyPool?: Pool;
};

const globalForPrisma = globalThis as unknown as GlobalPrisma;

function getClient(): PrismaClient {
  if (!globalForPrisma.__canopyPrisma) {
    const raw = process.env.DATABASE_URL;
    if (!raw) {
      throw new Error("DATABASE_URL is not set. Copy .env.example to .env and fill it in.");
    }

    const url = new URL(raw);
    const isLocal = ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
    url.searchParams.delete("sslmode");
    url.searchParams.delete("pgbouncer");

    const pool =
      globalForPrisma.__canopyPool ??
      new Pool({
        connectionString: url.toString(),
        ssl: isLocal ? false : { rejectUnauthorized: false },
        max: 5,
        idleTimeoutMillis: 10_000,       // Recycle idle sockets every 10s so Supabase never holds a stale one
        connectionTimeoutMillis: 10_000, // Fail in 10s instead of hanging for 3.2 minutes
        keepAlive: true,
      });

    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.__canopyPool = pool;
    }

    const adapter = new PrismaPg(pool);
    globalForPrisma.__canopyPrisma = new PrismaClient({ adapter });
  }

  return globalForPrisma.__canopyPrisma;
}

/** Singleton PrismaClient (survives Next.js hot reloads). */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getClient();
    const value = Reflect.get(client, prop, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
});