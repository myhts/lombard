# A remote DATABASE_URL must use sslmode=verify-full, and only three parameters

node-postgres takes its TLS settings from `DATABASE_URL` itself, and turns TLS off unless the URL's `sslmode` asks
for it. Other parameters can switch the checks off again, read files from disk, or point the connection at another
host. A remote database is reached over the internet with a password, so one careless or pasted URL could send that
password, and every query, in plain text or to a server whose certificate nobody checked. The config loader
(`src/config/index.ts`) therefore refuses such a URL before the app starts.

A host other than `localhost`, `127.0.0.1` or `[::1]` must set `sslmode=verify-full`, and every repeated `sslmode` must
say the same, since pg uses the last one. On any host the URL may carry only `sslmode`, `application_name` and
`channel_binding`, with unencoded names. A URL that pg-connection-string would rewrite with `encodeURI` before reading
it (one holding a space or a `%` not followed by two hex digits) is refused, because after that rewrite pg reads its
parameters differently from the validator and can miss `sslmode` entirely.

## Considered options

- **Accept `require` or `verify-ca`:** pg v9 gives them libpq's meaning, which doesn't check the server's name
  (`verify-ca`) or certificate at all (`require`); `uselibpqcompat=true` does so already in pg 8.
- **Allow `?host=`:** it overrides the URL's host, so a URL that looks local can connect anywhere, bypassing the
  local-host check.
- **Allow the TLS file parameters (`sslcert`, `sslkey`, `sslrootcert`):** pg reads those files from disk when it
  parses the URL.
- **Allow timeout overrides in the URL (`query_timeout`, `statement_timeout` and the like):** they would undo the
  app's own limits from configuration nobody reviews.
- **A denylist of dangerous parameters:** every new parameter pg learns would be allowed until someone noticed it.

## Consequences

- Neon's copy-paste string ends in `sslmode=require`; slice 9 changes it to `verify-full` when it sets the secret.
- pg 8.23.1 ignores `channel_binding` in the URL (it reads only the client option `enableChannelBinding`). It is
  allowed so Neon's string pastes unchanged; it isn't enforced.
- A password or `application_name` with a space or a bare `%` must be percent-encoded.
