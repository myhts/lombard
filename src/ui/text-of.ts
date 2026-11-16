// For the interface's render tests: what a reader, sighted or not, gets from the markup, which is the text with the
// tags taken out. It sits beside the pieces because the boundary rules keep src/ui/ from importing test/, and its name
// doesn't end in .test.ts, so Vitest doesn't take it for a test file.
export function textOf(markup: string): string {
  return markup.replace(/<[^>]+>/g, "");
}
