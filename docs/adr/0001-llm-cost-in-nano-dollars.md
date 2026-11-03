# LLM cost is recorded in integer nano-dollars, not pence

The money rule (whole pence, as integers) is for the game's money: loans, pledges and cash in 1750s shillings and
pence. What we pay Anthropic and Voyage is a different quantity. It's billed in US dollars, and one call costs a tiny
fraction of a cent: a one-sentence `voyage-4-lite` embedding is about 0.2 micro-dollars. We record it as integer
nano-dollars (USD × 10⁹) in its own column, which keeps even that call exact (200), sums without floats, needs no
exchange rate, and stays a safe JavaScript integer up to about $9 million.

Each row stores the cost at list price, computed when the call is made: free-tier allowances are billing, not cost,
and a later price change never rewrites old rows.

## Considered options

- **Whole pence with a conversion:** rounds nearly every call to zero.
- **Fractional pence as a decimal:** exact, but breaks "never floats" in spirit and still needs an exchange rate.
- **Integer micro-dollars:** a small embedding rounds to zero.
- **Tokens only, priced when read:** repricing would rewrite history whenever the table changes.
