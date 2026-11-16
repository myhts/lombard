"use client";

import { useRef, type KeyboardEvent, type SyntheticEvent } from "react";
import { copy } from "../copy";
import { Button } from "./button";
import { textBox } from "./control-states";

// idle: the customer may speak. sending: a line is on its way. disabled: not the customer's turn. over: the visit has
// ended, and nothing more can be said.
export type ComposerState = "idle" | "sending" | "disabled" | "over";

// The space where the customer speaks: a text box, the "Say it" button and the turns left. Enter sends, and Shift+Enter
// starts a new line. A blank line isn't sent. After sending, the box is cleared and keeps the focus, and it can be
// written in while the last line is still sending. `onSay` is optional, so a server component can show a composer in
// any state without a handler.
export function Composer({
  state,
  turnsLeft,
  onSay,
  className = "",
}: {
  state: ComposerState;
  turnsLeft: number;
  onSay?: (line: string) => void;
  className?: string;
}) {
  const box = useRef<HTMLTextAreaElement>(null);
  const closed = state === "disabled" || state === "over";

  function say(event: SyntheticEvent) {
    event.preventDefault();
    const line = box.current?.value.trim();
    if (state !== "idle" || !box.current || !line) return;
    onSay?.(line);
    box.current.value = "";
    // A click on the button took the focus from the box.
    box.current.focus();
  }

  function sendOnEnter(event: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter while an input method is composing a character chooses that character, and isn't the end of the line.
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  }

  return (
    <form onSubmit={say} className={`text-ink ${className}`}>
      <label className="flex flex-col gap-1 has-disabled:text-ink-soft">
        <span>{copy.composer.label}</span>
        <textarea ref={box} rows={2} disabled={closed} onKeyDown={sendOnEnter} className={`resize-none ${textBox}`} />
      </label>
      <div className="mt-2 flex items-center gap-3">
        <Button type="submit" disabled={state !== "idle"}>
          {copy.composer.say}
        </Button>
        {/* Always here, so a screen reader hears "Sending" when it appears. The dot is the theme's waiting pulse. */}
        <span role="status">
          {state === "sending" && (
            <>
              <span aria-hidden="true" className="waiting-pulse" />
              <span className="sr-only">{copy.composer.sending}</span>
            </>
          )}
        </span>
        <p className="ml-auto text-ink-soft">
          {state === "over" ? copy.composer.visitOver : copy.composer.turnsLeft(turnsLeft)}
        </p>
      </div>
    </form>
  );
}
