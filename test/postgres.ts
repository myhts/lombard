// Databases for the container tests, inside the one Postgres container that test/postgres-container.ts starts.
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";
import { inject } from "vitest";

const migrationsFolder = fileURLToPath(new URL("../drizzle", import.meta.url));

// A fresh, empty database per call, so test files can run in parallel without seeing each other's data. `migrated`
// applies every migration in drizzle/, the same files `pnpm db:migrate` applies.
export async function createTestDatabase({ migrated }: { migrated: boolean }): Promise<string> {
  const serverUrl = inject("postgresUrl");
  const name = `test_${randomUUID().replaceAll("-", "")}`; // letters, digits and _ only: safe to put in SQL

  const admin = new pg.Client({ connectionString: serverUrl });
  await admin.connect();
  try {
    await admin.query(`create database ${name}`);
  } finally {
    await admin.end();
  }

  const url = new URL(serverUrl);
  url.pathname = `/${name}`;
  if (migrated) {
    const pool = new pg.Pool({ connectionString: url.href });
    try {
      await migrate(drizzle({ client: pool }), { migrationsFolder });
    } finally {
      await pool.end();
    }
  }
  return url.href;
}
