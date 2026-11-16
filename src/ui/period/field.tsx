import type { ComponentProps } from "react";
import { textBox } from "./control-states";

// A native text input under its label, dressed in ink and paper. The label wraps the input, which gives the input its
// accessible name. Every native attribute passes through to the input; `className` places the whole field.
export function Field({ label, className = "", ...input }: { label: string } & ComponentProps<"input">) {
  return (
    <label className={`flex flex-col gap-1 text-ink has-disabled:text-ink-soft ${className}`}>
      <span>{label}</span>
      <input className={textBox} {...input} />
    </label>
  );
}
