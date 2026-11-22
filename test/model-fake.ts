import { once } from "node:events";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { text } from "node:stream/consumers";
import type { Message, StopReason } from "@anthropic-ai/sdk/resources/messages";
import type { ErrorResponse, ErrorType } from "@anthropic-ai/sdk/resources/shared";
import { z } from "zod";

// Separate from the engine's `TokenUsage` on purpose: the fake describes the API, not the engine.
export type ScriptedUsage = { input: number; output: number; cacheRead: number; write5m: number; write1h: number };
// Tagged by `kind`: a success, an API error (`retryable` lets the SDK retry it), or a connection dropped unanswered.
export type ScriptedReply =
  // `noCacheBreakdown` sends `cache_creation: null`, as the SDK's `Usage` type allows: only the total of cache writes.
  | { kind: "success"; usage: ScriptedUsage; stopReason?: StopReason; noCacheBreakdown?: boolean }
  | { kind: "error"; status: number; errorType: ErrorType; retryable?: boolean }
  | { kind: "drop" };
/** A real HTTP server standing in for the Claude Messages API; each test scripts its replies in order.
 * `onRequest` runs as each request arrives, before its reply: a test can advance a fake clock with it. */
export async function startModelFake({ onRequest }: { onRequest?: () => void } = {}) {
  const queue: ScriptedReply[] = [];
  let requests = 0;
  async function answer(req: IncomingMessage, res: ServerResponse) {
    onRequest?.(); // inside answer(), so a hook that throws fails the request instead of the server
    if (req.method !== "POST" || req.url !== "/v1/messages") return res.writeHead(404).end();
    const { model } = z.object({ model: z.string() }).parse(JSON.parse(await text(req)));
    const reply = queue.shift();
    if (!reply) throw new Error("model fake: no reply scripted for this request");
    if (reply.kind === "drop") return void req.socket.destroy();
    if (reply.kind === "error") {
      const requestId = `req_fake_${requests}`;
      const message = `scripted ${reply.errorType}`;
      const body: ErrorResponse = { type: "error", error: { type: reply.errorType, message }, request_id: requestId };
      // The SDK retries 408, 409, 429 and 5xx unless `x-should-retry` says otherwise; `retry-after-ms` makes it quick.
      const retry = reply.retryable ? { "retry-after-ms": "1" } : { "x-should-retry": "false" };
      const headers = { "content-type": "application/json", "request-id": requestId, ...retry };
      return res.writeHead(reply.status, headers).end(JSON.stringify(body));
    }
    const { input, output, cacheRead, write5m, write1h } = reply.usage;
    // Fields in the order of a real response (2026-11-16). It omits `citations` and `server_tool_use`, which SDK
    // 1.3.0's types require, so they are null here.
    const body: Message = {
      model,
      id: `msg_fake_${requests}`,
      type: "message",
      role: "assistant",
      content: [{ type: "text", text: "Scripted reply.", citations: null }],
      container: null,
      stop_reason: reply.stopReason ?? "end_turn",
      stop_sequence: null,
      stop_details: null,
      usage: {
        input_tokens: input,
        cache_creation_input_tokens: write5m + write1h,
        cache_read_input_tokens: cacheRead,
        cache_creation: reply.noCacheBreakdown
          ? null
          : { ephemeral_5m_input_tokens: write5m, ephemeral_1h_input_tokens: write1h },
        output_tokens: output,
        output_tokens_details: { thinking_tokens: 0 },
        service_tier: "standard",
        inference_geo: "global",
        speed: "standard",
        server_tool_use: null,
      },
      diagnostics: null,
    };
    res.writeHead(200, { "content-type": "application/json", "request-id": `req_fake_${requests}` });
    res.end(JSON.stringify(body));
  }
  const server = createServer((req, res) => {
    requests += 1;
    // A failure in the fake answers 500 with `x-should-retry: false`, so the SDK gives up at once and shows why.
    answer(req, res).catch((error: unknown) => res.writeHead(500, { "x-should-retry": "false" }).end(String(error)));
  });
  server.listen(0, "127.0.0.1"); // the app's config allows plain http only to localhost, 127.0.0.1 or [::1]
  await once(server, "listening");
  const address = server.address();
  if (address === null || typeof address === "string") throw new Error("model fake: no TCP address");
  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    script: (...replies: ScriptedReply[]) => void queue.push(...replies),
    requestCount: () => requests,
    // Node 24's close() also drops idle keep-alive sockets, so this doesn't hang on the SDK's pool.
    close: () => new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve()))),
  };
}
