import { createServer, type Server, type Socket } from "node:net";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createTestDatabase } from "../../test/postgres";
import { createDb } from "./client";
import { checkHealth } from "./health";

async function healthOf(databaseUrl: string) {
  const db = createDb(databaseUrl);
  try {
    return await checkHealth(db);
  } finally {
    await db.$client.end();
  }
}

// A TCP server that accepts connections and never answers, like a database host that has stopped responding.
async function startSilentServer(): Promise<{ port: number; close: () => Promise<void> }> {
  const sockets = new Set<Socket>();
  const server: Server = createServer((socket) => void sockets.add(socket));
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (address === null || typeof address === "string") throw new Error("expected a TCP address");
  return {
    port: address.port,
    close: async () => {
      for (const socket of sockets) socket.destroy();
      await new Promise((resolve) => server.close(resolve));
    },
  };
}

describe("checkHealth", () => {
  afterEach(() => vi.restoreAllMocks());

  it("reports a migrated database up, with the vector extension present", async () => {
    const url = await createTestDatabase({ migrated: true });

    expect(await healthOf(url)).toEqual({ database: "up", vector: "present" });
  });

  it("reports the vector extension missing on a database that hasn't been migrated", async () => {
    const url = await createTestDatabase({ migrated: false });

    expect(await healthOf(url)).toEqual({ database: "up", vector: "missing" });
  });

  it("reports the database down within the timeout when nothing answers, and logs no driver error", async () => {
    const server = await startSilentServer();
    const logged = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const started = performance.now();
    try {
      const health = await healthOf(`postgres://lombard:SENTINEL-db-password@127.0.0.1:${server.port}/lombard`);

      expect(health).toEqual({ database: "down", vector: "unknown" });
      expect(performance.now() - started).toBeLessThan(3_000);
      expect(logged).toHaveBeenCalled();
      // Only fixed strings: an Error object or its message could carry the connection string.
      for (const argument of logged.mock.calls.flat()) expect(typeof argument).toBe("string");
      expect(logged.mock.calls.flat().join("\n")).not.toContain("SENTINEL");
    } finally {
      await server.close();
    }
  });

  it("reports the database down on a wrong password, logging the SQLSTATE but not the connection string", async () => {
    const url = new URL(await createTestDatabase({ migrated: false }));
    url.password = "SENTINEL-wrong-password";
    const logged = vi.spyOn(console, "error").mockImplementation(() => undefined);

    expect(await healthOf(url.href)).toEqual({ database: "down", vector: "unknown" });
    const text = logged.mock.calls.flat().join("\n");
    expect(text).toContain("28P01"); // invalid_password
    expect(text).not.toContain("SENTINEL");
  });
});
