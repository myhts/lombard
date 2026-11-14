import "server-only";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { getConfig } from "@/config";
import { errorCodeSuffix } from "./error-code";
import * as schema from "./schema";

// The app-wide budgets for now: every connect and query on the app's one pool gets 2 s, so a database that doesn't
// answer fails the request instead of hanging it. A server-side statement_timeout is a follow-up.
export const connectTimeoutMs = 2_000;
const queryTimeoutMs = 2_000;

export function createDb(databaseUrl: string) {
  const pool = new Pool({
    connectionString: databaseUrl,
    connectionTimeoutMillis: connectTimeoutMs,
    query_timeout: queryTimeoutMs,
  });
  // An idle connection that breaks emits "error" on the pool, and an unhandled one would crash the server. Fixed text
  // and the error's code only, because driver errors can echo the connection string.
  pool.on("error", (error) => console.error(`Database: an idle connection failed${errorCodeSuffix(error)}`));
  return drizzle({ client: pool, schema, casing: "snake_case" });
}

export type Db = ReturnType<typeof createDb>;

let db: Db | undefined;

// The app's one pool, created on first use so importing this module never connects.
export function getDb(): Db {
  db ??= createDb(getConfig().databaseUrl);
  return db;
}
