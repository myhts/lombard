import type { MessageCreateParamsNonStreaming } from "@anthropic-ai/sdk/resources/messages";
import { BadRequestError } from "@anthropic-ai/sdk";
import { afterEach, describe, expect, it } from "vitest";
import { InMemoryCallLog } from "@/engine/call-log";
import { createAnthropicClient, createClaudeWrapper, UnpricedModelError } from "@/engine/claude";
import { startModelFake, type ScriptedReply } from "../model-fake";

// Each test's fake, closed after it.
const closers: (() => Promise<void>)[] = [];
afterEach(async () => {
  await Promise.all(closers.splice(0).map((close) => close()));
});

// Seam 2: the wrapper's public interface, with an in-memory call log and a real client pointed at the HTTP model fake.
async function setUp() {
  let now = 0;
  const fake = await startModelFake({ onRequest: () => void (now += 250) }); // each request takes 250 ms
  const client = createAnthropicClient({ apiKey: "test-key", baseURL: fake.baseUrl });
  const callLog = new InMemoryCallLog();
  const claude = createClaudeWrapper({ client, callLog, clock: { now: () => now } });
  closers.push(() => fake.close());
  return { fake, callLog, claude };
}

const params: MessageCreateParamsNonStreaming = {
  model: "claude-haiku-5-5",
  max_tokens: 64,
  messages: [{ role: "user", content: "Good day." }],
};

describe("the Claude wrapper", () => {
  it("records one call with its tokens, cost, latency and request id, and returns the message", async () => {
    const { fake, callLog, claude } = await setUp();
    fake.script({ kind: "success", usage: { input: 31, output: 51, cacheRead: 7, write5m: 11, write1h: 13 } });

    const message = await claude.send("test.success", params);

    expect(message.id).toBe("msg_fake_1");
    expect(fake.requestCount()).toBe(1);
    expect(callLog.calls).toHaveLength(1);
    expect(callLog.calls[0]).toEqual({
      provider: "anthropic",
      model: "claude-haiku-5-5",
      operation: "messages",
      purpose: "test.success",
      inputTokens: 31,
      outputTokens: 51,
      cacheReadTokens: 7,
      cacheWrite5mTokens: 11,
      cacheWrite1hTokens: 13,
      totalTokens: null,
      costNanoUsd: 32_645, // 31×100 + 51×500 + 7×10 + 11×125 + 13×200 = 3,100 + 25,500 + 70 + 1,375 + 2,600
      latencyMs: 250,
      status: "ok",
      errorType: null,
      requestId: "req_fake_1",
    });
  });

  // The tier counts input + cache reads + cache writes, not output: 1,000 output tokens would tip the first case over.
  it.each([
    {
      rule: "a prompt of exactly 100,000 tokens is billed at the normal tier",
      input: 99_970,
      cost: 10_500_350, // 99,970×100 + 10×10 + 10×125 + 10×200 + 1,000×500
    },
    {
      rule: "a prompt over 100,000 tokens is billed at the long tier, output included",
      input: 99_971,
      cost: 52_502_250, // 99,971×500 + 10×50 + 10×625 + 10×1,000 + 1,000×2,500
    },
  ])("$rule", async ({ input, cost }) => {
    const { fake, callLog, claude } = await setUp();
    fake.script({ kind: "success", usage: { input, output: 1_000, cacheRead: 10, write5m: 10, write1h: 10 } });

    await claude.send("test.tier", params);

    expect(callLog.calls[0]?.costNanoUsd).toBe(cost);
  });

  it("refuses a model with no price before any request, and records nothing", async () => {
    const { fake, callLog, claude } = await setUp();

    const sending = claude.send("test.unpriced", { ...params, model: "claude-unpriced-0" });

    await expect(sending).rejects.toThrow(new UnpricedModelError("claude-unpriced-0"));
    expect(fake.requestCount()).toBe(0);
    expect(callLog.calls).toEqual([]);
  });

  // A failed call records no tokens and no cost; the cases differ in the error and the requests it took.
  const failed = {
    provider: "anthropic",
    model: "claude-haiku-5-5",
    operation: "messages",
    purpose: "test.error",
    inputTokens: 0,
    outputTokens: 0,
    cacheReadTokens: 0,
    cacheWrite5mTokens: 0,
    cacheWrite1hTokens: 0,
    totalTokens: null,
    costNanoUsd: 0,
    status: "error",
  };
  it.each([
    {
      rule: "a non-retryable API error is recorded once with its type and request id, then rethrown",
      replies: [{ kind: "error", status: 400, errorType: "invalid_request_error" }] satisfies ScriptedReply[],
      thrown: BadRequestError,
      record: { errorType: "invalid_request_error", requestId: "req_fake_1", latencyMs: 250 },
    },
  ])("$rule", async ({ replies, thrown, record }) => {
    const { fake, callLog, claude } = await setUp();
    fake.script(...replies);

    await expect(claude.send("test.error", params)).rejects.toBeInstanceOf(thrown);

    expect(fake.requestCount()).toBe(replies.length);
    expect(callLog.calls).toEqual([{ ...failed, ...record }]);
  });
});
