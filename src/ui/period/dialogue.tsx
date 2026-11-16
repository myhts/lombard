import { copy } from "../copy";
import { InkCaret } from "./ink-caret";
import { StageDirection, type StageDirectionTool } from "./stage-direction";

// One line of the dialogue: what a speaker says, or a stage direction. `streaming` is true while a speaker's words
// still arrive; `running` is true while a stage direction's tool runs.
export type DialogueLine =
  | { speaker: keyof typeof copy.speakers; words: string; streaming?: boolean }
  | { tool: StageDirectionTool; running?: boolean };

// The conversation, set like the question-and-answer text of the Proceedings: the speaker's name in small capitals and
// a full stop, then the words. No chat bubbles (docs/ui/THEME.md, "Period pieces"). It holds no state: the lines are
// drawn as given, in order.
export function Dialogue({ lines, className = "" }: { lines: readonly DialogueLine[]; className?: string }) {
  return (
    // A log, so a screen reader reads each new line as it is added. While a line streams the log is busy, so that the
    // line is read whole when it ends and not word by word.
    <div
      role="log"
      aria-label={copy.dialogue.label}
      aria-busy={lines.some((line) => "speaker" in line && line.streaming) || undefined}
      className={`flex flex-col gap-3 ${className}`}
    >
      {lines.map((line, index) =>
        "tool" in line ? (
          // Lines are only ever added at the end, so a line's place is its key.
          <StageDirection key={index} tool={line.tool} running={line.running} className="pl-6" />
        ) : (
          <p key={index}>
            <span className="font-display-sc">{copy.speakers[line.speaker]}.</span>{" "}
            {/* A customer's line may hold line breaks, from Shift+Enter in the composer. */}
            <span className="whitespace-pre-line">{line.words}</span>
            {line.streaming && <InkCaret />}
          </p>
        ),
      )}
    </div>
  );
}
