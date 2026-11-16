import { copy } from "@/ui/copy";
import { Button } from "@/ui/period/button";
import { Field } from "@/ui/period/field";
import { Switch } from "@/ui/period/switch";
import { Sample, SpecimenSection } from "./specimen-section";

const { controls } = copy.specimen;

// Each state a control has, and the attributes that put a control in it. A picture can't hover or focus, so those two
// are forced: the theme's `hovered:` and `focused:` variants match `data-forced-state` as well as the real state.
// Each grid below has `p-1`, so a focus ring at its edge is inside the section's picture.
const states = [
  { label: controls.states.default, attributes: {} },
  { label: controls.states.hover, attributes: { "data-forced-state": "hover" } },
  { label: controls.states.focus, attributes: { "data-forced-state": "focus" } },
  { label: controls.states.disabled, attributes: { disabled: true } },
];

export function ButtonSpecimen() {
  return (
    <SpecimenSection id="button" heading={controls.button.heading}>
      <div className="grid grid-cols-2 p-1 sm:grid-cols-4">
        {states.map(({ label, attributes }) => (
          <Sample key={label} label={label}>
            <Button className="mt-2" {...attributes}>
              {controls.button.text}
            </Button>
          </Sample>
        ))}
      </div>
    </SpecimenSection>
  );
}

export function FieldSpecimen() {
  return (
    <SpecimenSection id="field" heading={controls.field.heading}>
      <div className="grid gap-x-6 p-1 sm:grid-cols-2 lg:grid-cols-4">
        {states.map(({ label, attributes }) => (
          <Sample key={label} label={label}>
            <Field label={controls.field.label} defaultValue={controls.field.value} className="mt-2" {...attributes} />
          </Sample>
        ))}
      </div>
    </SpecimenSection>
  );
}

export function SwitchSpecimen() {
  return (
    <SpecimenSection id="switch" heading={controls.switch.heading}>
      <div className="grid gap-x-6 p-1 sm:grid-cols-2">
        {states.map(({ label, attributes }) => (
          <Sample key={label} label={label}>
            <div className="mt-2">
              <Switch label={controls.switch.off} {...attributes} />
            </div>
            <div className="mt-2">
              <Switch label={controls.switch.on} defaultChecked {...attributes} />
            </div>
          </Sample>
        ))}
      </div>
    </SpecimenSection>
  );
}
