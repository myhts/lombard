import { readFileSync } from "node:fs";
import path from "node:path";

// The theme stylesheet's tokens by name, in the order written. The specimen sheet and the contrast check both read
// them here, so the stylesheet stays the tokens' one source (docs/ui/THEME.md, rule 3).
export function readThemeTokens(): ReadonlyMap<string, string> {
  // Found from the working directory, which is the repo root for Next and for Vitest. A path built from
  // import.meta.url wouldn't survive Next's bundling.
  const stylesheet = readFileSync(path.join(process.cwd(), "src/ui/theme.css"), "utf8");
  const withoutComments = stylesheet.replace(/\/\*[\s\S]*?\*\//g, "");

  const tokens = new Map<string, string>();
  // `--color-*: initial;` clears a Tailwind namespace and isn't a token; the `*` keeps it from matching.
  for (const [, name = "", value = ""] of withoutComments.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    tokens.set(name, value.replace(/\s+/g, " ").trim());
  }
  return tokens;
}
