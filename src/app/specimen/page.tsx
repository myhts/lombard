import { copy } from "@/ui/copy";
import { Sheet } from "@/ui/period/sheet";
import { readThemeTokens } from "@/ui/theme-tokens";
import { ButtonSpecimen, FieldSpecimen, SwitchSpecimen } from "./control-specimens";
import { ComposerSpecimen, DialogueSpecimen, ExchangeSpecimen, StageDirectionSpecimen } from "./dialogue-specimens";
import { MoneySpecimen } from "./money-specimen";
import { RuleSpecimen, SheetSpecimen, ShopSignSpecimen } from "./paper-specimens";
import { Sample, SpecimenSection } from "./specimen-section";

// The specimen sheet (GLOSSARY.md). Each section is one picture from `pnpm ui:shots`.
export default function SpecimenPage() {
  // Names and values come from the theme stylesheet itself, so a new colour or size shows up here without an edit.
  const tokens = [...readThemeTokens()];
  const colours = tokens.filter(([name]) => name.startsWith("--color-"));
  const sizes = tokens.filter(([name]) => /^--text-[a-z0-9]+$/.test(name));
  const { palette, type } = copy.specimen;

  return (
    <main className="mx-auto max-w-5xl">
      <Sheet className="p-4 sm:p-10">
        <h1 className="type-pressed font-display text-2xl sm:text-3xl">{copy.specimen.title}</h1>
        <p className="italic">{copy.specimen.madeUpData}</p>

        <SpecimenSection id="palette" heading={palette.heading}>
          <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {colours.map(([name, value]) => (
              <li key={name}>
                <div
                  className="h-16 rounded-paper border border-paper-edge"
                  style={{ backgroundColor: `var(${name})` }}
                />
                <p className="mt-1 text-sm">{name}</p>
                <p className="text-sm text-ink-soft">{value}</p>
              </li>
            ))}
          </ul>
        </SpecimenSection>

        <SpecimenSection id="type" heading={type.heading}>
          <Sample label={`--font-text · ${type.text.face}`}>
            <p className="text-lg">{type.text.sample}</p>
            <p className="text-lg italic">{type.text.italicSample}</p>
          </Sample>
          <Sample label={`--font-display · ${type.display.face}`}>
            <p className="font-display text-2xl">{type.display.sample}</p>
          </Sample>
          <Sample label={`--font-display-sc · ${type.displaySc.face}`}>
            <p className="font-display-sc text-xl">{type.displaySc.sample}</p>
          </Sample>
          <Sample label={`--font-hand · ${type.hand.face}`}>
            <p className="font-hand text-3xl">{type.hand.sample}</p>
          </Sample>
          <Sample label={`--font-instrument · ${type.instrument.face}`}>
            {/* The instrument face is shown on its own layer's glass, never on paper. */}
            <p className="mt-1 bg-glass p-3 font-instrument text-sm whitespace-pre-wrap text-readout">
              {type.instrument.sample}
            </p>
          </Sample>

          <h3 className="type-pressed mt-10 font-display-sc text-lg">{type.sizes.heading}</h3>
          {sizes.map(([name, value]) => (
            <Sample key={name} label={`${name}: ${value}`}>
              <p className="leading-tight" style={{ fontSize: `var(${name})` }}>
                {type.sizes.sample}
              </p>
            </Sample>
          ))}
        </SpecimenSection>

        <MoneySpecimen />
        <SheetSpecimen />
        <RuleSpecimen />
        <ShopSignSpecimen />
        <ButtonSpecimen />
        <FieldSpecimen />
        <SwitchSpecimen />
        <DialogueSpecimen />
        <StageDirectionSpecimen />
        <ComposerSpecimen />
        <ExchangeSpecimen />
      </Sheet>
    </main>
  );
}
