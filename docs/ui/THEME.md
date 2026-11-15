# The interface brief

This is the brief for Lombard's interface: the rules for every interface ticket, the design reference and the `Money`
rules. Ticket #16 moved them here from spec #12. The brief is now the source for how the interface looks, moves and
reads, and every later interface ticket points to it.

The **period layer** is the game world: printed paper and ink on a dark oak counter, by candlelight. The
**instrument layer** is plain, modern and dark, in a monospace face; its panel, Behind the counter, shows what the AI
saw and did ([ADR 0003](../adr/0003-interface-two-layers-css-only.md)).

## Rules for every interface ticket

1. **CSS only for effects.** No canvas, no WebGL and no animation library. Textures come from CSS gradients and inline
   SVG filters, not image files. The interface is silent in every ticket of spec #12; sound is parked, not ruled out
   (#15).
2. **Three new dependencies, no more,** all dev dependencies: `tailwindcss` and `@tailwindcss/postcss` (Tailwind 4, plan
   §11), and Playwright, used only by the screenshot command until slice 9 adds its smoke test. All three pinned, and at
   least 14 days old as `minimumReleaseAge` requires.
3. **All colours, sizes and timings are tokens** in one stylesheet. A component never holds a raw hex value or a raw
   duration.
4. **The `ui` module is domain-free,** like `engine`. It imports only itself, declared npm packages (React among them)
   and Node built-ins, as the boundary rule `ui-imports-no-domain` allows. It takes plain props (strings, pence as
   integers, dates) and never fetches.
5. **Server components by default.** Only four things are client components: the dialogue composer and stream, the
   plain-mode switch, the Behind-the-counter switch, and the candle (`CODING_STANDARDS.md`, "Server and client stay
   apart").
6. **Every UI string lives in one copy file.** Components take text as props or read it from there. Labels use the
   glossary's words.
7. **Money is displayed by one component, `Money`,** from whole pence. Nothing else formats money.
8. **Readable first.** Body text is at least 17px, contrast is at least 4.5 to 1 for anything a player must read, and
   every effect stops under `prefers-reduced-motion` and in plain mode.
9. **Phone first.** Every screen works at 360px wide in one column before it gets a wide layout.
10. **Read the installed versions' docs before writing:** the Next.js 16 guide shipped inside the installed package, and
    Tailwind 4's own docs for `@theme`. Both postdate most training data.
11. **Look at your own work.** Before opening a PR, the implementer opens each changed screen in a browser at 360px and
    1280px, fixes what looks wrong, and runs the screenshot command so the pictures and the browser checks are there for
    the owner.

## Design reference

**The period is the 1750s:** Georgian London under George II, matching the dates of the trials and prices. Not the
1600s: no blackletter type, no Stuart dress.

**Why documents, not scenery:** the game is about records, so the interface is made of records. Paper, type and ruled
lines are also cheap to build well in CSS, need almost no images and stay readable on a phone.

**Colour tokens** (starting values; a unit test checks each pair in the last column):

| Token | Value | Used for | Text pair to test |
|---|---|---|---|
| `--color-paper` | `#f1e7d0` | The sheet, clippings, pawn tickets | — |
| `--color-paper-aged` | `#e6d8b8` | Older documents, the evidence tray | — |
| `--color-paper-edge` | `#cdbb94` | Deckle edges, fold lines, ruled lines | — |
| `--color-ink` | `#1f1a14` | Body text, type | on paper, on paper-aged |
| `--color-ink-soft` | `#685b48` | Secondary text, stage directions | on paper, on paper-aged |
| `--color-wax` | `#8c1c13` | The wax seal, stolen-goods marks, the constable | on paper |
| `--color-prussian` | `#1f3a5f` | Links, citation marks | on paper |
| `--color-baize` | `#2f4a3a` | The counter's cloth, an accepted pledge, approval | on paper |
| `--color-brass` | `#b8892b` | The three balls, coins, rules on dark wood. Decoration only, never text on paper | — |
| `--color-oak` | `#3b2a1c` | The counter's edge, panels | — |
| `--color-night` | `#1a1410` | The page background around the counter | — |
| `--color-candle` | `#f6c56b` | The candle's glow, text on night | on night |
| `--color-glass` | `#10151a` | The instrument layer's background | — |
| `--color-readout` | `#d7e0e6` | The instrument layer's text | on glass |
| `--color-signal` | `#7fd1c4` | The instrument layer's highlights | on glass |

**Type tokens:**

| Token | Face | Why this face | Used for |
|---|---|---|---|
| `--font-text` | Libre Caslon Text | William Caslon's types were the standard English book face of the 1750s | All running text, the dialogue, clippings |
| `--font-display` | IM Fell English, with IM Fell English SC for small capitals | A digitised set of old English printing types with the rough edges of hand-set print | Mastheads, document headings, the shop sign |
| `--font-hand` | Pinyon Script | An English round hand, the business handwriting of the century | The pawn ticket's number, signatures. Never more than a few words |
| `--font-instrument` | The system monospace stack | Free, instant and plainly modern | The whole instrument layer |

Each family loads at build time with only the Latin subset and the weights used. If one isn't available that way, the
implementer picks the nearest from the same tradition and records it in the brief.

**Other tokens:** a type scale of six sizes from 14px to 40px; spacing in steps of 4px; `--radius-paper: 1px` (paper has
square corners); three shadows (a sheet lying on wood, a sheet lifted, a seal's emboss); durations `--quick: 150ms`,
`--settle: 300ms`, `--stamp: 250ms`, `--slow: 600ms`, `--beat: 80ms` (the gap between things that land one after
another, such as the coins).

**Texture and light:**

| Effect | How | Where | Off when |
|---|---|---|---|
| Laid paper | An inline SVG `feTurbulence` noise at low opacity over the paper colour, plus faint horizontal lines from a repeating gradient | Every paper surface | Never; it's static |
| Aged edges | An inset shadow in paper-edge, slightly uneven | Clippings, handbills, pawn tickets | Never |
| Pressed type | A very light text shadow so the ink looks pressed into the paper | Display type only, never body text | Never |
| Oak and baize | Layered gradients for grain and cloth | The page background and the counter | Never |
| Candlelight | One fixed overlay: a warm radial gradient whose opacity and position drift on a slow, irregular keyframe loop, with a dark vignette at the edges | The period layer's page | Reduced motion, plain mode, and whenever the instrument panel is open over it |
| Ink caret | A small nib-shaped mark at the end of the text while it streams | The pawnbroker's current line | When the stream ends |
| Waiting pulse | One shared keyframe loop that fades a small ink mark to faint and back, `--slow` each way; the words beside it never fade | Beside the current stage direction while its tool runs; beside the composer's button while it is sending | Reduced motion and plain mode |

Only the candle and one waiting pulse ever loop. Everything else plays once. The waiting pulse is one shared animation:
it shows on the current stage direction while its tool runs, and on the composer while it is sending.

**Plain mode,** labelled "Snuff the candle": one switch that removes the candle, the vignette and every animation, and
sets the page to flat paper on a flat dark background. It is remembered in the browser. It is the accessibility fallback
and the fix when a phone struggles.

**Period pieces.** Each has an entry on the specimen sheet in every state listed, and one render test.

| Piece | What it is in 1753 | Shows | States |
|---|---|---|---|
| `Sheet` | A sheet of paper lying on the counter | Any content; the base for most others | plain, aged, lifted |
| `Rule`, `Fleuron` | A printer's rule and a printer's flower, as hand-coded SVG | Dividers and ornaments | thin, double, with flower |
| `ShopSign` | The pawnbroker's three golden balls on a bracket | The shop's name | open, closed |
| `Dialogue` | A printed dialogue, set like the question-and-answer text of the Proceedings: the speaker's name in small capitals, then the words | The conversation. No chat bubbles | pawnbroker line, customer line, streaming, stage direction |
| `StageDirection` | An italic aside | What the pawnbroker is doing while a tool runs | one per tool |
| `Composer` | The space where the customer speaks | A text box, a "Say it" button, the turns left | idle, sending, disabled, visit over |
| `ItemCard` | A slip describing the goods laid on the counter | The item's description | — |
| `CharacterCard` | A folded note handed to the player | The truth card: who you are, what you carry, what you need | folded, open |
| `TrialClipping` | A cutting from the printed Old Bailey Proceedings | The trial's name and date, the quoted passage, the value recorded, a link to Old Bailey Online | resting, highlighted, "value just under a threshold" flag |
| `CitationMark` | A superscript reference mark in the dialogue | The number that ties a claim to its clipping; highlights both ways on hover, focus or tap | — |
| `Handbill` | A printed notice of stolen goods, with a pointing hand (☞) | The notice's text, date and place | posted, matched (marked in wax red) |
| `Money` | An amount written the period way | `£1 4s 6d` from pence | inline, in a ledger column (pounds, shillings and pence aligned) |
| `OfferSlip` | The pawnbroker's written offer | The amount and the term | offered |
| `PawnTicket` | The ticket given for a pledge | The item, the sum lent, the date, the term, a number in the script face | printing, printed |
| `Coins` | Coins counted onto the counter | The loan paid out; at most five coins drawn, whatever the sum | — |
| `Broadside` | A large printed sheet for news | The visit's outcome and score; the constable being called; the shop closed | accepted, refused, constable, closed |
| `Button`, `Field`, `Switch` | — | Plain controls dressed in ink and paper | default, hover, focus, disabled |

**Instrument pieces:**

| Piece | Shows | States |
|---|---|---|
| `Panel` | The Behind-the-counter drawer: slides over the right side on a wide screen, up from the bottom on a phone | closed, open |
| `ToolCallRow` | One tool call: its name, its input, its result, how long it took | running, done, error |
| `SearchHitRow` | One retrieved chunk with its rank and scores | cited, not cited |
| `CostMeter` | Tokens in and out, and the visit's cost so far | — |
| `ScoreTable` | Eval runs by version, with the best value in each column marked | — |

**Effects:** `Candlelight`, `PlainModeSwitch`.

**What happens on screen when something happens in the game.** Each effect belongs to a game event. Nothing moves
without a reason.

| In the game | On the period layer | Time |
|---|---|---|
| A visit starts | The sheet slides onto the counter; the item's slip is laid beside it | 300ms |
| `search_records` is running | Stage direction: "He turns the pages of the Proceedings." | until it returns |
| `appraise` is running | "He weighs it in his hand and reckons." | until it returns |
| `check_notices` is running | "He looks over the notices by the door." | until it returns |
| The pawnbroker speaks | Text streams in with the ink caret | as it arrives |
| A claim cites a trial | Its clipping slides into the evidence tray; the mark and the clipping are linked | 300ms |
| A notice matches | The handbill drops in at a slight angle, marked in wax red | 300ms |
| A loan is offered | An offer slip is written out | 300ms |
| The pledge is taken | The pawn ticket prints from top to bottom, then the coins land one after another | 600ms, then 80ms apart |
| The visit is refused | A line is ruled across the sheet and "Declined." is set under it | 150ms |
| The constable is called | The page dims; a broadside in wax red: "The Constable is sent for." | 300ms |
| The shop is closed | The sign shows "Closed" and a broadside says when it opens | — |
| Something fails | "The pawnbroker is indisposed. Pray try again." with the real error in the instrument face beneath | — |

The stage directions come from the copy file, keyed by tool name. Behind the counter, the same moment shows the real
tool call.

**Words:**

| Rule | Example |
|---|---|
| Period flavour for headings, labels and stage directions | "The Reckoning" for the score; "Enter the shop" |
| Plain modern English for anything the player must understand to act | Buttons, errors, costs, limits, the invite-code form |
| No long s (ſ) and no period spelling in text a player must read | "Silk", not "ſilk". One decorative masthead may use it, with a modern `aria-label` |
| It's always clear that the pawnbroker is an AI | A fixed line under the shop's name: "The pawnbroker is an AI. The trials it cites are real." |
| Invented rules are labelled | "Game rule" beside anything simplified from history |
| Real people are treated with care | No jokes about victims or punishments, in copy or in art |
| The pawnbroker's own voice is not UI copy | It comes from the system prompt in slice 4. The theme never rewrites what the model said |

**Screens.** Each is a component in the `ui` module, shown now on a demo route under `/specimen`. The last column is the
real route a wiring ticket adds later.

| Screen | Made of | Real route, later |
|---|---|---|
| The specimen sheet | Every piece, in every state, with made-up data | `/specimen` (now) |
| The counter | Wide: the item and character card on the left, the dialogue sheet in the middle, the evidence tray on the right. Phone: one column, the evidence in a tab beside the dialogue | `/visit/[id]` |
| The reckoning | A broadside with the outcome, the score and "Look behind the counter" | End of a visit |
| The shopfront | The shop sign, one line of pitch, the invite-code field, the AI line, the attribution | `/` |
| The shop is closed | The sign and a broadside; links to the scoreboard and casebook still work | `/` when the shop is closed |
| The scoreboard | Mostly the instrument layer inside a period frame | `/scoreboard` |
| A replay | The counter, read-only, with Behind the counter open | `/replay/[id]` |
| The casebook | Each entry set as a broadside | `/casebook` |

**Pictures:**

- **Ornaments are drawn in code:** the three balls, rules, printer's flowers, the coins, the pointing hand. Hand-written
  SVG in the tokens' colours.
- **Engravings come from open collections, in the art pass only.** Three to five, tinted to the palette, each under
  150 KB. Candidates: William Hogarth's "Gin Lane" (1751), which shows a pawnbroker's shop under its three balls; John
  Rocque's 1746 map of London; street views of the 1750s. Files come only from collections that mark them public domain
  or CC0 (for example the Met's Open Access collection and the Yale Center for British Art), with the licence confirmed
  on each file's own page.
- **No generated images.**
- **These files may be committed.** The rule against committing data covers the Old Bailey text (CC BY-NC), not
  public-domain pictures.

## Money

- `Money` takes whole pence as an integer. 12 pence make a shilling and 20 shillings make a pound.
- Inline form: `0d`, `11d`, `1s`, `19s 11d`, `£1`, `£1 4s 6d`. Trailing zero parts are dropped; a zero between two parts
  is kept (`£1 0s 6d`).
- Ledger form: three aligned columns, always all three.
- An amount that isn't a whole number of pence, or is below zero, is an error, not a rounded display
  (`CODING_STANDARDS.md`, "Failures are visible").
