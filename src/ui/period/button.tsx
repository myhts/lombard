import type { ComponentProps } from "react";
import { focusRing, quickColours } from "./control-states";

// A native button dressed in ink and paper. Every native attribute passes through; it holds no state and no handler of
// its own. Its accessible name is its text, unless the caller gives another.
export function Button({ type = "button", className = "", ...button }: ComponentProps<"button">) {
  return (
    <button
      type={type}
      className={`rounded-paper border border-ink bg-paper px-4 py-2 text-ink enabled:cursor-pointer enabled:hovered:bg-ink enabled:hovered:text-paper disabled:cursor-not-allowed disabled:border-paper-edge disabled:text-ink-soft ${focusRing} ${quickColours} ${className}`}
      {...button}
    />
  );
}
