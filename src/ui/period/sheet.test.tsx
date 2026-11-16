import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Sheet } from "./sheet";

describe("Sheet", () => {
  it.each(["plain", "aged", "lifted"] as const)("shows its content when %s, and hides none of it", (variant) => {
    const markup = renderToStaticMarkup(
      <Sheet variant={variant}>
        <p>A silver watch, lately pledged.</p>
      </Sheet>,
    );

    expect(markup).toContain("<p>A silver watch, lately pledged.</p>");
    // A sheet has no name of its own: what it holds is what a screen reader reads.
    expect(markup).not.toContain("aria-");
  });
});
