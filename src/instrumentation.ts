// Next calls register() once when a server instance starts, and finishes it before serving any request.
// We use it to check the environment at startup, so a bad setting fails at once and not on the first request that
// needs it.
export async function register() {
  // Node.js only: the server reads its settings there. register() also runs in the Edge runtime if one is ever used.
  // Keep this exact `if` shape: Next replaces NEXT_RUNTIME at build time and drops the block from the Edge bundle,
  // which has no process.exit().
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      // Imported here, as the Next docs advise, so the Edge bundle never pulls in the config module. Inside the `try`
      // so a module that fails to load also stops the server.
      const { getConfig } = await import("./config");
      getConfig();
    } catch (error) {
      // Exit ourselves on any error instead of rethrowing. Tried on Next 16.4.2: when register() throws, `next dev`
      // exits with code 1, but `next start` logs the error and keeps running, answering every request with HTTP 500,
      // so a container would look alive. Exiting gives both commands the same clear failure. Logging the error whole
      // is safe: getConfig throws only a ConfigError, which holds variable names and reasons, never values, and an
      // import error comes from our own code, not the environment.
      console.error(error);
      process.exit(1);
    }
  }
}
