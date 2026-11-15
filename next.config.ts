import type { NextConfig } from "next";

// Set only by `pnpm ui:dev`, the interface's own dev server on port 3001.
const uiDistDir = process.env.UI_DIST_DIR;

const nextConfig: NextConfig = {
  // Stop `next dev` writing AGENTS.md: CLAUDE.md is this repo's one agent-instruction file.
  agentRules: false,
  // `next dev` allows one server per build folder: it holds a lock in <distDir>/dev/lock. The interface's server gets
  // its own folder, so it can run beside `pnpm dev`.
  distDir: uiDistDir ?? ".next",
  // Next's round dev badge would sit on top of the page in the pictures `pnpm ui:shots` saves. Errors still show.
  devIndicators: uiDistDir ? false : undefined,
};

export default nextConfig;
