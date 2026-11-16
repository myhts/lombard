import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { textOf } from "../text-of";
import { InkCaret } from "./ink-caret";

describe("InkCaret", () => {
  it.each([
    ["at rest", <InkCaret key="rest" />],
    ["writing", <InkCaret key="writing" writing />],
  ])("is a mark, not words, %s: no text, hidden from assistive technology", (_, caret) => {
    const markup = renderToStaticMarkup(caret);

    expect(markup).toMatch(/^<svg [^>]*aria-hidden="true"/);
    expect(textOf(markup)).toBe("");
  });
});
