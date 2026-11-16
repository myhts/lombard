import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { copy } from "../copy";
import { textOf } from "../text-of";
import { StageDirection } from "./stage-direction";

describe("StageDirection", () => {
  // The wording of the brief's event table (docs/ui/THEME.md), one line to each tool.
  it.each([
    ["search_records", "He turns the pages of the Proceedings."],
    ["appraise", "He weighs it in his hand and reckons."],
    ["check_notices", "He looks over the notices by the door."],
  ] as const)("shows the copy file's line for %s", (tool, line) => {
    expect(copy.stageDirections[tool]).toBe(line);
    expect(textOf(renderToStaticMarkup(<StageDirection tool={tool} />))).toBe(line);
  });

  it("carries the waiting pulse only while its tool runs, and the pulse adds no words", () => {
    const running = renderToStaticMarkup(<StageDirection tool="appraise" running />);
    const returned = renderToStaticMarkup(<StageDirection tool="appraise" />);

    expect(running).toContain('aria-hidden="true"');
    expect(textOf(running)).toBe(copy.stageDirections.appraise);
    expect(returned).not.toContain("aria-hidden");
  });
});
