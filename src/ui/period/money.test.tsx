import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { textOf } from "../text-of";
import { formatMoney, Money } from "./money";

describe("formatMoney", () => {
  // The brief's inline amounts (docs/ui/THEME.md, "Money"): trailing zero parts are dropped, a zero between two parts
  // is kept.
  it.each([
    [0, "0d"],
    [11, "11d"],
    [12, "1s"],
    [239, "19s 11d"],
    [240, "£1"],
    [294, "£1 4s 6d"],
    [246, "£1 0s 6d"],
    [252, "£1 1s"],
    [240_000, "£1000"],
  ])("writes %i pence inline as %s", (pence, written) => {
    expect(formatMoney(pence)).toBe(written);
  });

  it.each([
    [294, "£1 4s 6d"],
    [6, "£0 0s 6d"],
    [240, "£1 0s 0d"],
    [0, "£0 0s 0d"],
  ])("writes %i pence as the ledger row %s, always all three parts", (pence, written) => {
    expect(formatMoney(pence, "ledger")).toBe(written);
  });

  it.each([
    ["a fraction of a penny", 1.5],
    ["an amount below zero", -1],
    ["not a number", Number.NaN],
    ["an infinite amount", Number.POSITIVE_INFINITY],
    ["an integer too large to be exact", Number.MAX_SAFE_INTEGER + 1],
  ])("rejects %s with an error that names the value", (_, pence) => {
    expect(() => formatMoney(pence)).toThrow(String(pence));
    expect(() => formatMoney(pence, "ledger")).toThrow(String(pence));
  });
});

describe("Money", () => {
  it("shows the inline form by default, and its accessible name is that text", () => {
    const markup = renderToStaticMarkup(<Money pence={294} />);

    expect(textOf(markup)).toBe("£1 4s 6d");
    expect(markup).not.toContain("aria-");
  });

  it("shows all three parts in the ledger form, read as one amount", () => {
    const markup = renderToStaticMarkup(<Money pence={6} form="ledger" />);

    expect(textOf(markup)).toBe("£0 0s 6d");
    expect(markup).not.toContain("aria-");
  });

  it("is an error, not a rounded display, for an amount that isn't whole pence", () => {
    expect(() => renderToStaticMarkup(<Money pence={0.5} />)).toThrow("0.5");
  });
});
