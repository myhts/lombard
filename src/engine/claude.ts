import Anthropic from "@anthropic-ai/sdk";
import type { Message, MessageCreateParamsNonStreaming, Usage } from "@anthropic-ai/sdk/resources/messages";
import type { CallLog } from "./call-log";
import { systemClock, type Clock } from "./clock";
import { costNanoUsd, priceFor, type TokenUsage } from "./prices";

// Both options always explicit, so the SDK never falls back to environment variables or an `ant` profile.
export function createAnthropicClient({ apiKey, baseURL }: { apiKey: string; baseURL: string }): Anthropic {
  return new Anthropic({ apiKey, baseURL });
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

export type ClaudeWrapperDeps = { client: Anthropic; callLog: CallLog; clock?: Clock };

/** Sends Claude messages through the cost meter: one call-log record per call, written after the SDK's retries. */
export function createClaudeWrapper({ client, callLog, clock = systemClock }: ClaudeWrapperDeps) {
  return {
    async send(purpose: string, params: MessageCreateParamsNonStreaming): Promise<Message> {
      const price = priceFor(params.model);
      if (!price) throw new Error(`no price for model ${params.model}, so it can't be sent`);
      const started = clock.now();
      const { data: message, request_id } = await client.messages.create(params).withResponse();
      const latencyMs = Math.round(clock.now() - started); // performance.now() has fractions of a millisecond
      const usage = toTokenUsage(message.usage);
      await callLog.record({
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
        latencyMs,
        status: "ok",
        errorType: null,
        requestId: request_id ?? null,
      });
      return message;
    },
  };
}
