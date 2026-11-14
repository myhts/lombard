import { fileURLToPath } from "node:url";
import { configDefaults, defineConfig } from "vitest/config";

const containerTests = ["src/**/*.container.test.{ts,tsx}", "test/**/*.container.test.{ts,tsx}"];

export default defineConfig({
  resolve: {
    tsconfigPaths: true, // the `@/*` alias from tsconfig.json
    alias: { "server-only": fileURLToPath(new URL("./test/server-only.ts", import.meta.url)) },
  },
  test: {
    environment: "node",
    exclude: [...configDefaults.exclude, "learn/**"],
    // Two projects so the Postgres container starts only when a run includes a container test: Vitest runs a
    // project's globalSetup only for projects with files in the run.
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: ["src/**/*.test.{ts,tsx}", "test/**/*.test.{ts,tsx}"],
          exclude: [...configDefaults.exclude, "learn/**", ...containerTests],
        },
      },
      {
        extends: true,
        test: {
          name: "container",
          include: containerTests,
          globalSetup: ["test/postgres-container.ts"],
          hookTimeout: 60_000, // creating and migrating a database
        },
      },
    ],
  },
});
