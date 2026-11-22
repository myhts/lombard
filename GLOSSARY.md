# Lombard

Lombard is an AI pawnbroker game set in 1750s London; code, copy and tickets use one name for each thing below.

## Language

**Clipping**:
A cutting from the printed Proceedings, shown as the evidence for a claim.

**Handbill**:
A printed notice of stolen goods, as shown on screen.

**Specimen sheet**:
The page that shows every piece in every state with made-up data.

**Plain mode**:
The setting that removes the candle, the vignette and every animation. Its switch is labelled "Snuff the candle".

**Behind the counter**:
The instrument layer's panel, showing what the AI saw and did.

**Cost meter**:
The engine code that prices each model call at list price, in integer nano-dollars, and records it in the call log.

**Call log**:
Where the cost meter writes one record per logical model call, after the SDK's retries: tokens by kind, cost, latency,
status and request id, never the prompt or the response text.

**Purpose**:
The label the caller gives a model call, saying what it was for, so the call log can group spend by it.
