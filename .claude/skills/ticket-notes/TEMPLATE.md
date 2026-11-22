# Ticket notes template

Use these headings, in this order. Under each one is what belongs there; replace it with the content. Prefer tables,
trees and diagrams to prose, and keep each section as short as its job allows.

```markdown
# #<n>: <ticket title, without its slice prefix>

**PR:** #<pr> · **Branch:** `<branch>` · **Built:** <first to last commit date> · **Slice:** <slice from §12>

## 1. In one paragraph
```
What now exists that didn't before, in five sentences at most. Say who calls it, and what still doesn't.

```markdown
## 2. Why it exists
```
The problem it solves, and the rules it enforces (ADRs, CLAUDE.md, CODING_STANDARDS.md), one bullet each. Say what
would go wrong without it.

```markdown
## 3. The pieces
```
A file tree of every changed file, each with its one job, followed by a table with the columns Piece, Its one job and
Java equivalent. The Java column maps each piece to the nearest Java idea (interface, record, factory, decorator,
`java.time.Clock`...).

```markdown
## 4. How they connect
```
A Mermaid sequence or flow diagram of one real call through the pieces, including the failure branch. Add the core
rule as pseudocode, and a table saying where each output field comes from, if the ticket has one.

```markdown
## 5. How to test it
```
- The commands, as a code block: run one file, run one test by name, and the checks CI runs.
- A table with the columns Test and It proves, one row per test or `it.each` table.
- A copyable sketch of how a test is built in this ticket's style: setup, script, act, assert.
- One line on how to show a test can fail: the mutation that turns it red.

```markdown
## 6. How to debug it
```
A table with the columns You see, Likely cause and Look at, using real error strings. After it, a few bullets on
looking inside a run: logging, running a single test, the fake's counters, the database.

```markdown
## 7. Decisions and trade-offs
```
A table with the columns Decision, Why and What it costs, drawn from the settled decisions, the review's judgement calls
and the ADRs.

```markdown
## 8. Where it leads
```
The next tickets and slices that build on this work, and the `later` issues it left open, one bullet each, naming
what they'll use from it.

```markdown
## 9. Questions to check yourself
```
Six to eight questions on the ideas that matter. Each answer is in LESSONS.md or in sections 1–8; say where.
