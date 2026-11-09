import { describe, expect, it } from "vitest";
import { ConfigError, loadConfig } from "./index";

type Env = Record<string, string | undefined>;

// Invented values. The SENTINEL markers let the leak test search error text for them.
const validEnv = (): Env => ({
  DATABASE_URL: "postgres://lombard:SENTINEL-db-password@localhost:5432/lombard",
  ANTHROPIC_API_KEY: "sk-ant-SENTINEL-anthropic-key",
  ANTHROPIC_BASE_URL: "http://127.0.0.1:4010/anthropic",
  VOYAGE_API_KEY: "pa-SENTINEL-voyage-key",
  VOYAGE_BASE_URL: "http://127.0.0.1:4010/voyage",
});

function configErrorFrom(env: Env): ConfigError {
  try {
    loadConfig(env);
  } catch (error) {
    if (error instanceof ConfigError) return error;
    throw error;
  }
  throw new Error("expected loadConfig to throw a ConfigError");
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
    ["ANTHROPIC_BASE_URL", "SENTINEL anthropic not a url"],
    ["ANTHROPIC_BASE_URL", "http://example.com"],
    ["ANTHROPIC_BASE_URL", "http://10.0.0.5:4010"],
    ["ANTHROPIC_BASE_URL", "ftp://localhost"],
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

  it("names every problem in one error", () => {
    const env = { ...validEnv(), DATABASE_URL: "", ANTHROPIC_API_KEY: undefined, VOYAGE_BASE_URL: "nope" };
    const message = configErrorFrom(env).message;

    expect(message).toContain("DATABASE_URL");
    expect(message).toContain("ANTHROPIC_API_KEY");
    expect(message).toContain("VOYAGE_BASE_URL");
    expect(message).not.toContain("VOYAGE_API_KEY");
  });
});
