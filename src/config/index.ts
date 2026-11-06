import { z } from "zod";

export type Config = {
  readonly databaseUrl: string;
  readonly anthropic: { readonly apiKey: string; readonly baseUrl: string | undefined };
  readonly voyage: { readonly apiKey: string; readonly baseUrl: string };
};

export class ConfigError extends Error {
  override name = "ConfigError";
}

// Not z.httpUrl(): it demands a domain name and rejects 127.0.0.1 and localhost, where the HTTP model fake runs.
const httpUrl = () => z.url({ protocol: /^https?$/ });

const envSchema = z.object({
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
  ANTHROPIC_API_KEY: z.string(),
  ANTHROPIC_BASE_URL: httpUrl().optional(),
  VOYAGE_API_KEY: z.string(),
  VOYAGE_BASE_URL: httpUrl().default("https://ai.mongodb.com/v1"),
});

type VariableName = keyof typeof envSchema.shape;

// Why a present value was rejected. Only the URL variables can fail that way; the keys only check presence.
const invalidReason: Partial<Record<VariableName, string>> = {
  DATABASE_URL: "must be a postgres:// or postgresql:// URL",
  ANTHROPIC_BASE_URL: "must be an http:// or https:// URL",
  VOYAGE_BASE_URL: "must be an http:// or https:// URL",
};

export function loadConfig(env: Record<string, string | undefined>): Config {
  const names = Object.keys(envSchema.shape) as VariableName[]; // Object.keys loses the literal key type.
  const cleaned = Object.fromEntries(names.map((name) => [name, env[name]?.trim() || undefined]));

  const result = envSchema.safeParse(cleaned);
  if (!result.success) {
    // Built by hand from variable names and our own reasons: zod's messages and issues can echo the secret input.
    const problems = new Set(
      result.error.issues.map((issue) => {
        const name = String(issue.path[0]) as VariableName; // Every issue sits on one top-level variable.
        const reason = cleaned[name] === undefined ? "missing" : (invalidReason[name] ?? "invalid");
        return `  ${name}: ${reason}`;
      }),
    );
    throw new ConfigError(`Invalid configuration:\n${[...problems].join("\n")}`);
  }

  const parsed = result.data;
  return Object.freeze({
    databaseUrl: parsed.DATABASE_URL,
    anthropic: Object.freeze({ apiKey: parsed.ANTHROPIC_API_KEY, baseUrl: parsed.ANTHROPIC_BASE_URL }),
    voyage: Object.freeze({ apiKey: parsed.VOYAGE_API_KEY, baseUrl: parsed.VOYAGE_BASE_URL }),
  });
}
