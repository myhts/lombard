import { describe, expect, it } from "vitest";
import { errorCodeSuffix } from "./error-code";

const withCode = (code: unknown, cause?: unknown) => Object.assign(new Error("SENTINEL message"), { code, cause });

describe("errorCodeSuffix", () => {
  it.each([
    ["a SQLSTATE", withCode("28P01"), " (28P01)"],
    ["an errno", withCode("ECONNREFUSED"), " (ECONNREFUSED)"],
    ["a code on the wrapped cause", new Error("Failed query", { cause: withCode("57P01") }), " (57P01)"],
  ])("gives %s", (_case, error, suffix) => {
    expect(errorCodeSuffix(error)).toBe(suffix);
  });

  it.each([
    ["no code", new Error("SENTINEL message")],
    ["a code that could hold a value", withCode("SENTINEL password=x")],
    ["a lower-case code", withCode("sentinel")],
    ["a code over 32 characters", withCode("A".repeat(33))],
    ["a code that isn't a string", withCode(28)],
    ["a thrown string", "SENTINEL"],
    ["undefined", undefined],
  ])("gives nothing for %s", (_case, error) => {
    expect(errorCodeSuffix(error)).toBe("");
  });

  it("stops on a cause that loops", () => {
    const error = withCode(undefined);
    error.cause = error;

    expect(errorCodeSuffix(error)).toBe("");
  });
});
