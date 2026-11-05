import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Stop `next dev` writing AGENTS.md: CLAUDE.md is this repo's one agent-instruction file.
  agentRules: false,
};

export default nextConfig;
