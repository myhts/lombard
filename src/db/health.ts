import { sql } from "drizzle-orm";
import { z } from "zod";
import type { Db } from "./client";
import { errorCodeSuffix } from "./error-code";

// `unknown`: the database was down, so the extension wasn't checked.
export type Health = { database: "up"; vector: "present" | "missing" } | { database: "down"; vector: "unknown" };

const extensionRow = z.object({ present: z.boolean() });

// Reachable: `select 1` answers within the pool's timeouts. Present: pg_extension, which is per database, has vector.
export async function checkHealth(db: Db): Promise<Health> {
  let rows: unknown[];
  try {
    await db.execute(sql`select 1`);
    ({ rows } = await db.execute(sql`select exists (select 1 from pg_extension where extname = 'vector') as present`));
  } catch (error) {
    // Fixed text and the error's code only: driver errors can echo the connection string, password included.
    console.error(`Health check: the database query failed${errorCodeSuffix(error)}`);
    return { database: "down", vector: "unknown" };
  }
  return { database: "up", vector: extensionRow.parse(rows[0]).present ? "present" : "missing" };
}
