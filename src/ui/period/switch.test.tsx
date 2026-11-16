import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Switch } from "./switch";

describe("Switch", () => {
  it("is a native checkbox with the switch role, named by the label that wraps it, and off by default", () => {
    const markup = renderToStaticMarkup(<Switch label="Snuff the candle" />);

    expect(markup).toMatch(/^<label[^>]*>.*<input [^>]*\/>.*Snuff the candle.*<\/label>$/s);
    expect(markup).toMatch(/<input [^>]*type="checkbox"/);
    expect(markup).toMatch(/<input [^>]*role="switch"/);
    expect(markup).not.toContain(' checked=""');
  });

  it("passes native attributes through to the input: on, disabled", () => {
    const markup = renderToStaticMarkup(<Switch label="Snuff the candle" defaultChecked disabled />);

    expect(markup).toMatch(/<input [^>]* checked=""/);
    expect(markup).toMatch(/<input [^>]*disabled=""/);
  });
});
