"use client";

import { useEffect, useState } from "react";
import { copy } from "@/ui/copy";
import { Composer } from "@/ui/period/composer";
import { Dialogue, type DialogueLine } from "@/ui/period/dialogue";
import { Rule } from "@/ui/period/rule";

const { exchange } = copy.specimen;

// The made-up exchange, in order. A stage direction stands for a tool that runs and returns. A saying stands where the
// pawnbroker's next line will appear, a different one before each, until his words take its place.
const script = [
  { speaker: "customer", words: exchange.opening },
  { tool: "appraise" },
  { saying: 0 },
  { speaker: "pawnbroker", words: exchange.question },
  { speaker: "customer", words: exchange.answer },
  { tool: "search_records" },
  { tool: "check_notices" },
  { saying: 7 },
  { speaker: "pawnbroker", words: exchange.verdict },
] as const;

// Demo data, not theme timings: how fast this made-up exchange plays. The pawnbroker's words arrive one to a tick.
const TICK_MS = 60;
const PAUSE_TICKS = 10;
const TOOL_TICKS = 16;
// Long enough to read one saying: about three and a half seconds. A real wait changes its saying every five seconds
// (docs/ui/THEME.md, "The dialogue"); this one ends before it would.
const SAYING_TICKS = 58;
// The turns the customer has once the script has played out.
const TURNS = 3;

// The exchange as it stands after `tick` ticks, and whether more of it is still to come.
function exchangeAt(tick: number): { lines: DialogueLine[]; playing: boolean } {
  const lines: DialogueLine[] = [];
  let start = 0;
  for (const step of script) {
    if (tick < start) break;
    const elapsed = tick - start;
    if ("tool" in step) {
      lines.push({ tool: step.tool, running: elapsed < TOOL_TICKS });
      start += TOOL_TICKS;
    } else if ("saying" in step) {
      if (elapsed < SAYING_TICKS) lines.push(step);
      start += SAYING_TICKS;
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

// Plays the made-up exchange from a timer, then hands the composer to the reader: each line sent is set as a customer
// line and takes a turn, and the visit is over when the turns run out. Nothing here leaves the page.
export function ExchangePlayer() {
  const [tick, setTick] = useState(0);
  const [said, setSaid] = useState<string[]>([]);
  const { lines, playing } = exchangeAt(tick);
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
