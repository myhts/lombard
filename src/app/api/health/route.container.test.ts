import { afterEach, describe, expect, it, vi } from "vitest";
import { createTestDatabase } from "../../../../test/postgres";

// The route reads its settings through getConfig, so each request gets a fresh module graph (an empty config cache
// and pool) with DATABASE_URL pointing at the test database. Invented keys: the endpoint never calls a model.
async function requestHealth(databaseUrl: string) {
  vi.resetModules();
  vi.stubEnv("DATABASE_URL", databaseUrl);
  vi.stubEnv("ANTHROPIC_API_KEY", "sk-ant-test-not-a-key");
  vi.stubEnv("ANTHROPIC_BASE_URL", undefined);
  vi.stubEnv("VOYAGE_API_KEY", "pa-test-not-a-key");
  vi.stubEnv("VOYAGE_BASE_URL", undefined);
  const { GET } = await import("./route");
  const { getDb } = await import("@/db/client");
  try {
    const response = await GET();
    return { status: response.status, body: (await response.json()) as unknown };
  } finally {
    await getDb().$client.end();
  }
}

describe("GET /api/health", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("answers 200 when the database is up and the vector extension is present", async () => {
    const response = await requestHealth(await createTestDatabase({ migrated: true }));

    expect(response).toEqual({ status: 200, body: { status: "ok", database: "up", vector: "present" } });
  });

  it("answers 503 when the vector extension is missing", async () => {
    const response = await requestHealth(await createTestDatabase({ migrated: false }));

    expect(response).toEqual({ status: 503, body: { status: "unavailable", database: "up", vector: "missing" } });
  });
});
