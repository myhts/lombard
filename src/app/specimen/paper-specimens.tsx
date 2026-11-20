import { copy } from "@/ui/copy";
import { Fleuron } from "@/ui/period/fleuron";
import { Rule } from "@/ui/period/rule";
import { Sheet } from "@/ui/period/sheet";
import { ShopSign } from "@/ui/period/shop-sign";
import { Sample, SpecimenSection } from "./specimen-section";

const { sheet, rule, shopSign } = copy.specimen;

// The three sheets lie on baize, as they will on the counter, so the resting and lifted shadows can be told apart.
// Each carries a display heading, which is pressed, and a line of body text, which is not.
// The aged sheet ends with a line of soft ink set to the right, so its last words lie in the bottom-right corner, where
// the aged edges are darkest. The sheet's `p-4` is the nearest a piece may set text to them (docs/ui/THEME.md, "Soft ink
// on aged paper").
export function SheetSpecimen() {
  return (
    <SpecimenSection id="sheet" heading={sheet.heading}>
      <div className="texture-baize mt-4 grid gap-6 p-4 sm:grid-cols-3 sm:p-6">
        {(["plain", "aged", "lifted"] as const).map((variant) => (
          <Sheet key={variant} variant={variant} className="p-4">
            <h3 className="type-pressed font-display text-2xl">{sheet[variant]}</h3>
            <p className="mt-2">{sheet.sample}</p>
            {variant === "aged" && <p className="mt-2 text-right text-ink-soft">{sheet.softInk}</p>}
          </Sheet>
        ))}
      </div>
    </SpecimenSection>
  );
}

export function RuleSpecimen() {
  return (
    <SpecimenSection id="rule" heading={rule.heading}>
      {(["thin", "double", "flower"] as const).map((variant) => (
        <Sample key={variant} label={rule[variant]}>
          <Rule variant={variant} className="mt-3" />
        </Sample>
      ))}
      <Sample label={rule.fleuron}>
        <Fleuron className="mt-1" />
      </Sample>
    </SpecimenSection>
  );
}

export function ShopSignSpecimen() {
  return (
    <SpecimenSection id="shop-sign" heading={shopSign.heading}>
      <div className="grid sm:grid-cols-2">
        <Sample label={shopSign.open}>
          <ShopSign name={shopSign.name} className="mt-2" />
        </Sample>
        <Sample label={shopSign.closed}>
          <ShopSign name={shopSign.name} closed className="mt-2" />
        </Sample>
      </div>
    </SpecimenSection>
  );
}
