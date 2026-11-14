// Vitest globalSetup for the container tests: one throwaway Postgres with pgvector per run. Plain `docker run`, not
// Testcontainers, which can't cap swap, bind ports to 127.0.0.1 or limit its reaper (#5, decision of 2026-11-14).
import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { promisify } from "node:util";
import pg from "pg";
import type { TestProject } from "vitest/node";

declare module "vitest" {
  export interface ProvidedContext {
    postgresUrl: string;
  }
}

// The compose file's image, so the tests and `pnpm dev` run the same Postgres and pgvector.
const image = "pgvector/pgvector:0.8.6-pg18";
const password = "lombard-test"; // a throwaway value for a container that lives for one run, on 127.0.0.1 only

const execFileAsync = promisify(execFile);

// Every call has a time limit, so a Docker that hangs fails the run instead of blocking it.
async function docker(args: string[], timeoutMs: number): Promise<string> {
  const { stdout } = await execFileAsync("docker", args, { timeout: timeoutMs });
  return stdout.trim();
}

// Ready means a query over TCP works. The image's init step runs a server on the unix socket only, then restarts it.
async function waitUntilReady(url: string, timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const client = new pg.Client({ connectionString: url, connectionTimeoutMillis: 1_000 });
    try {
      await client.connect();
      await client.query("select 1");
      return;
    } catch (error) {
      if (Date.now() > deadline) throw new Error(`Postgres wasn't ready after ${timeoutMs} ms`, { cause: error });
    } finally {
      await client.end().catch(() => undefined); // ending a client that never connected can fail; nothing to clean up
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
}

export default async function setup(project: TestProject): Promise<() => Promise<void>> {
  const name = `lombard-test-${randomUUID().slice(0, 8)}`;
  // -v also removes the image's anonymous data volume.
  const remove = async () => void (await docker(["rm", "--force", "--volumes", name], 60_000));

  try {
    await docker(
      [
        ["run", "--detach", "--name", name, "--label", "lombard.test=true"],
        ["--memory", "512m", "--memory-swap", "512m", "--publish", "127.0.0.1::5432"],
        ["--env", "POSTGRES_USER=lombard", "--env", `POSTGRES_PASSWORD=${password}`, "--env", "POSTGRES_DB=lombard"],
        [image],
      ].flat(),
      300_000, // the first run pulls the image
    );
    const binding = await docker(["port", name, "5432/tcp"], 30_000);
    const port = /^127\.0\.0\.1:(\d+)$/m.exec(binding)?.[1];
    if (!port) throw new Error(`Unexpected port binding for ${name}: ${binding}`);

    const url = `postgres://lombard:${password}@127.0.0.1:${port}/lombard`;
    await waitUntilReady(url, 60_000);
    project.provide("postgresUrl", url);
  } catch (error) {
    // Vitest 5.0.5 crashes while printing a globalSetup error ("code.charCodeAt is not a function") and hides it, so
    // say why here, from the messages alone: reading error.stack is what crashes.
    const reasons: string[] = [];
    for (let cause: unknown = error; cause instanceof Error; cause = cause.cause) reasons.push(cause.message);
    console.error(`Postgres container setup failed: ${reasons.join(" <- ") || String(error)}`);
    // Vitest never calls a teardown that setup didn't return, so remove the container here before failing the run.
    await remove().catch((removeError: unknown) =>
      console.error(`Could not remove container ${name}; run docker rm -f ${name}: ${String(removeError)}`),
    );
    throw error;
  }

  return remove;
}
