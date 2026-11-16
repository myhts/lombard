import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Field } from "./field";

describe("Field", () => {
  it("names its input by the label that wraps it", () => {
    const markup = renderToStaticMarkup(<Field label="Invite code" />);

    // The input sits inside the label that holds the text: that wrapping is what gives it its accessible name.
    expect(markup).toMatch(/^<label[^>]*>.*Invite code.*<input [^>]*\/>.*<\/label>$/s);
  });

  it("passes native attributes through to the input", () => {
    const markup = renderToStaticMarkup(<Field label="Invite code" name="code" defaultValue="WATCH-1753" disabled />);

    expect(markup).toMatch(/<input [^>]*name="code"/);
    expect(markup).toMatch(/<input [^>]*value="WATCH-1753"/);
    expect(markup).toMatch(/<input [^>]*disabled=""/);
  });
});
