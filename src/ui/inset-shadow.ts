// The colour a box has at one point under its inset shadows. The theme's contrast check uses it to find the paper's
// colour near an aged sheet's edges (theme.test.ts; docs/ui/THEME.md, "Soft ink on aged paper").
//
// The model is the CSS specification's (Backgrounds and Borders 3, "box-shadow"). An inset shadow covers the box except
// for a hole: the padding box, moved by the offset and shrunk by the spread. The hole's edge is blurred by a Gaussian
// whose standard deviation is half the blur radius. The first shadow in the list lies on top, and each is mixed over
// what is under it in sRGB, as a browser mixes colours.
// Left out: the box's corner radius, which --radius-paper keeps at 1px, and a browser whose blur differs from the
// specification's.

type Channels = readonly [number, number, number];

// Each shadow as the stylesheet writes one: `inset`, two to four lengths in px, then a #rrggbb colour. Any other form
// is refused, not guessed at, so a shadow this can't read fails the check instead of passing it.
const shadowForm = /^inset((?: (?:-?\d*\.?\d+px|0)){2,4}) (#[0-9a-f]{6})$/i;

function channels(colour: string): Channels {
  if (!/^#[0-9a-f]{6}$/i.test(colour)) throw new Error(`Not a #rrggbb colour: ${JSON.stringify(colour)}`);
  const channel = (start: number) => parseInt(colour.slice(start, start + 2), 16);
  return [channel(1), channel(3), channel(5)];
}

// The error function, by Abramowitz and Stegun's formula 7.1.26: JavaScript has none, and this one is right to 1.5e-7.
function erf(x: number): number {
  const t = 1 / (1 + 0.3275911 * Math.abs(x));
  const polynomial = ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t;
  return Math.sign(x) * (1 - polynomial * Math.exp(-x * x));
}

// How much of a blurred edge has been crossed, from 0 to 1, at `distance` past where the sharp edge was.
function crossed(distance: number, sigma: number): number {
  if (sigma === 0) return distance >= 0 ? 1 : 0;
  return 0.5 * (1 + erf(distance / (sigma * Math.SQRT2)));
}

// How much of one shadow lies over the point, from 0 (the middle of the hole) to 1 (the full colour).
function cover(lengths: string, box: { width: number; height: number }, point: { x: number; y: number }): number {
  const [x = 0, y = 0, blur = 0, spread = 0] = lengths.trim().split(" ").map(parseFloat);
  const sigma = blur / 2;
  const across = crossed(point.x - (x + spread), sigma) - crossed(point.x - (box.width + x - spread), sigma);
  const down = crossed(point.y - (y + spread), sigma) - crossed(point.y - (box.height + y - spread), sigma);
  return 1 - across * down;
}

// `shadows` is a `box-shadow` value with its colours already written as #rrggbb. `point` is in px from the box's top
// left corner. The answer is rounded to #rrggbb, as a screen rounds it.
export function colourUnderInsetShadows(
  shadows: string,
  ground: string,
  box: { width: number; height: number },
  point: { x: number; y: number },
): string {
  let mixed = channels(ground);
  // The last shadow in the list is painted first.
  for (const shadow of shadows.split(",").reverse()) {
    const [, lengths = "", colour = ""] = shadowForm.exec(shadow.trim()) ?? [];
    if (colour === "") throw new Error(`Not an inset shadow in px with a #rrggbb colour: ${JSON.stringify(shadow)}`);
    const share = cover(lengths, box, point);
    const [red, green, blue] = channels(colour);
    mixed = [
      mixed[0] + (red - mixed[0]) * share,
      mixed[1] + (green - mixed[1]) * share,
      mixed[2] + (blue - mixed[2]) * share,
    ];
  }
  return `#${mixed.map((channel) => Math.round(channel).toString(16).padStart(2, "0")).join("")}`;
}
