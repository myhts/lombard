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
  supports it. Node stays on 24 LTS; Node 26 waits for prebuilt binaries of the Kafka client. Node 25 and later don't
  ship Corepack, so that move also needs `npm i -g corepack` before `corepack enable` in CI.
- **Plugins:** `pipeline@kits`, held at 0.5.3 until the owner updates it at a milestone. Never update it in the
  middle of a ticket or a slice.

## Commands

Run from the repo root on Node 24 (`nvm use`), with pnpm from Corepack. CI (`.github/workflows/ci.yml`, check
`verify`) runs the same scripts as separate steps.

| Purpose | Command |
|---|---|
| Compile or typecheck (fast) | `pnpm typecheck` |
| One test file | `pnpm test src/config/config.test.ts` (any path or name filter) |
| Full verify, including container tests | `pnpm verify` (typecheck, lint, format check, boundaries, Vitest, production build; container tests join Vitest in #5) |
| Lint and format check | `pnpm lint && pnpm format:check` (`pnpm format` rewrites files) |
| Module-boundary check | `pnpm depcruise` |
| End-to-end tests | not set up yet (Playwright, #9) |
| Run locally | `docker compose up -d` (Postgres with pgvector, on OrbStack), `pnpm db:migrate`, then `pnpm dev` and http://127.0.0.1:3000. The app refuses to start until `.env` holds valid settings (`.env.example`). `docker compose down` stops the database and keeps its data |

## Migrations

- **Tool:** Drizzle (drizzle-kit). The schema is `src/db/schema.ts`; migrations live in `drizzle/`.
- **Commands:** `pnpm db:generate --name <what>` writes the next migration from the schema; `pnpm db:migrate` applies
  every pending one to `DATABASE_URL` (read from the shell, else from `.env`). Nothing runs migrations at app start.
- **Hand edits:** a generated SQL file may be edited only before it is ever applied (`0000` starts with
  `CREATE EXTENSION IF NOT EXISTS vector`); the snapshots in `drizzle/meta/` are never edited.
- **Rule:** never edit an applied migration. Change schemas expand → migrate → contract, so the previous version still
  runs against the new schema and a rollback stays safe.

## Build mode

- **Default:** build-with-me
  - **learn:** the learner writes the code; Claude teaches and reviews.
  - **build-with-me:** the implementer writes one block of at most ~60 lines; the human checks it, answers 1–2
    questions and replies OK, CHANGE, MINE or WHY.
  - **deliver:** the implementer builds the whole ticket; the automated review loop runs before the PR.
- **By kind of code** (decided 2026-11-13). The default covers AI logic; plumbing overrides it on the command line:

  | Code | Mode |
  |---|---|
  | Plumbing: config, CI, migrations, Docker, deploy, page layout, test fakes, the interface | `/implement <ticket> deliver` |
  | AI logic: the tool loop, chunking, rank fusion, eval metrics, prompts, tool descriptions, limits, the judge | `/implement <ticket>` (build-with-me) |

- **The owner writes these blocks (MINE):** recall@k, the tool loop, `offer_loan`'s limits, the system prompt and tool
  descriptions, and the approval gate's logic (who decides, what runs after approval, checked again, and only once).
- **When a ticket holds both kinds of code:**
  - A screen is interface whatever it shows. The rule the screen acts on belongs to the code behind it. The approval
    page's look is interface; the approval gate is AI logic.
  - `/to-tickets` splits such work where it can, so each ticket has one mode.
  - Where it can't, build-with-me wins: MINE exists only in that mode, so a ticket that holds a MINE block or any AI
    logic runs in build-with-me, and the implementer takes its plumbing blocks.

## Pull requests

- **Base branch:** main
- **Budget:** about 400 changed lines, not counting lockfiles, generated code or snapshots. Over budget, `/implement`
  proposes a split; CI labels any larger PR `size/large`.

## Deploy

- **First deploy (slice 9):** Fly.io, with Neon's Postgres. It's an ordinary ticket through `/to-tickets` and
  `/implement`; don't run `/deploy` for it, because `/deploy` sets up Kubernetes.
- **Target for `/deploy`:** Kubernetes, with "The world moves" (plan, decision 11). The cluster isn't chosen yet: a
  research ticket picks the host then. The lines below are for that stage.
- **Registry:** ghcr.io/myhts/lombard
- **Cluster and namespaces:** not chosen yet · `lombard-staging`, `lombard-prod`
- **Overlays:** `k8s/overlays/staging`, `k8s/overlays/prod`
- **Smoke e2e hosts:** the staging host only
