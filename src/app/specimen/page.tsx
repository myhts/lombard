import type { ReactNode } from "react";
import { copy } from "@/ui/copy";
import { readThemeTokens } from "@/ui/theme-tokens";

// One entry of the type specimen: the token it shows, in soft ink, then the sample itself.
function Sample({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mt-6">
      <p className="text-sm text-ink-soft">{label}</p>
      {children}
    </div>
  );
}

// The specimen sheet (GLOSSARY.md). Each <section data-specimen> is one picture from `pnpm ui:shots`.
export default function SpecimenPage() {
  // Names and values come from the theme stylesheet itself, so a new colour or size shows up here without an edit.
  const tokens = [...readThemeTokens()];
  const colours = tokens.filter(([name]) => name.startsWith("--color-"));
  const sizes = tokens.filter(([name]) => /^--text-[a-z0-9]+$/.test(name));
  const { palette, type } = copy.specimen;

  return (
    // A flat paper-coloured block for now; `Sheet` arrives in #18.
    <main className="mx-auto max-w-5xl rounded-paper bg-paper p-4 text-ink shadow-resting sm:p-10">
      <h1 className="font-display text-2xl sm:text-3xl">{copy.specimen.title}</h1>
      <p className="italic">{copy.specimen.madeUpData}</p>

      <section data-specimen="palette" className="mt-10">
        <h2 className="font-display-sc text-xl">{palette.heading}</h2>
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
      </section>

      <section data-specimen="type" className="mt-10">
        <h2 className="font-display-sc text-xl">{type.heading}</h2>
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

        <h3 className="mt-10 font-display-sc text-lg">{type.sizes.heading}</h3>
        {sizes.map(([name, value]) => (
          <Sample key={name} label={`${name}: ${value}`}>
            <p className="leading-tight" style={{ fontSize: `var(${name})` }}>
              {type.sizes.sample}
            </p>
          </Sample>
        ))}
      </section>
    </main>
  );
}
