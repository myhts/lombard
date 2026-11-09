// Module-boundary rules, checked by `pnpm depcruise`. Hand-written and kept small on purpose: each rule here is a
// decision from ticket #4, so add a rule only with a decision behind it.

/** @type {import("dependency-cruiser").IConfiguration} */
const config = {
  forbidden: [
    {
      name: "engine-imports-no-domain",
      severity: "error",
      comment:
        "The engine is the domain-free module: it may import only itself, Node built-ins and npm packages. It's an " +
        "allowlist, so it also catches domain modules that don't exist yet, whatever they're called.",
      from: { path: "^src/engine/" },
      // `to` conditions AND together: forbid anything outside src/engine/ that isn't an npm package or a built-in.
      // Matching every path, not just src/, also catches imports that climb out to test/ or the repo root.
      // Only packages declared in package.json count: npm-no-pkg (in node_modules but undeclared) is left out.
      to: {
        pathNot: "^src/engine/",
        dependencyTypesNot: ["npm", "npm-dev", "npm-optional", "npm-peer", "npm-bundled", "core"],
      },
    },
    {
      name: "engine-imports-resolve",
      severity: "error",
      comment:
        "An engine import that doesn't resolve could be anything, so the allowlist above can't vouch for it. This " +
        "names the cause; the allowlist flags it too.",
      from: { path: "^src/engine/" },
      to: { couldNotResolve: true },
    },
    {
      name: "app-imports-no-test-code",
      severity: "error",
      comment:
        "Test code (shared helpers in test/ and *.test.ts files) must never ship in the app. Tests themselves may " +
        "import helpers, so only non-test files under src/ are checked.",
      from: { path: "^src/", pathNot: "\\.test\\.tsx?$" },
      to: { path: ["^test/", "\\.test\\.tsx?$"] },
    },
  ],
  options: {
    // Resolve the `@/*` alias the same way TypeScript does.
    tsConfig: { fileName: "tsconfig.json" },
    // Count type-only imports too: `import type` from the domain into the engine still couples them.
    tsPreCompilationDeps: true,
    // Record npm packages as dependencies, but don't cruise inside them.
    doNotFollow: { path: "node_modules" },
    // The owner's private notes and Next's build output are not product code.
    exclude: { path: "^(learn|\\.next)/" },
  },
};

export default config;
