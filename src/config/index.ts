import { z } from "zod";

export type DatabaseConfig = { readonly databaseUrl: string };

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

// node-postgres reads these from the URL too, and most of them can undo the TLS rule below: uselibpqcompat turns
// certificate checks off under sslmode=require, ?host= replaces the URL's host (it also names a unix socket), and
// others swap the TLS files or the timeouts. So only parameters that can't are allowed, on any host
// (#5, decision of 2026-11-14).
const allowedDatabaseParameters = new Set(["sslmode", "application_name", "channel_binding"]);

// node-postgres turns TLS off unless sslmode asks for it, and only verify-full checks the server's certificate and
// name. It uses the last sslmode given, so every one must be verify-full. A postgres:// hostname keeps its case.
function isLocalOrVerifiesTls(value: string): boolean {
  const url = URL.parse(value);
  if (!url || [...url.searchParams.keys()].some((name) => !allowedDatabaseParameters.has(name))) return false;
  if (localHostnames.has(url.hostname.toLowerCase())) return true;
  const sslModes = url.searchParams.getAll("sslmode");
  return sslModes.length > 0 && sslModes.every((mode) => mode === "verify-full");
}

// The one DATABASE_URL rule. loadConfig extends this schema, so both loaders check the database URL the same way.
const databaseEnvSchema = z.object({
  // The URL parser alone accepts "postgres:foo" and "postgres://" with no host.
  DATABASE_URL: z
    .url({ hostname: /.+/ })
    .regex(/^postgres(ql)?:\/\//)
    .refine(isLocalOrVerifiesTls),
});

const envSchema = databaseEnvSchema.extend({
  ANTHROPIC_API_KEY: z.string(),
  ANTHROPIC_BASE_URL: baseUrl().optional(),
  VOYAGE_API_KEY: z.string(),
  VOYAGE_BASE_URL: baseUrl().default("https://ai.mongodb.com/v1"),
});

type VariableName = keyof typeof envSchema.shape;

// Why a present value was rejected. Only the URL variables can fail that way; the keys only check presence.
const invalidReason: Partial<Record<VariableName, string>> = {
  DATABASE_URL:
    "must be a postgres:// or postgresql:// URL with a host and no query parameters but sslmode, application_name " +
    "and channel_binding, and a host other than localhost needs sslmode=verify-full",
  ANTHROPIC_BASE_URL: "must be an https:// URL (http:// only for localhost)",
  VOYAGE_BASE_URL: "must be an https:// URL (http:// only for localhost)",
};

type Env = Record<string, string | undefined>;

function parseEnv<Schema extends typeof databaseEnvSchema>(schema: Schema, env: Env): z.output<Schema> {
  const names = Object.keys(schema.shape) as VariableName[]; // Object.keys loses the literal key type.
  const cleaned = Object.fromEntries(names.map((name) => [name, env[name]?.trim() || undefined]));

  const result = schema.safeParse(cleaned);
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
  return result.data;
}

// For code that needs only the database, such as the migrate command, which runs without the API keys.
export function loadDatabaseConfig(env: Env): DatabaseConfig {
  return Object.freeze({ databaseUrl: parseEnv(databaseEnvSchema, env).DATABASE_URL });
}

export function loadConfig(env: Env): Config {
  const parsed = parseEnv(envSchema, env);
  return Object.freeze({
    databaseUrl: parsed.DATABASE_URL,
    anthropic: Object.freeze({ apiKey: parsed.ANTHROPIC_API_KEY, baseUrl: parsed.ANTHROPIC_BASE_URL }),
    voyage: Object.freeze({ apiKey: parsed.VOYAGE_API_KEY, baseUrl: parsed.VOYAGE_BASE_URL }),
  });
}

let cached: Config | undefined;

// The app's one way to read its settings: loads process.env on the first call. A failed load isn't cached, so the next
// call tries again and throws again.
export function getConfig(): Config {
  cached ??= loadConfig(process.env);
  return cached;
}
