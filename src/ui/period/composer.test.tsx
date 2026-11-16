import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Composer } from "./composer";

// A render test runs no handlers, so sending by keyboard is checked in the browser (test/ui/specimen.shots.ts).
describe("Composer", () => {
  const textOf = (markup: string) => markup.replace(/<[^>]+>/g, "");
  const box = (markup: string) => /<textarea [^>]*>/.exec(markup)?.[0];
  const button = (markup: string) => /<button [^>]*>/.exec(markup)?.[0];

  it("shows a text box named by its label, a button that sends, and the turns left when idle", () => {
    const markup = renderToStaticMarkup(<Composer state="idle" turnsLeft={3} />);

    // The box sits inside the label that holds the text: that wrapping is what gives it its accessible name.
    expect(markup).toMatch(/<label[^>]*>.*What do you say\?.*<textarea [^>]*>.*<\/label>/s);
    expect(markup).toMatch(/<button [^>]*type="submit"[^>]*>Say it<\/button>/);
    expect(textOf(markup)).toBe("What do you say?Say it3 turns left");
    expect(markup).not.toContain('disabled=""');
  });

  it.each([
    [2, "2 turns left"],
    [1, "1 turn left"],
    [0, "No turns left"],
  ])("writes %i as %s", (turnsLeft, words) => {
    expect(renderToStaticMarkup(<Composer state="idle" turnsLeft={turnsLeft} />)).toContain(words);
  });

  it("says it is sending and holds the button while sending, and the box can still be written in", () => {
    const markup = renderToStaticMarkup(<Composer state="sending" turnsLeft={3} />);

    expect(markup).toMatch(/<[^>]*role="status"[^>]*>.*Sending.*3 turns left/s);
    expect(button(markup)).toContain('disabled=""');
    expect(box(markup)).not.toContain('disabled=""');
  });

  it("holds the box and the button when disabled, and still shows the turns left", () => {
    const markup = renderToStaticMarkup(<Composer state="disabled" turnsLeft={3} />);

    expect(box(markup)).toContain('disabled=""');
    expect(button(markup)).toContain('disabled=""');
    expect(textOf(markup)).toBe("What do you say?Say it3 turns left");
  });

  it("says the visit is over in place of the turns left, and holds the box and the button", () => {
    const markup = renderToStaticMarkup(<Composer state="over" turnsLeft={2} />);

    expect(box(markup)).toContain('disabled=""');
    expect(button(markup)).toContain('disabled=""');
    expect(textOf(markup)).toBe("What do you say?Say itThe visit is over.");
  });
});
