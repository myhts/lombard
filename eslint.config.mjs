import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";
import tseslint from "typescript-eslint";

// Shape from Next 16's ESLint guide (node_modules/next/dist/docs/01-app/03-api-reference/05-config/03-eslint.md).
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  // Type-aware rules (floating promises, unsafe `any`) on TypeScript files only, using tsconfig.json.
  {
    files: ["**/*.{ts,tsx,mts,cts}"],
    extends: [tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
  },
  // Last, so it switches off every style rule above that would fight Prettier.
  prettier,
  globalIgnores([".next/**", "out/**", "build/**", "coverage/**", "node_modules/**", "learn/**", "next-env.d.ts"]),
]);
