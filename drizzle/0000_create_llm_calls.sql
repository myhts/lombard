-- Hand-edited before it was ever applied (#5): pgvector for the P1 archive search. No vector column yet.
CREATE EXTENSION IF NOT EXISTS vector;--> statement-breakpoint
CREATE TABLE "llm_calls" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "llm_calls_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"provider" text NOT NULL,
	"model" text NOT NULL,
	"operation" text NOT NULL,
	"purpose" text NOT NULL,
	"input_tokens" integer,
	"output_tokens" integer,
	"cache_read_tokens" integer,
	"cache_write_5m_tokens" integer,
	"cache_write_1h_tokens" integer,
	"total_tokens" integer,
	"cost_nano_usd" bigint NOT NULL,
	"latency_ms" integer NOT NULL,
	"status" text NOT NULL,
	"error_type" text,
	"request_id" text
);
