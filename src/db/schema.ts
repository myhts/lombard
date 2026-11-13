import { bigint, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// One row per logical Claude or Voyage call, written by the cost meter after the SDK's retries. It never holds prompt
// or response text. Token columns a provider doesn't report stay null: Claude has no total, Voyage has only a total.
export const llmCalls = pgTable("llm_calls", {
  id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  provider: text({ enum: ["anthropic", "voyage"] }).notNull(),
  model: text().notNull(),
  // Later rerank and batch: a TypeScript-only enum, so adding one needs no migration.
  operation: text({ enum: ["messages", "embeddings"] }).notNull(),
  purpose: text().notNull(),
  inputTokens: integer(),
  outputTokens: integer(),
  cacheReadTokens: integer(),
  // Named by hand: the snake_case conversion would write cache_write5m_tokens.
  cacheWrite5mTokens: integer("cache_write_5m_tokens"),
  cacheWrite1hTokens: integer("cache_write_1h_tokens"),
  totalTokens: integer(),
  // A Postgres bigint: an integer stops at about $2.14 in nano-dollars. Number mode is exact up to about $9 million
  // (ADR 0001). SUM() over it comes back as a string and must be parsed (spec #2, Further Notes).
  costNanoUsd: bigint({ mode: "number" }).notNull(),
  latencyMs: integer().notNull(),
  status: text({ enum: ["ok", "error"] }).notNull(),
  errorType: text(),
  requestId: text(),
});
