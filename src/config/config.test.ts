import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ConfigError, loadConfig, loadDatabaseConfig } from "./index";

type Env = Record<string, string | undefined>;

// Invented values. The SENTINEL markers let the leak test search error text for them.
const validEnv = (): Env => ({
  DATABASE_URL: "postgres://lombard:SENTINEL-db-password@localhost:5432/lombard",
  ANTHROPIC_API_KEY: "sk-ant-SENTINEL-anthropic-key",
  ANTHROPIC_BASE_URL: "http://127.0.0.1:4010/anthropic",
  VOYAGE_API_KEY: "pa-SENTINEL-voyage-key",
  VOYAGE_BASE_URL: "http://127.0.0.1:4010/voyage",
});

function configErrorFrom(env: Env, load: (env: Env) => unknown = loadConfig): ConfigError {
  try {
    load(env);
  } catch (error) {
    if (error instanceof ConfigError) return error;
    throw error;
  }
  throw new Error("expected the loader to throw a ConfigError");
}

describe("loadConfig", () => {
  it("parses valid settings into a frozen config", () => {
    const config = loadConfig(validEnv());

    expect(config).toEqual({
      databaseUrl: "postgres://lombard:SENTINEL-db-password@localhost:5432/lombard",
      anthropic: { apiKey: "sk-ant-SENTINEL-anthropic-key", baseUrl: "http://127.0.0.1:4010/anthropic" },
      voyage: { apiKey: "pa-SENTINEL-voyage-key", baseUrl: "http://127.0.0.1:4010/voyage" },
    });
    expect(Object.isFrozen(config)).toBe(true);
    expect(Object.isFrozen(config.anthropic)).toBe(true);
    expect(Object.isFrozen(config.voyage)).toBe(true);
  });

  it.each([
    "postgres://lombard:pw@localhost:5432/lombard",
    "postgresql://lombard@localhost/lombard",
    "postgres://u@127.0.0.1/db",
    "postgres://u@[::1]:5432/db",
    "postgres://u@LOCALHOST/db",
    "postgres://u@localhost/db?sslmode=disable",
    "postgres://u@localhost/db?application_name=lombard&channel_binding=disable",
    "postgres://u@db.example.com/db?sslmode=verify-full",
    "postgres://u@db.example.com/db?sslmode=verify-full&sslmode=verify-full",
    "postgres://u@db.example.com:5432/db?application_name=lombard&sslmode=verify-full&channel_binding=require",
  ])("accepts %s as DATABASE_URL", (url) => {
    const env = { ...validEnv(), DATABASE_URL: url };

    expect(loadConfig(env).databaseUrl).toBe(url);
  });

  const baseUrlNames = ["ANTHROPIC_BASE_URL", "VOYAGE_BASE_URL"];
  const acceptedBaseUrls = [
    "http://127.0.0.1:4010/anthropic",
    "http://localhost:4010",
    "http://[::1]:4010",
    "https://ai.mongodb.com/v1",
    "https://proxy.example.com",
  ];
  it.each(baseUrlNames.flatMap((name) => acceptedBaseUrls.map((url) => [name, url] as const)))(
    "accepts %s set to %s",
    (name, url) => {
      const config = loadConfig({ ...validEnv(), [name]: url });

      expect(name === "ANTHROPIC_BASE_URL" ? config.anthropic.baseUrl : config.voyage.baseUrl).toBe(url);
    },
  );

  const blanks = [undefined, "", " \t "];

  it.each(blanks)("defaults the Voyage base URL when VOYAGE_BASE_URL is %j", (blank) => {
    const env = { ...validEnv(), VOYAGE_BASE_URL: blank };

    expect(loadConfig(env).voyage.baseUrl).toBe("https://ai.mongodb.com/v1");
  });

  it.each(blanks)("uses the real Anthropic API when ANTHROPIC_BASE_URL is %j", (blank) => {
    const env = { ...validEnv(), ANTHROPIC_BASE_URL: blank };

    expect(loadConfig(env).anthropic.baseUrl).toBeUndefined();
  });

  const required = ["DATABASE_URL", "ANTHROPIC_API_KEY", "VOYAGE_API_KEY"];
  it.each(required.flatMap((name) => blanks.map((blank) => [name, blank] as const)))(
    "fails naming %s when it is %j",
    (name, blank) => {
      const env = validEnv();
      if (blank === undefined) delete env[name];
      else env[name] = blank;

      expect(configErrorFrom(env).message).toContain(name);
    },
  );

  it.each([
    ["DATABASE_URL", "mysql://lombard:SENTINEL-db-password@localhost/lombard"],
    ["DATABASE_URL", "SENTINEL-not-a-url"],
    ["DATABASE_URL", "postgres:foo"],
    ["DATABASE_URL", "postgresql:/x"],
    ["DATABASE_URL", "postgres://"],
    ["DATABASE_URL", "postgres:///db"],
    // A host other than this machine must use TLS and check the server's certificate: sslmode=verify-full.
    ["DATABASE_URL", "postgres://u@db.example.com/db"],
    ["DATABASE_URL", "postgres://u@DB.EXAMPLE.COM/db"],
    ["DATABASE_URL", "postgres://u@db.example.com/db?sslmode=disable"],
    ["DATABASE_URL", "postgres://u@db.example.com/db?sslmode=prefer"],
    ["DATABASE_URL", "postgres://u@db.example.com/db?sslmode=no-verify"],
    ["DATABASE_URL", "postgres://u@db.example.com/db?sslmode=require"],
    ["DATABASE_URL", "postgres://u@db.example.com/db?sslmode=verify-ca"],
    ["DATABASE_URL", "postgres://u@10.0.0.5/db"],
    // node-postgres uses the last sslmode, so every one must be verify-full.
    ["DATABASE_URL", "postgres://u@db.example.com/db?sslmode=verify-full&sslmode=disable"],
    ["DATABASE_URL", "postgres://u@db.example.com/db?sslmode=verify-full&sslmode=require"],
    // Only sslmode, application_name and channel_binding are allowed, on any host. uselibpqcompat turns certificate
    // checks off under require; ?host= replaces the URL's host (and names a unix socket); the rest override TLS
    // files, timeouts or TLS itself.
    ["DATABASE_URL", "postgres://u@db.example.com/db?sslmode=require&uselibpqcompat=true"],
    ["DATABASE_URL", "postgres://u@db.example.com/db?sslmode=verify-full&uselibpqcompat=true"],
    ["DATABASE_URL", "postgres://u@db.example.com/db?ssl=true"],
    ["DATABASE_URL", "postgres://u@db.example.com/db?sslmode=verify-full&sslrootcert=/tmp/ca.pem"],
    ["DATABASE_URL", "postgres://u@localhost/db?host=db.example.com"],
    ["DATABASE_URL", "postgres://u@localhost/db?host=/var/run/postgresql"],
    ["DATABASE_URL", "postgres://u@localhost/db?uselibpqcompat=true"],
    ["DATABASE_URL", "postgres://u@localhost/db?sslcert=/tmp/client.pem"],
    ["DATABASE_URL", "postgres://u@localhost/db?sslkey=/tmp/client.key"],
    ["DATABASE_URL", "postgres://u@localhost/db?query_timeout=0"],
    ["DATABASE_URL", "postgres://u@localhost/db?SSLMODE=disable"],
    ["ANTHROPIC_BASE_URL", "SENTINEL anthropic not a url"],
    ["ANTHROPIC_BASE_URL", "http://example.com"],
    ["ANTHROPIC_BASE_URL", "http://10.0.0.5:4010"],
    ["ANTHROPIC_BASE_URL", "ftp://localhost"],
    // Tricks that make a remote host look local. Both base URLs share one schema, so one variable covers them.
    ["ANTHROPIC_BASE_URL", "http://localhost.evil.com"],
    ["ANTHROPIC_BASE_URL", "http://127.0.0.1@evil.com"],
    ["ANTHROPIC_BASE_URL", "http://localhost."],
    ["ANTHROPIC_BASE_URL", "http://[::ffff:127.0.0.1]"],
    ["VOYAGE_BASE_URL", "SENTINEL voyage not a url"],
    ["VOYAGE_BASE_URL", "http://example.com"],
    ["VOYAGE_BASE_URL", "http://10.0.0.5:4010"],
    ["VOYAGE_BASE_URL", "ftp://localhost"],
  ])("fails naming %s when it is %s", (name, value) => {
    const env = { ...validEnv(), [name]: value };

    expect(configErrorFrom(env).message).toContain(name);
  });

  it.each([
    ["another variable is missing", { DATABASE_URL: undefined }],
    ["the secret's own variable is malformed", { DATABASE_URL: "mysql://root:SENTINEL-db-password@db/x" }],
    ["a remote database URL has no sslmode", { DATABASE_URL: "postgres://u:SENTINEL-db-password@db.example.com/x" }],
    [
      "a remote database URL turns certificate checks off",
      { DATABASE_URL: "postgres://u:SENTINEL-db-password@db.example.com/x?sslmode=require&uselibpqcompat=true" },
    ],
    [
      "a database URL carries a parameter that isn't allowed",
      { DATABASE_URL: "postgres://u@localhost/x?application_name=lombard&options=SENTINEL-option" },
    ],
    ["a base URL is malformed", { ANTHROPIC_BASE_URL: "SENTINEL-anthropic-url" }],
    ["a base URL is plain http to a remote host", { VOYAGE_BASE_URL: "http://SENTINEL.example.com" }],
  ])("never includes a value in the error when %s", (_case, overrides: Env) => {
    const env = { ...validEnv(), ...overrides };
    const error = configErrorFrom(env);
    const ownProperties = Object.fromEntries(
      Object.getOwnPropertyNames(error).map((key) => [key, Reflect.get(error, key)]),
    );
    const exposed = [error.message, String(error), JSON.stringify(ownProperties)];

    for (const value of Object.values(env)) {
      if (value === undefined || value.trim() === "") continue;
      for (const text of exposed) expect(text).not.toContain(value);
    }
    expect(exposed.join("\n")).not.toContain("SENTINEL");
  });

  it("says a remote database needs sslmode=verify-full", () => {
    const env = { ...validEnv(), DATABASE_URL: "postgres://u@db.example.com/db?sslmode=require" };
    const message = configErrorFrom(env).message;

    expect(message).toContain("sslmode=verify-full");
    expect(message).not.toContain("require");
  });

  it("names the query parameters a database URL may carry", () => {
    const env = { ...validEnv(), DATABASE_URL: "postgres://u@localhost/db?query_timeout=0" };

    expect(configErrorFrom(env).message).toContain("sslmode, application_name and channel_binding");
  });

  it("names every problem in one error", () => {
    const env = { ...validEnv(), DATABASE_URL: "", ANTHROPIC_API_KEY: undefined, VOYAGE_BASE_URL: "nope" };
    const message = configErrorFrom(env).message;

    expect(message).toContain("DATABASE_URL");
    expect(message).toContain("ANTHROPIC_API_KEY");
    expect(message).toContain("VOYAGE_BASE_URL");
    expect(message).not.toContain("VOYAGE_API_KEY");
  });
});

