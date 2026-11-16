import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { textOf } from "../text-of";
import { InkCaret } from "./ink-caret";

describe("InkCaret", () => {
  it("is a mark, not words: no text, hidden from assistive technology", () => {
    const markup = renderToStaticMarkup(<InkCaret />);

    expect(markup).toMatch(/^<svg [^>]*aria-hidden="true"/);
    expect(textOf(markup)).toBe("");
  });
});
