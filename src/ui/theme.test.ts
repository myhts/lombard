import { describe, expect, it } from "vitest";
import { contrastRatio } from "./contrast";
import { readThemeTokens } from "./theme-tokens";

// Every pair in the last column of the brief's colour table (docs/ui/THEME.md): text colour, then its ground.
const textPairs = [
  ["--color-ink", "--color-paper"],
  ["--color-ink", "--color-paper-aged"],
  ["--color-ink-soft", "--color-paper"],
  ["--color-ink-soft", "--color-paper-aged"],
  ["--color-wax", "--color-paper"],
  ["--color-prussian", "--color-paper"],
  ["--color-baize", "--color-paper"],
  ["--color-candle", "--color-night"],
  ["--color-candle", "--color-baize"],
  ["--color-readout", "--color-glass"],
  ["--color-signal", "--color-glass"],
] as const;

describe("the theme stylesheet's colours", () => {
  // Read from the stylesheet itself, so the tokens have one source and a changed colour is checked as it will ship.
  const tokens = readThemeTokens();

  function colour(name: string): string {
    const value = tokens.get(name);
    if (value === undefined) throw new Error(`${name} is not in the theme stylesheet`);
    return value;
  }

  it.each(textPairs)("%s on %s has a contrast of at least 4.5 to 1", (text, ground) => {
    expect(contrastRatio(colour(text), colour(ground))).toBeGreaterThanOrEqual(4.5);
  });
});
