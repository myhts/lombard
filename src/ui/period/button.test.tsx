import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Button } from "./button";

describe("Button", () => {
  it("is a native button named by its text, and doesn't submit a form unless asked to", () => {
    const markup = renderToStaticMarkup(<Button>Say it</Button>);

    expect(markup).toMatch(/^<button [^>]*>Say it<\/button>$/);
    expect(markup).toContain('type="button"');
  });

  it("passes native attributes through: another name, another type, disabled", () => {
    const markup = renderToStaticMarkup(
      <Button type="submit" aria-label="Send your words" disabled>
        Say it
      </Button>,
    );

    expect(markup).toContain('aria-label="Send your words"');
    expect(markup).toContain('type="submit"');
    expect(markup).toContain('disabled=""');
  });
});
