// One logical model call, as the cost meter records it after the SDK's retries. The keys match the `llm_calls` table
// (src/db/schema.ts) minus `id` and `createdAt`, so the Postgres log maps them one to one; the engine can't import it.
export type CallRecord = {
  provider: "anthropic" | "voyage";
  model: string;
  operation: "messages" | "embeddings";
  purpose: string;
  // Null means this provider never reports that kind: Claude has no total, Voyage has only a total.
  inputTokens: number | null;
  outputTokens: number | null;
  cacheReadTokens: number | null;
  cacheWrite5mTokens: number | null;
  cacheWrite1hTokens: number | null;
  totalTokens: number | null;
  costNanoUsd: number; // integer nano-dollars (ADR 0001)
  latencyMs: number;
  status: "ok" | "error";
  errorType: string | null;
  requestId: string | null;
};

// Async because the Postgres log will be.
export type CallLog = { record(call: CallRecord): Promise<void> };

/** A call log for tests: it keeps every record, in order, for the test to read. */
export class InMemoryCallLog implements CallLog {
  readonly calls: CallRecord[] = [];

  record(call: CallRecord): Promise<void> {
    this.calls.push(call);
    return Promise.resolve();
  }
}
