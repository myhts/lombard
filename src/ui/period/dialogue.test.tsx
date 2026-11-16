import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { copy } from "../copy";
import { textOf } from "../text-of";
import { Dialogue } from "./dialogue";

describe("Dialogue", () => {
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

  it("stands a saying where the pawnbroker's answer will appear: its words, then its source, and never his name", () => {
    const markup = renderToStaticMarkup(
      <Dialogue lines={[{ speaker: "customer", words: "It was left to me." }, { saying: 0 }]} />,
    );

    expect(textOf(markup)).toBe("Customer. It was left to me.Neither a borrower nor a lender be. Hamlet");
    expect(textOf(markup)).not.toContain(copy.speakers.pawnbroker);
  });

  it("hides the saying from assistive technology, and is busy while it stands", () => {
    const waiting = renderToStaticMarkup(<Dialogue lines={[{ saying: 4 }]} />);
    const answered = renderToStaticMarkup(<Dialogue lines={[{ speaker: "pawnbroker", words: "Let me see it." }]} />);

    // The nib, the words and the source are one hidden line: with it taken out, the log holds no text at all.
    const hiddenLine = /<p [^>]*aria-hidden="true".*<\/p>/;
    expect(waiting).toMatch(hiddenLine);
    expect(textOf(waiting)).toBe("Honesty is the best policy. Proverb");
    expect(textOf(waiting.replace(hiddenLine, ""))).toBe("");
    expect(waiting).toContain('aria-busy="true"');
    expect(answered).not.toContain("aria-hidden");
    expect(answered).not.toContain('aria-busy="true"');
  });

  // The wording the owner settled in #19, checked against printed sources: the saying, then what is printed after it.
  it.each([
    ["Neither a borrower nor a lender be.", "Hamlet"],
    ["All that glisters is not gold.", "The Merchant of Venice"],
    ["He that goes a borrowing goes a sorrowing.", "Proverb"],
    ["A fool and his money are soon parted.", "Proverb"],
    ["Honesty is the best policy.", "Proverb"],
    ["Better go to bed supperless than rise in debt.", "Proverb"],
    ["Good paymasters need not bring a pawn.", "Proverb"],
    ["Out of debt, out of danger.", "Proverb"],
    ["Good bargains are pickpockets.", "Proverb"],
    ["Debt is the worst poverty.", "Proverb"],
    ["The rich ruleth over the poor, and the borrower is servant to the lender.", "The Book of Proverbs"],
  ])("shows the saying %j, from %s, by its place in the copy file", (words, source) => {
    const place = copy.sayings.findIndex((saying) => saying.words === words);

    expect(textOf(renderToStaticMarkup(<Dialogue lines={[{ saying: place }]} />))).toBe(`${words} ${source}`);
  });

  it("holds eleven sayings", () => {
    expect(copy.sayings).toHaveLength(11);
  });

  it("starts again from the first saying past the last, so a caller can count up", () => {
    const past = renderToStaticMarkup(<Dialogue lines={[{ saying: copy.sayings.length }]} />);

    expect(textOf(past)).toBe("Neither a borrower nor a lender be. Hamlet");
  });

  // -11 is a multiple of the list's length: its remainder is -0, which would find the first saying.
  it.each([0.5, -1, -11])("refuses %j as a saying's place, because it is no whole number from 0 up", (place) => {
    expect(() => renderToStaticMarkup(<Dialogue lines={[{ saying: place }]} />)).toThrow(
      `A saying's place is a whole number, zero or more, but got ${String(place)}`,
    );
  });
});
