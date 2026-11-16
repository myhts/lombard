import { copy } from "@/ui/copy";
import { Money } from "@/ui/period/money";
import { Sample, SpecimenSection } from "./specimen-section";

// Made-up amounts, in whole pence: each inline form the brief lists, then a ledger whose rows differ in every column.
const inlineAmounts = [0, 11, 12, 239, 240, 294, 246];
const { money } = copy.specimen;
const ledgerRows = [
  { pledge: money.pledges.watch, pence: 294 },
  { pledge: money.pledges.buckles, pence: 6 },
  { pledge: money.pledges.coat, pence: 240 },
  { pledge: money.pledges.ring, pence: 2879 },
];

export function MoneySpecimen() {
  return (
    <SpecimenSection id="money" heading={money.heading}>
      <Sample label={money.inline}>
        <ul className="mt-1 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
          {inlineAmounts.map((pence) => (
            <li key={pence}>
              <Money pence={pence} />
              <span className="block text-sm text-ink-soft">{`pence={${pence}}`}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4">
          {money.sentence} <Money pence={294} />.
        </p>
      </Sample>

      <Sample label={money.ledger}>
        <ul className="mt-1 max-w-sm">
          {ledgerRows.map(({ pledge, pence }) => (
            <li key={pledge} className="flex justify-between gap-4 border-b border-paper-edge py-1">
              <span>{pledge}</span>
              <Money pence={pence} form="ledger" />
            </li>
          ))}
        </ul>
      </Sample>
    </SpecimenSection>
  );
}
