// Token counts for one call, by the kinds Anthropic prices. The wrapper maps the SDK's usage to it, so this file stays
// free of the SDK.
export type TokenUsage = { input: number; output: number; cacheRead: number; write5m: number; write1h: number };

// Integer nano-dollars per token: every price here is whole at that unit ($1/MTok = 1,000), so a cost is tokens × price
// with no rounding. A price with more than 3 decimals of $/MTok wouldn't fit: adding one needs an ADR, not rounding.
export type TierPrice = Record<keyof TokenUsage, number>;
export type Tier = "normal" | "long";
export type ModelPrice = Record<Tier, TierPrice>;

// A prompt (input + cache reads + cache writes) over this many tokens is billed at the long tier; exactly this is normal.
export const LONG_PROMPT_TOKENS = 100_000;

// List prices from Anthropic's pricing page, as of 2026-11 (rechecked on #6, 2026-11-16).
export const PRICES: Readonly<Record<string, ModelPrice>> = {
  "claude-haiku-5-5": {
    normal: { input: 100, output: 500, cacheRead: 10, write5m: 125, write1h: 200 },
    long: { input: 500, output: 2_500, cacheRead: 50, write5m: 625, write1h: 1_000 },
  },
};

/** The model's price, or undefined when it has none and must be refused before any request. */
export function priceFor(model: string): ModelPrice | undefined {
  // hasOwn, so a model id like "toString" can't pick up the object's prototype.
  return Object.hasOwn(PRICES, model) ? PRICES[model] : undefined;
}

export function costNanoUsd(price: ModelPrice, usage: TokenUsage): number {
  const promptTokens = usage.input + usage.cacheRead + usage.write5m + usage.write1h;
  const tier: Tier = promptTokens > LONG_PROMPT_TOKENS ? "long" : "normal";
  const p = price[tier];
  return (
    usage.input * p.input +
    usage.output * p.output +
    usage.cacheRead * p.cacheRead +
    usage.write5m * p.write5m +
    usage.write1h * p.write1h
  );
}
