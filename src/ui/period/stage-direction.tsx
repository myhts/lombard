import { copy } from "../copy";

// A tool that has a stage direction. The copy file's map is the list, so a tool without a line doesn't compile.
export type StageDirectionTool = keyof typeof copy.stageDirections;

// An italic aside: what the pawnbroker is seen to do while a tool runs. The line stays once the tool has returned;
// only the waiting pulse beside it goes. The theme has one waiting pulse, shared with the composer; it adds no words.
export function StageDirection({
  tool,
  running = false,
  className = "",
}: {
  tool: StageDirectionTool;
  running?: boolean;
  className?: string;
}) {
  return (
    <p className={`text-ink-soft italic ${className}`}>
      {copy.stageDirections[tool]}
      {running && <span aria-hidden="true" className="waiting-pulse ml-2" />}
    </p>
  );
}
