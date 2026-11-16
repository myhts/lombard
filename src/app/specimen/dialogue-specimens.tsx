import { copy } from "@/ui/copy";
import { Composer } from "@/ui/period/composer";
import { Dialogue, type DialogueLine } from "@/ui/period/dialogue";
import { Sheet } from "@/ui/period/sheet";
import { StageDirection, type StageDirectionTool } from "@/ui/period/stage-direction";
import { ExchangePlayer } from "./exchange-player";
import { Sample, SpecimenSection } from "./specimen-section";

const { dialogue, stageDirection, composer, exchange } = copy.specimen;

// Each state of the dialogue, frozen: the streaming line stops part-way, with the ink caret at its end.
const dialogueStates: { label: string; line: DialogueLine }[] = [
  { label: dialogue.pawnbroker, line: { speaker: "pawnbroker", words: exchange.question } },
  { label: dialogue.customer, line: { speaker: "customer", words: exchange.answer } },
  {
    label: dialogue.streaming,
    line: { speaker: "pawnbroker", words: exchange.question.slice(0, exchange.question.indexOf(",")), streaming: true },
  },
  { label: dialogue.stageDirection, line: { tool: "appraise", running: true } },
];

export function DialogueSpecimen() {
  return (
    <SpecimenSection id="dialogue" heading={dialogue.heading}>
      {dialogueStates.map(({ label, line }) => (
        <Sample key={label} label={label}>
          <Dialogue lines={[line]} className="mt-1" />
        </Sample>
      ))}
    </SpecimenSection>
  );
}

// One line to each tool in the copy file, as it is while the tool runs, and one as it stays after the tool returns.
const returnedTool: StageDirectionTool = "search_records";

export function StageDirectionSpecimen() {
  const tools = Object.keys(copy.stageDirections) as StageDirectionTool[]; // Object.keys widens the keys to string.
  return (
    <SpecimenSection id="stage-direction" heading={stageDirection.heading}>
      {tools.map((tool) => (
        <Sample key={tool} label={`${tool}, ${stageDirection.running}`}>
          <StageDirection tool={tool} running className="mt-1" />
        </Sample>
      ))}
      <Sample label={`${returnedTool}, ${stageDirection.returned}`}>
        <StageDirection tool={returnedTool} className="mt-1" />
      </Sample>
    </SpecimenSection>
  );
}

// The four states, without a handler: these samples show how each state looks, and send nothing.
export function ComposerSpecimen() {
  return (
    <SpecimenSection id="composer" heading={composer.heading}>
      <div className="grid gap-x-6 p-1 sm:grid-cols-2">
        {(["idle", "sending", "disabled", "over"] as const).map((state) => (
          <Sample key={state} label={composer[state]}>
            <Composer state={state} turnsLeft={3} className="mt-2" />
          </Sample>
        ))}
      </div>
    </SpecimenSection>
  );
}

// The exchange lies on baize as a sheet of its own, as the dialogue will on the counter.
export function ExchangeSpecimen() {
  return (
    <SpecimenSection id="exchange" heading={exchange.heading}>
      <div className="texture-baize mt-4 p-2 sm:p-6">
        <Sheet className="mx-auto max-w-2xl p-4 sm:p-8">
          <ExchangePlayer />
        </Sheet>
      </div>
    </SpecimenSection>
  );
}
