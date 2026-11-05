import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

/** Existe banco configurado? (Sem DATABASE_URL o site público mostra listas vazias.) */
export const hasDatabase = Boolean(process.env.DATABASE_URL);

const globalForDb = globalThis as unknown as { pool?: Pool };

// Reaproveita a conexão entre recargas no modo dev.
const pool =
  globalForDb.pool ??
  new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
if (process.env.NODE_ENV !== "production") globalForDb.pool = pool;

export const db = drizzle(pool, { schema });
export { schema };
