// The one part of a database error that is safe to log. A SQLSTATE (28P01) or a Node errno (ECONNREFUSED) says why a
// call failed; the message and the rest of the error can echo the connection string, password included.
const safeCode = /^[A-Z0-9_]{1,32}$/;

// " (28P01)" when the error, or an error it wraps, carries a code of that shape; otherwise "", so a log line stays
// fixed text. Drizzle wraps the driver's error as `cause`; the walk stops after a few steps in case causes loop.
export function errorCodeSuffix(error: unknown): string {
  let current = error;
  for (let depth = 0; depth < 5 && typeof current === "object" && current !== null; depth++) {
    const code: unknown = Reflect.get(current, "code");
    if (typeof code === "string" && safeCode.test(code)) return ` (${code})`;
    current = Reflect.get(current, "cause");
  }
  return "";
}
