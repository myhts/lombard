import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { copy } from "../copy";
import { Dialogue } from "./dialogue";

describe("Dialogue", () => {
  const textOf = (markup: string) => markup.replace(/<[^>]+>/g, "");

  it("sets each line as the speaker's name, then the words, and is named as the conversation", () => {
    const markup = renderToStaticMarkup(
      <Dialogue
        lines={[
          { speaker: "customer", words: "I have a watch to pledge." },
          { speaker: "pawnbroker", words: "Let me see it." },
        ]}
      />,
    );

    expect(textOf(markup)).toBe("Customer. I have a watch to pledge.Pawnbroker. Let me see it.");
    expect(markup).toContain('aria-label="The conversation"');
  });

  it("ends a line with the ink caret while it streams, and without it once the stream has ended", () => {
    const streaming = renderToStaticMarkup(
      <Dialogue lines={[{ speaker: "pawnbroker", words: "Let me", streaming: true }]} />,
    );
    const ended = renderToStaticMarkup(<Dialogue lines={[{ speaker: "pawnbroker", words: "Let me see it." }]} />);

    // The caret is the only thing a line hides from assistive technology, and it comes after the words.
    expect(streaming).toMatch(/Let me.*<svg [^>]*aria-hidden="true"/);
    expect(textOf(streaming)).toBe("Pawnbroker. Let me");
    expect(streaming).toContain('aria-busy="true"');
    expect(ended).not.toContain("<svg");
    expect(ended).not.toContain('aria-busy="true"');
  });

  it("sets a stage direction among the lines, in the copy file's words for its tool", () => {
    const markup = renderToStaticMarkup(
      <Dialogue lines={[{ speaker: "customer", words: "It was left to me." }, { tool: "search_records" }]} />,
    );

    expect(textOf(markup)).toBe(`Customer. It was left to me.${copy.stageDirections.search_records}`);
  });
});
