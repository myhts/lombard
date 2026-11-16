import type { ComponentProps } from "react";
import { focusRing, quickColours } from "./control-states";

// A native checkbox with the switch role, dressed in ink and paper: a square shutter that slides across its track. Off
// is paper, on is ink. The label wraps the input, which gives the input its accessible name. Every native attribute
// passes through to the input; `className` places the whole switch.
export function Switch({ label, className = "", ...input }: { label: string } & Omit<ComponentProps<"input">, "type">) {
  return (
    <label className={`inline-flex items-center gap-3 text-ink has-disabled:text-ink-soft ${className}`}>
      <input
        type="checkbox"
        role="switch"
        className={`relative h-6 w-11 shrink-0 appearance-none rounded-paper border border-ink bg-paper before:absolute before:top-1/2 before:left-1 before:size-4 before:-translate-y-1/2 before:bg-ink-soft checked:bg-ink checked:before:translate-x-4.5 checked:before:bg-paper enabled:cursor-pointer enabled:not-checked:hovered:bg-paper-aged enabled:not-checked:hovered:before:bg-ink enabled:checked:hovered:bg-ink-soft disabled:cursor-not-allowed disabled:border-paper-edge disabled:not-checked:before:bg-paper-edge disabled:checked:bg-paper-edge motion-safe:before:transition-transform motion-safe:before:duration-(--quick) ${focusRing} ${quickColours}`}
        {...input}
      />
      <span>{label}</span>
    </label>
  );
}
