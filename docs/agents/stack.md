# Stack card

Every pipeline stage and agent reads this file for the project's commands, pack and build mode. `/setup-project`
wrote it; edit it by hand whenever the project changes.

## Pack

- **Pack:** none. The stack is TypeScript: Next.js, Postgres 18 with pgvector, Drizzle, Vitest and pnpm (see the
  plan, section 11). With `none`, every stage and agent works the same; what's missing is stack knowledge. The
  standards review uses `CODING_STANDARDS.md` and the smell baseline, and `/deploy` writes its files from the shape
  in its "No pack" list.
- **Next.js docs:** Next 16 postdates most training data. Before writing Next.js code, read the guide for the installed
  version in `node_modules/next/dist/docs/`.
- **Release age:** `pnpm-workspace.yaml` sets `minimumReleaseAge: 20160` (14 days), so pnpm refuses any younger
  release, transitive ones included. It holds settings only; there's no `packages:` field and this isn't a workspace.
- **Versions held back:** TypeScript is pinned at 6.0.3; TS 7 (plan, section 11) waits until typescript-eslint
  supports it. Node stays on 24 LTS; Node 26 waits for prebuilt binaries of the Kafka client.
- **Plugins:** `pipeline@kits`

## Commands

Run from the repo root on Node 24 (`nvm use`), with pnpm from Corepack. CI (`.github/workflows/ci.yml`, check
`verify`) runs the same scripts as separate steps.

| Purpose | Command |
|---|---|
| Compile or typecheck (fast) | `pnpm typecheck` |
| One test file | `pnpm test src/config/config.test.ts` (any path or name filter) |
| Full verify, including container tests | `pnpm verify` (typecheck, lint, format check, boundaries, Vitest; container tests join Vitest in #5) |
| Lint and format check | `pnpm lint && pnpm format:check` (`pnpm format` rewrites files) |
| Module-boundary check | `pnpm depcruise` |
| End-to-end tests | not set up yet (Playwright, #9) |
| Run locally | `pnpm dev`, then http://localhost:3000. It refuses to start until `.env` holds valid settings (`.env.example`) |

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
