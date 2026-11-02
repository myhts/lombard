# Stack card

Every pipeline stage and agent reads this file for the project's commands, pack and build mode. `/setup-project`
wrote it; edit it by hand whenever the project changes.

## Pack

- **Pack:** none. The stack is TypeScript: Next.js, Postgres 18 with pgvector, Drizzle, Vitest and pnpm (see the
  plan, section 11). With `none`, every stage and agent works the same; what's missing is stack knowledge. The
  standards review uses `CODING_STANDARDS.md` and the smell baseline, and `/deploy` writes its files from the shape
  in its "No pack" list.
- **Plugins:** `pipeline@kits`

## Commands

None exist yet: the walking skeleton (S0) adds `package.json`, its scripts and `ci.yml`. Fill this table in that
ticket, running each command once.

| Purpose | Command |
|---|---|
| Compile or typecheck (fast) | not set up yet |
| One test file | not set up yet |
| Full verify, including container tests | not set up yet |
| Lint and format check | not set up yet |
| Module-boundary check | not set up yet (dependency-cruiser, planned) |
| End-to-end tests | not set up yet (Playwright, planned) |
| Run locally | not set up yet |

## Migrations

- **Tool:** Drizzle (drizzle-kit), planned; none yet.
- **Rule:** never edit an applied migration. Change schemas expand → migrate → contract, so the previous version still
  runs against the new schema and a rollback stays safe.

## Build mode

- **Default:** build-with-me
  - **learn:** the learner writes the code; Claude teaches and reviews.
  - **build-with-me:** the implementer writes one block of at most ~60 lines; the human checks it, answers 1–2
    questions and replies OK, CHANGE, MINE or WHY.
  - **deliver:** the implementer builds the whole ticket; the automated review loop runs before the PR.
- A ticket can override it: `/implement <ticket> deliver`.

## Pull requests

- **Base branch:** main
- **Budget:** about 400 changed lines, not counting lockfiles, generated code or snapshots. Over budget, `/implement`
  proposes a split; CI labels any larger PR `size/large`.

## Deploy

- **Target:** not chosen yet: run /deploy (a research ticket picks the host; plan, decision 11)
- **Registry:** ghcr.io/myhts/lombard
- **Cluster and namespaces:** not chosen yet · `lombard-staging`, `lombard-prod`
- **Overlays:** `k8s/overlays/staging`, `k8s/overlays/prod`
- **Smoke e2e hosts:** the staging host only
