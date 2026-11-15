// The WCAG 2 contrast ratio between two colours, from 1 (the same colour) to 21 (black on white). The brief asks for
// at least 4.5 on anything a player must read (docs/ui/THEME.md, rule 8).

// Relative luminance, as WCAG 2 defines it: each sRGB channel is made linear, then weighted by how bright the eye
// finds it.
function luminance(colour: string): number {
  if (!/^#[0-9a-f]{6}$/i.test(colour)) throw new Error(`Not a #rrggbb colour: ${JSON.stringify(colour)}`);
  const linear = (start: number) => {
    const channel = parseInt(colour.slice(start, start + 2), 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * linear(1) + 0.7152 * linear(3) + 0.0722 * linear(5);
}

export function contrastRatio(foreground: string, background: string): number {
  const [first, second] = [luminance(foreground), luminance(background)];
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}
