import { sql } from "drizzle-orm";
import { z } from "zod";
import type { Db } from "./client";
import { errorCodeSuffix } from "./error-code";

// `unknown`: the database was down, or its answer couldn't be read, so the extension wasn't checked.
export type Health = { database: "up"; vector: "present" | "missing" } | { database: "down"; vector: "unknown" };

const extensionRow = z.object({ present: z.boolean() });

// Up: the extension query answers within the pool's timeouts, which proves the database is reachable on its own.
// Present: pg_extension, which is per database, has vector. A row of the wrong shape counts as a failed check.
export async function checkHealth(db: Db): Promise<Health> {
  try {
    const { rows } = await db.execute(
      sql`select exists (select 1 from pg_extension where extname = 'vector') as present`,
    );
    const row = extensionRow.safeParse(rows[0]);
    if (row.success) return { database: "up", vector: row.data.present ? "present" : "missing" };
    // Fixed text: zod's error can echo the row.
    console.error("Health check: the extension query returned an unexpected row");
  } catch (error) {
    // Fixed text and the error's code only: driver errors can echo the connection string, password included.
    console.error(`Health check: the database query failed${errorCodeSuffix(error)}`);
  }
  return { database: "down", vector: "unknown" };
}
