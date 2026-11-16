import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Fleuron } from "./fleuron";

describe("Fleuron", () => {
  it("is an ornament: no text, hidden from assistive technology", () => {
    const markup = renderToStaticMarkup(<Fleuron />);

    expect(markup).toMatch(/^<svg [^>]*aria-hidden="true"/);
    expect(markup.replace(/<[^>]+>/g, "")).toBe("");
  });
});
