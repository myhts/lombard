import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { copy } from "../copy";
import { textOf } from "../text-of";
import { ShopSign } from "./shop-sign";

describe("ShopSign", () => {
  it("shows the shop's name when open, with the three balls as decoration", () => {
    const markup = renderToStaticMarkup(<ShopSign name="The Three Balls" />);

    expect(textOf(markup)).toBe("The Three Balls");
    expect(markup).toMatch(/<svg [^>]*aria-hidden="true"/);
  });

  it("adds the copy file's word for closed when closed", () => {
    const markup = renderToStaticMarkup(<ShopSign name="The Three Balls" closed />);

    expect(markup).toContain("The Three Balls");
    expect(markup).toContain(copy.shopSign.closed);
    expect(copy.shopSign.closed).toBe("Closed");
  });
});
