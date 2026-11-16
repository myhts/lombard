import type { ReactNode } from "react";

// One part of the specimen sheet under its heading. `pnpm ui:shots` saves a picture of each, named by its id, so every
// id is used once.
export function SpecimenSection({ id, heading, children }: { id: string; heading: string; children: ReactNode }) {
  return (
    <section data-specimen={id} className="mt-10">
      <h2 className="font-display-sc text-xl">{heading}</h2>
      {children}
    </section>
  );
}

// One entry of a section: what it shows (a token, a state, a prop), in soft ink, then the sample itself.
export function Sample({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mt-6">
      <p className="text-sm text-ink-soft">{label}</p>
      {children}
    </div>
  );
}
