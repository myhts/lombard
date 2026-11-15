import { describe, expect, it } from "vitest";
import { contrastRatio } from "./contrast";

describe("contrastRatio", () => {
  it("gives 21 for black on white, the highest ratio there is", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
  });

  it("gives 1 for a colour on itself", () => {
    expect(contrastRatio("#8c1c13", "#8c1c13")).toBe(1);
  });

  // The two greys either side of 4.5 on white, the usual check of a WCAG contrast calculation.
  it.each([
    ["#767676", 4.54],
    ["#777777", 4.48],
  ])("gives %s on white as %d", (grey, ratio) => {
    expect(contrastRatio(grey, "#ffffff")).toBeCloseTo(ratio, 2);
  });

  it("gives the same ratio whichever colour comes first", () => {
    expect(contrastRatio("#f1e7d0", "#1f1a14")).toBe(contrastRatio("#1f1a14", "#f1e7d0"));
  });

  it("reads upper-case hex digits", () => {
    expect(contrastRatio("#FFFFFF", "#000000")).toBeCloseTo(21, 5);
  });

  it.each(["f1e7d0", "#fff", "#f1e7d0ff", "#gggggg", "rgb(0 0 0)", ""])("rejects %j, which isn't #rrggbb", (colour) => {
    expect(() => contrastRatio(colour, "#ffffff")).toThrow(`Not a #rrggbb colour: ${JSON.stringify(colour)}`);
  });
});
