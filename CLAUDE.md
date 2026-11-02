# Lombard

An AI pawnbroker game set in 1750s London, written in TypeScript. The design is in
`docs/plans/0011-lombard-ai-pawnbroker.md`; read the section you need, not the whole file.

## Rules for this repo

- **Secrets:** never read `.env` or print a key. The Claude and Voyage keys live only in `.env` (git-ignored) and CI
  secrets.
- **Data:** never commit Old Bailey data or anything derived from it (CC BY-NC 4.0). `data/` is git-ignored; the repo
  holds code and the download script only.
- **Money:** whole pence, as integers, never floats.
- **Models:** every model call uses Claude Haiku 5.5 (`claude-haiku-5-5`) unless an ADR says otherwise.
- **API calls in tests:** tests use the HTTP model fake and never call the real APIs. Evals that call the real APIs run
  only when the owner asks.
- **`learn/`:** this folder holds the owner's private study notes and exercises (git-ignored), and isn't part of the
  product.
  - Don't edit it unless asked.
  - When explaining a concept, you may point to the matching note there.

## Agent skills

### Issue tracker

GitHub Issues for this repo, through the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

`ready-for-agent` marks tickets from `/to-tickets`; `wayfinder:map` and `wayfinder:<type>` mark planning maps and their
decision tickets.

### Domain docs

Single context: `GLOSSARY.md` and `docs/adr/` at the root. See `docs/agents/domain.md`.

## Pipeline

Stack, commands and build mode: `docs/agents/stack.md`. Choose the path by size:

- **Tiny change** (one idea, easy to redo): make it, then open a PR.
- **Anything bigger:** `/grill-with-docs` first; for an event-driven domain it also loads `event-storming`.
- **Bigger than one session, or foggy:** `/wayfinder`, then `/to-spec` and `/to-tickets`.
- **Each ticket:** `/implement <ticket>`. **Each PR:** `/human-review <PR>`, then the human merges.
- **Between phases:** continue if the next phase needs this one's reasoning; otherwise clear, hand off, use a subagent
  or compact, in that order.
