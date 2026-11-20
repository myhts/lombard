import { describe, expect, it } from "vitest";
import { contrastRatio } from "./contrast";
import { colourUnderInsetShadows } from "./inset-shadow";
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
  ["--color-candle", "--color-oak"],
  ["--color-readout", "--color-glass"],
  ["--color-signal", "--color-glass"],
] as const;

// The nearest a piece may set text to an aged sheet's edges: `p-4`, four steps of --spacing (docs/ui/THEME.md, "Soft ink
// on aged paper").
const clearanceSteps = 4;
// A rem in px at a browser's usual text size. A reader who asks for larger text gets more padding and the same shadow.
const pxPerRem = 16;
// The sheet the places are worked out on, in px. Any size will do at which no edge's shadow reaches the far side, and
// a sheet that holds one line of text inside `p-4` is already tall enough for that.
const agedSheet = { width: 320, height: 240 };
// The four sides and the four corners: how far across and down the text's box each place is, from 0 to 1.
const placesOnAgedSheet = [
  ["the top side", 0.5, 0],
  ["the right side", 1, 0.5],
  ["the bottom side", 0.5, 1],
  ["the left side", 0, 0.5],
  ["the top-left corner", 0, 0],
  ["the top-right corner", 1, 0],
  ["the bottom-left corner", 0, 1],
  ["the bottom-right corner", 1, 1],
] as const;

describe("the theme stylesheet's colours", () => {
  // Read from the stylesheet itself, so the tokens have one source and a changed colour is checked as it will ship.
  const tokens = readThemeTokens();

  function token(name: string): string {
    const value = tokens.get(name);
    if (value === undefined) throw new Error(`${name} is not in the theme stylesheet`);
    return value;
  }

  it.each(textPairs)("%s on %s has a contrast of at least 4.5 to 1", (text, ground) => {
    expect(contrastRatio(token(text), token(ground))).toBeGreaterThanOrEqual(4.5);
  });

  // An aged sheet is paper-aged under the aged edges (period/sheet.tsx), which darken the paper towards each edge. The
  // sums take the paper's average colour and leave the laid texture out, as the stylesheet's own reasoning does.
  it.each(placesOnAgedSheet)(
    "--color-ink-soft on an aged sheet, `p-4` in at %s, has a contrast of at least 4.5 to 1",
    (_place, across, down) => {
      const [, rems] = /^([\d.]+)rem$/.exec(token("--spacing")) ?? [];
      if (rems === undefined) throw new Error(`--spacing is not in rem: ${token("--spacing")}`);
      const clearance = clearanceSteps * Number(rems) * pxPerRem;
      const agedEdges = token("--inset-shadow-aged-edges").replace(/var\((--[a-z0-9-]+)\)/g, (_, name: string) =>
        token(name),
      );

      const paper = colourUnderInsetShadows(agedEdges, token("--color-paper-aged"), agedSheet, {
        x: clearance + across * (agedSheet.width - 2 * clearance),
        y: clearance + down * (agedSheet.height - 2 * clearance),
      });

      expect(contrastRatio(token("--color-ink-soft"), paper)).toBeGreaterThanOrEqual(4.5);
    },
  );
});
