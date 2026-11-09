import { z } from "zod";

export type Config = {
  readonly databaseUrl: string;
  readonly anthropic: { readonly apiKey: string; readonly baseUrl: string | undefined };
  readonly voyage: { readonly apiKey: string; readonly baseUrl: string };
};

export class ConfigError extends Error {
  override name = "ConfigError";
}

// Plain http would send the API key unencrypted, so it is allowed only to this machine, where the HTTP model fake runs.
// URL keeps the brackets on an IPv6 hostname.
const localHostnames = new Set(["localhost", "127.0.0.1", "[::1]"]);

// Not z.httpUrl(): it demands a domain name and rejects 127.0.0.1 and localhost.
// zod runs the refine even when the URL check failed, so it must cope with an unparseable value.
const baseUrl = () =>
  z.url({ protocol: /^https?$/ }).refine((value) => {
    const url = URL.parse(value);
    return url?.protocol === "https:" || localHostnames.has(url?.hostname ?? "");
  });

const envSchema = z.object({
  // The URL parser alone accepts "postgres:foo" and "postgres://" with no host.
  DATABASE_URL: z.url({ hostname: /.+/ }).regex(/^postgres(ql)?:\/\//),
  ANTHROPIC_API_KEY: z.string(),
  ANTHROPIC_BASE_URL: baseUrl().optional(),
  VOYAGE_API_KEY: z.string(),
  VOYAGE_BASE_URL: baseUrl().default("https://ai.mongodb.com/v1"),
});

type VariableName = keyof typeof envSchema.shape;

// Why a present value was rejected. Only the URL variables can fail that way; the keys only check presence.
const invalidReason: Partial<Record<VariableName, string>> = {
  DATABASE_URL: "must be a postgres:// or postgresql:// URL with a host",
  ANTHROPIC_BASE_URL: "must be an https:// URL (http:// only for localhost)",
  VOYAGE_BASE_URL: "must be an https:// URL (http:// only for localhost)",
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
