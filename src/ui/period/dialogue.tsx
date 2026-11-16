import { copy } from "../copy";
import { InkCaret } from "./ink-caret";
import { StageDirection, type StageDirectionTool } from "./stage-direction";

// One line of the dialogue: what a speaker says, a stage direction, or the saying that stands where the pawnbroker's
// answer will appear while the customer waits for it. `streaming` is true while a speaker's words still arrive;
// `running` is true while a stage direction's tool runs. `saying` is the saying's place in the copy file's list,
// counted from 0. The caller chooses it and changes it, and may simply count up: past the last saying, the list starts
// again from the first.
export type DialogueLine =
  | { speaker: keyof typeof copy.speakers; words: string; streaming?: boolean }
  | { tool: StageDirectionTool; running?: boolean }
  | { saying: number };

// How each speaker's line is set, so the two can be told apart at a glance by two cues and no colour (settled in #19):
// the Pawnbroker's name in small capitals, flush left; the Customer's name in the display face's italic, and the whole
// line set in from the margin behind a hairline rule. The italic is a size up because the face runs small.
const setting = {
  pawnbroker: { line: "", name: "font-display-sc" },
  customer: { line: "ml-6 border-l border-ink-soft pl-3", name: "font-display text-lg leading-none italic" },
} as const;

// The saying shown while we wait: the writing nib, the words in soft italic, then the source in small capitals. It
// never carries the Pawnbroker's name, so it can't be taken for his answer. It is decoration, so the whole line is
// hidden from assistive technology; the log is busy while it stands, and the caller's composer is sending meanwhile.
function WaitingSaying({ place }: { place: number }) {
  // Only a whole number, zero or more, finds a saying. Anything else is a fault in the caller's counting, and showing
  // some saying anyway would hide it. The place is checked before the list is read, because a negative multiple of the
  // list's length leaves a remainder of -0, which would find the first saying.
  const saying = Number.isInteger(place) && place >= 0 ? copy.sayings[place % copy.sayings.length] : undefined;
  if (!saying) throw new Error(`A saying's place is a whole number, zero or more, but got ${String(place)}`);

  return (
    <p aria-hidden="true" className="flex items-baseline gap-2 text-ink-soft">
      <InkCaret writing />
      <span>
        <span className="italic">{saying.words}</span>{" "}
        <span className="font-display-sc whitespace-nowrap">{saying.source}</span>
      </span>
    </p>
  );
}

// The conversation, set like the question-and-answer text of the Proceedings: the speaker's name and a full stop, then
// the words. No chat bubbles (docs/ui/THEME.md, "Period pieces"). It holds no state: the lines are drawn as given, in
// order.
export function Dialogue({ lines, className = "" }: { lines: readonly DialogueLine[]; className?: string }) {
  return (
    // A log, so a screen reader reads each new line as it is added. While a line streams the log is busy, so that the
    // line is read whole when it ends and not word by word. It is busy, too, while a saying stands for an answer still
    // to come.
    <div
      role="log"
      aria-label={copy.dialogue.label}
      aria-busy={lines.some((line) => "saying" in line || ("speaker" in line && line.streaming)) || undefined}
      className={`flex flex-col gap-3 ${className}`}
    >
      {lines.map((line, index) =>
        "tool" in line ? (
          // Lines are only ever added at the end, so a line's place is its key.
          <StageDirection key={index} tool={line.tool} running={line.running} className="pl-6" />
        ) : "saying" in line ? (
          // The pawnbroker's answer takes the saying's place. A key of its own makes that answer a new line in the
          // log, which a screen reader reads, and not a hidden line that changed.
          <WaitingSaying key={`saying-${index}`} place={line.saying} />
        ) : (
          <p key={index} className={setting[line.speaker].line}>
            <span className={setting[line.speaker].name}>{copy.speakers[line.speaker]}.</span>{" "}
            {/* A customer's line may hold line breaks, from Shift+Enter in the composer. */}
            <span className="whitespace-pre-line">{line.words}</span>
            {line.streaming && <InkCaret />}
          </p>
        ),
      )}
    </div>
  );
}
