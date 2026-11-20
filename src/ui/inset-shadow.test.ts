import { describe, expect, it } from "vitest";
import { colourUnderInsetShadows } from "./inset-shadow";

// Every answer here is worked by hand: black shadows on a white ground, so a point's grey is 255 times the share of
// the shadow that isn't over it. The shares come from a table of the normal curve, never from the function itself.
const white = "#ffffff";
const box = { width: 320, height: 240 };
// Halfway down the box, where the top and bottom edges of every shadow here are too far off to count.
const midHeight = 120;

describe("colourUnderInsetShadows", () => {
  // The hole is the box moved 10px right, with nothing blurred: full shadow left of x=10 and none right of it.
  it.each([
    [5, "#000000"],
    [20, "#ffffff"],
  ])("gives a sharp shadow 10px wide, at x=%d, as %s", (x, colour) => {
    expect(colourUnderInsetShadows("inset 10px 0 0 0 #000000", white, box, { x, y: midHeight })).toBe(colour);
  });

  // Half of a Gaussian lies each side of its middle: 255 × 0.5 = 127.5, which rounds to 128.
  it("gives a point on a blurred edge half the shadow", () => {
    expect(colourUnderInsetShadows("inset 0 0 16px #000000", white, box, { x: 0, y: midHeight })).toBe("#808080");
  });

  // The edge is at x=10 and the blur of 8px is a standard deviation of 4px, so x=14 is one standard deviation into the
  // hole. A normal table gives 0.1587 beyond one standard deviation: 255 × 0.8413 = 214.53, which rounds to 215.
  it("takes the standard deviation of the blur as half the blur radius", () => {
    expect(colourUnderInsetShadows("inset 10px 0 8px 0 #000000", white, box, { x: 14, y: midHeight })).toBe("#d7d7d7");
  });

  // A blur of 16px is a standard deviation of 8px, and with no spread the left edge is at x=0 (the case above). The
  // last two rows are one point, x=0, which a spread of 8px either way puts one standard deviation from the edge: in
  // the shadow (255 × 0.1587 = 40.47, which rounds to 40) or in the hole (255 × 0.8413 = 214.53, which rounds to 215).
  it.each([
    ["a spread of 5px", "moves the edge in to x=5", "inset 0 0 16px 5px #000000", 5, "#808080"],
    ["a spread of 8px", "moves the edge in past x=0", "inset 0 0 16px 8px #000000", 0, "#282828"],
    ["a spread of -8px", "moves the edge out past x=0", "inset 0 0 16px -8px #000000", 0, "#d7d7d7"],
  ])("%s %s", (_spread, _move, shadow, x, colour) => {
    expect(colourUnderInsetShadows(shadow, white, box, { x, y: midHeight })).toBe(colour);
  });

  // The corner is on two edges, each of which leaves half the hole: a quarter of it is left, and three quarters of
  // the shadow lie over the point. 255 × 0.25 = 63.75, which rounds to 64.
  it("gives a corner on two blurred edges three quarters of the shadow", () => {
    expect(colourUnderInsetShadows("inset 0 0 16px #000000", white, box, { x: 0, y: 0 })).toBe("#404040");
  });

  // Both shadows are sharp and lie whole over x=5, so only the one on top shows.
  it("lays the first shadow in the list on top", () => {
    const shadows = "inset 10px 0 0 0 #ff0000, inset 10px 0 0 0 #0000ff";

    expect(colourUnderInsetShadows(shadows, white, box, { x: 5, y: midHeight })).toBe("#ff0000");
  });

  it.each([
    ["an outer shadow", "10px 0 0 0 #000000"],
    ["a colour written as rgb()", "inset 10px 0 0 0 rgb(0 0 0)"],
    ["a length in rem", "inset 1rem 0 0 0 #000000"],
  ])("refuses %s", (_form, shadow) => {
    expect(() => colourUnderInsetShadows(shadow, white, box, { x: 5, y: midHeight })).toThrow(
      `Not an inset shadow in px with a #rrggbb colour: ${JSON.stringify(shadow)}`,
    );
  });
});
