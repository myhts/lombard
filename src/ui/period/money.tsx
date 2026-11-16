// Money, written the period way from whole pence (docs/ui/THEME.md, "Money"). This file is the one place that displays
// pounds, shillings and pence (CODING_STANDARDS.md, "Money is whole pence").

const PENCE_IN_A_SHILLING = 12;
const PENCE_IN_A_POUND = 240;

export type MoneyForm = "inline" | "ledger";

// Inline: `0d`, `1s`, `19s 11d`, `£1`, `£1 0s 6d`. Zero parts are dropped from either end and kept in the middle.
// Ledger: always all three parts, each with its unit: `£0 0s 6d`. Neither has a thousands separator.
// Exported for the parser to come, whose tests compare its results with this output.
export function formatMoney(pence: number, form: MoneyForm = "inline"): string {
  // An amount that isn't whole pence is a fault upstream, and rounding it here would hide it. Past the safe integers a
  // number no longer holds every penny, so those are refused too.
  if (!Number.isSafeInteger(pence) || pence < 0) {
    throw new Error(`Money takes whole pence, zero or more, but got ${String(pence)}`);
  }

  const amounts = [
    Math.floor(pence / PENCE_IN_A_POUND),
    Math.floor((pence % PENCE_IN_A_POUND) / PENCE_IN_A_SHILLING),
    pence % PENCE_IN_A_SHILLING,
  ];
  const [pounds, shillings, oddPence] = amounts;
  const parts = [`£${pounds}`, `${shillings}s`, `${oddPence}d`];
  if (form === "ledger") return parts.join(" ");

  const first = amounts.findIndex((amount) => amount > 0);
  if (first === -1) return "0d";
  return parts.slice(first, amounts.findLastIndex((amount) => amount > 0) + 1).join(" ");
}

// The accessible name is the visible text; there is no spoken form (#18, "Settled before building"). The amount never
// wraps.
export function Money({ pence, form = "inline" }: { pence: number; form?: MoneyForm }) {
  if (form === "inline") return <span className="whitespace-nowrap">{formatMoney(pence)}</span>;

  // One column to each part, right-aligned, so the pounds, shillings and pence of a ledger's rows line up when the rows
  // share a right edge. The spaces between the columns keep the text one amount: "£1 4s 6d".
  const [pounds, shillings, oddPence] = formatMoney(pence, "ledger").split(" ");
  return (
    <span className="whitespace-nowrap tabular-nums">
      <span>{pounds}</span> <span className="money-column">{shillings}</span>{" "}
      <span className="money-column">{oddPence}</span>
    </span>
  );
}
