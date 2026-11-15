import { afterEach, describe, expect, it, vi } from "vitest";
import type { Db } from "./client";
import { checkHealth } from "./health";

// A database that answers the extension query with these rows. A real Postgres can't return a malformed row here, so
// this stands in for it; the cast is because checkHealth uses only `execute`.
const answering = (rows: unknown[]) => ({ execute: () => Promise.resolve({ rows }) }) as unknown as Db;

describe("checkHealth", () => {
  afterEach(() => vi.restoreAllMocks());

  it.each([
    ["no row", []],
    ["a row of the wrong shape", [{ present: "SENTINEL-yes" }]],
  ])("reports the database down, with a fixed log, when the extension query returns %s", async (_case, rows) => {
    const logged = vi.spyOn(console, "error").mockImplementation(() => undefined);

    expect(await checkHealth(answering(rows))).toEqual({ database: "down", vector: "unknown" });
    expect(logged.mock.calls).toEqual([["Health check: the extension query returned an unexpected row"]]);
  });
});
