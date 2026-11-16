"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { copy } from "@/ui/copy";
import { Composer } from "@/ui/period/composer";
import { Dialogue, type DialogueLine } from "@/ui/period/dialogue";
import { Rule } from "@/ui/period/rule";

const { exchange } = copy.specimen;

// Demo data, not theme timings: how fast this made-up exchange plays. The pawnbroker's words arrive one to a tick.
const TICK_MS = 60;
const PAUSE_TICKS = 10;
const TOOL_TICKS = 16;
// A wait changes its saying every five seconds (docs/ui/THEME.md, "The dialogue").
const SAYING_CHANGE_TICKS = Math.round(5_000 / TICK_MS);
// The two waits. The short one is long enough to read one saying, about three and a half seconds, and ends before the
// saying would change. The long one, about seven and a half seconds, outlasts the five, so the saying is seen to change
// once.
const SHORT_WAIT_TICKS = 58;
const LONG_WAIT_TICKS = 125;
// The turns the customer has once the script has played out.
const TURNS = 3;

// The made-up exchange, in order. A stage direction stands for a tool that runs and returns. A wait stands a saying
// where the pawnbroker's next line will appear, until his words take its place: `saying` is the one it starts with, a
// different one for each wait.
const script = [
  { speaker: "customer", words: exchange.opening },
  { tool: "appraise" },
  { saying: 0, ticks: SHORT_WAIT_TICKS },
  { speaker: "pawnbroker", words: exchange.question },
  { speaker: "customer", words: exchange.answer },
  { tool: "search_records" },
  { tool: "check_notices" },
  { saying: 7, ticks: LONG_WAIT_TICKS },
  { speaker: "pawnbroker", words: exchange.verdict },
] as const;

// The exchange as it stands after `tick` ticks, and whether more of it is still to come. With `oneSayingStays`, a wait
// keeps the saying it started with until the answer arrives.
function exchangeAt(tick: number, oneSayingStays: boolean): { lines: DialogueLine[]; playing: boolean } {
  const lines: DialogueLine[] = [];
  let start = 0;
  for (const step of script) {
    if (tick < start) break;
    const elapsed = tick - start;
    if ("tool" in step) {
      lines.push({ tool: step.tool, running: elapsed < TOOL_TICKS });
      start += TOOL_TICKS;
    } else if ("saying" in step) {
      // `Dialogue` starts its list again past the last saying, so the wait simply counts up.
      const changes = oneSayingStays ? 0 : Math.floor(elapsed / SAYING_CHANGE_TICKS);
      if (elapsed < step.ticks) lines.push({ saying: step.saying + changes });
      start += step.ticks;
    } else if (step.speaker === "pawnbroker") {
      const words = step.words.split(" ");
      const arrived = words.slice(0, elapsed + 1);
      lines.push({ speaker: step.speaker, words: arrived.join(" "), streaming: arrived.length < words.length });
      start += words.length + PAUSE_TICKS;
    } else {
      lines.push(step);
      start += PAUSE_TICKS;
    }
  }
  return { lines, playing: tick < start };
}

// Whether the reader asks for reduced motion. The statically rendered page can't know, so it answers no. That is safe
// for hydration: the exchange opens on the customer's first line, and a saying stands only after the timer has run.
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function onReducedMotionChange(changed: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", changed);
  return () => query.removeEventListener("change", changed);
}

function useReducedMotion() {
  return useSyncExternalStore(
    onReducedMotionChange,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
}

// Plays the made-up exchange from a timer, then hands the composer to the reader: each line sent is set as a customer
// line and takes a turn, and the visit is over when the turns run out. Nothing here leaves the page. For a reader who
// asks for reduced motion, one saying stays through each wait (settled in #19).
export function ExchangePlayer() {
  const [tick, setTick] = useState(0);
  const [said, setSaid] = useState<string[]>([]);
  const oneSayingStays = useReducedMotion();
  const { lines, playing } = exchangeAt(tick, oneSayingStays);
  const turnsLeft = TURNS - said.length;

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => setTick((now) => now + 1), TICK_MS);
    return () => clearInterval(timer);
  }, [playing]);

  return (
    <>
      <Dialogue lines={[...lines, ...said.map((words): DialogueLine => ({ speaker: "customer", words }))]} />
      <Rule className="my-4 text-paper-edge" />
      <Composer
        state={playing ? "disabled" : turnsLeft === 0 ? "over" : "idle"}
        turnsLeft={turnsLeft}
        onSay={(line) => setSaid([...said, line])}
      />
    </>
  );
}
