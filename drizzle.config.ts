import { existsSync } from "node:fs";
import { defineConfig } from "drizzle-kit";
import { loadDatabaseConfig } from "./src/config";

// drizzle-kit doesn't read .env, so load it when it exists. A variable already set in the shell wins over the file.
if (existsSync(".env")) process.loadEnvFile(".env");

// Only DATABASE_URL, checked by the app's own rule: the migrate command runs without the API keys.
const { databaseUrl } = loadDatabaseConfig(process.env);

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  casing: "snake_case",
  dbCredentials: { url: databaseUrl },
});
