import type { MessageCreateParamsNonStreaming } from "@anthropic-ai/sdk/resources/messages";
import { afterEach, describe, expect, it } from "vitest";
import { InMemoryCallLog } from "@/engine/call-log";
import { createAnthropicClient, createClaudeWrapper } from "@/engine/claude";
import { startModelFake } from "../model-fake";

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
});
