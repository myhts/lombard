import Anthropic, {
  APIConnectionError,
  APIConnectionTimeoutError,
  APIError,
  APIUserAbortError,
} from "@anthropic-ai/sdk";
import type { Message, MessageCreateParamsNonStreaming, Usage } from "@anthropic-ai/sdk/resources/messages";
import type { CallLog, CallRecord } from "./call-log";
import { systemClock, type Clock } from "./clock";
import { costNanoUsd, priceFor, type TokenUsage } from "./prices";

// Both options always explicit, so the SDK never falls back to environment variables or an `ant` profile.
export function createAnthropicClient({ apiKey, baseURL }: { apiKey: string; baseURL: string }): Anthropic {
  return new Anthropic({ apiKey, baseURL });
}

/** Thrown before any request when the price table has no price for the model, so no call goes unmetered. */
export class UnpricedModelError extends Error {
  override name = "UnpricedModelError";
  constructor(readonly model: string) {
    super(`no price for model ${model}: add it to PRICES before sending to it`);
  }
}

// SDK nulls count as 0. Without the 5-minute/1-hour split, every cache write counts as a 5-minute one (#6).
function toTokenUsage(usage: Usage): TokenUsage {
  const writes = usage.cache_creation;
  return {
    input: usage.input_tokens,
    output: usage.output_tokens,
    cacheRead: usage.cache_read_input_tokens ?? 0,
    write5m: writes ? writes.ephemeral_5m_input_tokens : (usage.cache_creation_input_tokens ?? 0),
    write1h: writes ? writes.ephemeral_1h_input_tokens : 0,
  };
}

const NO_TOKENS: TokenUsage = { input: 0, output: 0, cacheRead: 0, write5m: 0, write1h: 0 };

// The API's error type (e.g. `rate_limit_error`) when there is one, else a fixed name for the SDK's errors that come
// with no response. Fixed strings, not class names: a minified build renames the classes.
function errorTypeOf(error: unknown): string {
  if (error instanceof APIError && error.type) return error.type;
  if (error instanceof APIConnectionTimeoutError) return "APIConnectionTimeoutError"; // before its parent class
  if (error instanceof APIConnectionError) return "APIConnectionError";
  if (error instanceof APIUserAbortError) return "APIUserAbortError";
  return "unknown_error";
}

export type ClaudeWrapperDeps = { client: Anthropic; callLog: CallLog; clock?: Clock };

/** Sends Claude messages through the cost meter: one call-log record per call, written after the SDK's retries. */
export function createClaudeWrapper({ client, callLog, clock = systemClock }: ClaudeWrapperDeps) {
  return {
    async send(purpose: string, params: MessageCreateParamsNonStreaming): Promise<Message> {
      const price = priceFor(params.model);
      if (!price) throw new UnpricedModelError(params.model);
      const started = clock.now();
      const record = (usage: TokenUsage, outcome: Pick<CallRecord, "status" | "errorType" | "requestId">) =>
        callLog.record({
          provider: "anthropic",
          model: params.model,
          operation: "messages",
          purpose,
          inputTokens: usage.input,
          outputTokens: usage.output,
          cacheReadTokens: usage.cacheRead,
          cacheWrite5mTokens: usage.write5m,
          cacheWrite1hTokens: usage.write1h,
          totalTokens: null, // Claude reports no total
          costNanoUsd: costNanoUsd(price, usage),
          latencyMs: Math.round(clock.now() - started), // performance.now() has fractions of a millisecond
          ...outcome,
        });
      let response;
      try {
        response = await client.messages.create(params).withResponse();
      } catch (error) {
        // Recorded after the SDK's last retry, with zero tokens; the caller still gets the SDK's own error.
        const requestId = error instanceof APIError ? (error.requestID ?? null) : null;
        await record(NO_TOKENS, { status: "error", errorType: errorTypeOf(error), requestId });
        throw error;
      }
      const { data: message, request_id } = response;
      await record(toTokenUsage(message.usage), { status: "ok", errorType: null, requestId: request_id ?? null });
      return message;
    },
  };
}
