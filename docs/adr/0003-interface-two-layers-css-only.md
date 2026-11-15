# The interface has two layers and uses CSS only

One page serves two readers. A visitor should be at a pawnbroker's counter in the 1750s from the first screen. An
engineer opening the same link should see what the AI saw and did, which a themed chat alone can't show. So the
interface has two layers:

- The **period layer** is the game world: printed paper and ink on a dark oak counter, by candlelight. Everything on it
  is a document of the time: a sheet of dialogue, a clipping from the Old Bailey Proceedings, a handbill, a pawn ticket.
- The **instrument layer** is plain, modern and dark, in a monospace face. Its panel, Behind the counter, opens with one
  switch and shows the tool calls, the search results with their scores, the tokens and the visit's cost.

Nothing modern leaks into the period layer, and nothing decorative gets in the way of a number.

Visual effects are CSS only: no canvas, no WebGL and no animation library. Textures come from CSS gradients and inline
SVG filters, not image files. The game is about records, so the interface is made of records, and paper, type and ruled
lines are cheap to build well in CSS, need almost no images and stay readable on a phone.

"CSS only" says how an effect is drawn. It doesn't mean nothing but CSS: rule 1 allows inline SVG filters. And it
doesn't mean no JavaScript: the candle is one of the four client components (`docs/ui/THEME.md`, rules 1 and 5).

Sound is not decided here. The interface is silent for now. Optional period music and a spoken voice for the pawnbroker
are parked in #15, and this ADR neither adds sound nor rules it out.

## Considered options

- **One themed layer, with the AI's numbers set among the period pieces:** modern readouts would break the period, and
  ornament would get in the way of the numbers.
- **A canvas or WebGL scene:** the shop is shown as documents, not scenery, and documents need no drawing surface.
- **An animation library:** each effect plays once, on a game event, and only the candle and one waiting pulse loop. CSS
  transitions and keyframes cover that.
- **Image files for textures:** laid paper, oak and baize come from gradients and an inline SVG noise filter. The only
  image files are the few engravings of the art pass.

## Consequences

- A ticket that wants a canvas, WebGL or an animation library needs a new ADR first, not a quiet dependency.
- The brief (`docs/ui/THEME.md`) holds the rules, tokens and pieces that follow from this decision.
- Sound stays open: #15 can add it without contradicting this ADR.
