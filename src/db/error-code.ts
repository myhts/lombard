// The one part of a database error that is safe to log. A SQLSTATE (28P01) or a Node errno (ECONNREFUSED) says why a
// call failed; the message and the rest of the error can echo the connection string, password included.
const safeCode = /^[A-Z0-9_]{1,32}$/;

// pg's own timeout errors carry no code, only these fixed messages (pg 8.23, pg-pool 3.14). An exact match maps them to
// the word "timeout", so the commonest "down" still says why without logging any of the message.
const pgTimeoutMessages = new Set([
  "timeout exceeded when trying to connect",
  "Connection terminated due to connection timeout",
  "timeout expired",
  "Query read timeout",
]);

// " (28P01)" when the error, or an error it wraps, carries a code of that shape; " (timeout)" when none does but one is
// a pg timeout; otherwise "", so a log line stays fixed text. Drizzle wraps the driver's error as `cause`; the walk stops
// after a few steps in case causes loop.
export function errorCodeSuffix(error: unknown): string {
  let timedOut = false;
  let current = error;
  for (let depth = 0; depth < 5 && typeof current === "object" && current !== null; depth++) {
    const code: unknown = Reflect.get(current, "code");
    if (typeof code === "string" && safeCode.test(code)) return ` (${code})`;
    const message: unknown = Reflect.get(current, "message");
    if (typeof message === "string" && pgTimeoutMessages.has(message)) timedOut = true;
    current = Reflect.get(current, "cause");
  }
  return timedOut ? " (timeout)" : "";
}
