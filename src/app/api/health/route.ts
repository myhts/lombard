import { getDb } from "@/db/client";
import { checkHealth } from "@/db/health";

// For probes and the deploy's smoke step: the database and pgvector only, never a model, and never cached.
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const health = await checkHealth(getDb());
  const ok = health.database === "up" && health.vector === "present";
  return Response.json({ status: ok ? "ok" : "unavailable", ...health }, { status: ok ? 200 : 503 });
}
