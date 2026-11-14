import pg from "pg";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createTestDatabase } from "../../test/postgres";
import { createDb } from "./client";

describe("createDb", () => {
  afterEach(() => vi.restoreAllMocks());

  it("logs the SQLSTATE, and nothing that could hold the connection string, when an idle connection breaks", async () => {
    const url = await createTestDatabase({ migrated: false });
    const db = createDb(url);
    const logged = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const admin = new pg.Client({ connectionString: url });
    try {
      await db.$client.query("select 1"); // leaves one idle connection in the pool
      await admin.connect();
      await admin.query(
        "select pg_terminate_backend(pid) from pg_stat_activity where datname = current_database() and pid <> pg_backend_pid()",
      );

      await vi.waitFor(() => expect(logged).toHaveBeenCalled());
      for (const argument of logged.mock.calls.flat()) expect(typeof argument).toBe("string");
      expect(logged.mock.calls.flat().join("\n")).toContain("57P01"); // admin_shutdown
    } finally {
      await admin.end();
      await db.$client.end();
    }
  });
});
