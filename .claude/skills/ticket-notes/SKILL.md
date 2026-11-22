---
name: ticket-notes
description: Writes the owner's study notes for a finished ticket (what was built, why, how the pieces connect, how to test and debug them, where it leads). Use after /implement opens a ticket's PR, or when the owner asks for notes on a ticket, including a merged one.
argument-hint: <ticket number>
---

# Ticket notes

Write one Markdown file that lets the owner understand a ticket's work without reading the diff. The reader is a Java
developer learning TypeScript and AI engineering, who reviewed some of the code block by block and skipped the rest.
Every claim comes from the sources below. Never write anything from memory.

## Where the file goes

Write to `<main checkout>/docs/learning/tickets/<NNNN>-<slug>.md`:
- `<NNNN>` is the ticket number, zero-padded to four digits.
- `<slug>` is the branch name minus its `ticket/<n>-` prefix.
- The main checkout is the first path in `git worktree list`.
- `docs/learning/` is git-ignored, so a file written inside a linked worktree is lost when that worktree is removed.
- The notes never go in a commit.

## Steps

1. **Gather.** Read each source fully. The step is done when you can name every file the PR changed and the decision
   behind each one.
   - **The ticket and its comments:** `gh issue view <n> --comments`. The owner's comments hold the settled decisions,
     and they override the ticket text.
   - **The PR:** find it with `gh pr list --state all --search "<n> in:body"`. Read its body, its comments and
     `gh pr diff <PR>`. A PR comment starting `Built in:` lists the review findings and the judgement calls.
   - **The code itself,** as it now stands on the PR's branch, or on `main` once merged. Read every changed source and
     test file in full, not just the hunks.
   - **ADRs and glossary:** every ADR the diff or the ticket names, and the GLOSSARY.md terms the diff adds.
   - **Lessons:** `docs/learning/LESSONS.md`, for the lessons tagged with this ticket.
   - **The plan:** the row in §12 of `docs/plans/0011-lombard-ai-pawnbroker.md`, and any open issue that names the
     ticket. Those tell you where the work leads.
2. **Write** the file from [TEMPLATE.md](TEMPLATE.md): all nine sections, in order, with the headings as given. Use the
   project's words from GLOSSARY.md. Link code as relative Markdown links from the notes file
   (`../../../src/...`), with a line anchor where a line matters.
3. **Check.** Each item must hold before you report:
   - Every file in the PR's diff appears in section 3, the lockfile excepted.
   - Every command in section 5 has been run once in a checkout of the branch (or of `main`) and does what the notes
     say. Paste the real test count.
   - Every error message or symptom in section 6 matches a string or behaviour you found in the code or a test run.
   - Every number in the notes, whether a cost, a count or a latency, matches a test or the code.
   - Every relative link resolves to a file that exists.
4. **Report.** Give the file's path, one line per section saying what it covers, and anything you couldn't verify,
   with the reason.