describe("loadDatabaseConfig", () => {
  it("needs only DATABASE_URL, not the API keys", () => {
    const config = loadDatabaseConfig({ DATABASE_URL: validEnv().DATABASE_URL });

    expect(config).toEqual({ databaseUrl: "postgres://lombard:SENTINEL-db-password@localhost:5432/lombard" });
    expect(Object.isFrozen(config)).toBe(true);
  });

  // The same message as loadConfig's proves both loaders share one DATABASE_URL rule and one error format.
  it.each([
    ["missing", undefined],
    ["not postgres", "mysql://lombard:SENTINEL-db-password@localhost/lombard"],
    ["without a host", "postgres:///SENTINEL-db"],
  ])("fails like loadConfig when DATABASE_URL is %s, without the value", (_case, url) => {
    const message = configErrorFrom({ DATABASE_URL: url }, loadDatabaseConfig).message;

    expect(message).toBe(configErrorFrom({ ...validEnv(), DATABASE_URL: url }).message);
    expect(message).toContain("DATABASE_URL");
    expect(message).not.toContain("SENTINEL");
  });
});

describe("getConfig", () => {
  // A fresh module per test, so each one starts with an empty cache.
  beforeEach(() => {
    vi.resetModules();
    for (const [name, value] of Object.entries(validEnv())) vi.stubEnv(name, value);
  });
  afterEach(() => vi.unstubAllEnvs());

  it("loads process.env once and returns the same config after", async () => {
    const { getConfig } = await import("./index");
    const first = getConfig();
    vi.stubEnv("DATABASE_URL", "postgres://other@localhost/other");

    expect(getConfig()).toBe(first);
    expect(first.databaseUrl).toBe(validEnv().DATABASE_URL);
  });

  it("does not cache a failed load", async () => {
    const { getConfig } = await import("./index");
    vi.stubEnv("DATABASE_URL", undefined);
    expect(() => getConfig()).toThrow("DATABASE_URL: missing");

    vi.stubEnv("DATABASE_URL", validEnv().DATABASE_URL);
    expect(getConfig().databaseUrl).toBe(validEnv().DATABASE_URL);
  });
});
