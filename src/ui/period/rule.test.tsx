import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Rule } from "./rule";

describe("Rule", () => {
  it.each(["thin", "double", "flower"] as const)("is an ornament when %s: no text, hidden as a whole", (variant) => {
    const markup = renderToStaticMarkup(<Rule variant={variant} />);

    // The outermost element carries the hiding, so nothing inside it, the flower included, is announced.
    expect(markup).toMatch(/^<[a-z]+ [^>]*aria-hidden="true"/);
    expect(markup.replace(/<[^>]+>/g, "")).toBe("");
  });
});
