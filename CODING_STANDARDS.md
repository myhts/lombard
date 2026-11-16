# Coding standards

The `code-reviewer` agent reads this file on its standards axis. The implementer doesn't: it makes the code work, and
review makes it good.

Keep only **judgement calls** here. A rule a tool can check (a banned import, a file location, a formatting choice)
belongs in a linter rule, a hook or a CI job, where it costs nothing to enforce. `/retro` sorts new rules into the
right place.

The project has no stack pack, so there is no pack review checklist. The reviewer applies this file and `GLOSSARY.md`:
a word the glossary lists under _Avoid_, in code, UI text or tests, is a violation.

## Names come from the glossary

Types, functions, tests, UI labels and log messages use the glossary's terms. When no term fits, that is a gap to settle
with `/grill-with-docs`, not a name to invent in the code.

## Comments say why

Code shows what it does. A comment earns its place by explaining a reason the code can't show. When that reason is a
decision someone might reverse, it belongs in an ADR, and the comment points at it.

## Tests go through the front door

Tests exercise the module through its public interface, at the seams agreed for the ticket, and set up their data
through the same interface. When a test needs a setup function that doesn't exist, add it to the module rather than
writing rows or fields directly.

## A fix leaves existing tests alone

An existing test's expected value changes only when the ticket changes that behaviour, and the PR names the line of
the ticket that asks for it. A test deleted, skipped or loosened so that a run goes green is a must-fix: the code
changes, or the failing test goes to the owner as a finding.

## Failures are visible

Nothing is swallowed. An error at a boundary becomes a clear, typed response for the caller, and the original cause is
kept.

## TypeScript

- **Types are trusted only inside.** Anything that crosses a boundary (a form, a route, a tool input, model output, an
  event, a row from the archive) is parsed with zod first; the type comes from the schema, not from a cast. `as`,
  `any` and non-null `!` need a reason in a comment.
- **Money is whole pence.** The game's amounts are integers in pence from input to storage. Code works out pounds,
  shillings and pence in one place for each direction: `Money`, in the `ui` module, is the one place that displays
  them, and a single parser, added by the first slice that needs one, is the one place that parses them. The parser's
  tests check its results against `Money`'s output, so the two can't drift. LLM spend is integer nano-dollars instead
  (ADR 0001).
- **Model calls go through `engine/`.** Code outside it never builds a Claude or Voyage client: the wrapper logs the
  cost, and tests swap it for the HTTP model fake.
- **The model fake copies the real API.** Every response the fake serves is typed with the SDK's own response type,
  with no cast, and its shape starts from a real response or the installed SDK's type declarations, never from
  memory. The fake and the client are written together, so a field invented in one passes in the other.
- **Limits live in code, not prompts.** A rule the pawnbroker must obey (a loan limit, what a customer may see) is
  checked in the tool or the database, and a test proves it holds whatever the model says.
- **Server and client stay apart.** Secrets, the database and model clients are imported only from server code in
  the Next.js app.
