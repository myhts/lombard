// Every string the interface shows lives here (docs/ui/THEME.md, rule 6): components read their words from this file or
// take them as props. The sample text is invented. None of it comes from the Old Bailey data, and none uses the long s.
export const copy = {
  specimen: {
    title: "Specimen Sheet",
    madeUpData: "Specimen: made-up data.",
    palette: { heading: "The Palette" },
    type: {
      heading: "The Types",
      text: {
        face: "Libre Caslon Text",
        sample: "Money lent upon plate, watches and wearing apparel, at the sign of the Three Balls.",
        italicSample: "He holds the watch to the candle and says nothing for a while.",
      },
      display: { face: "IM Fell English", sample: "A Silver Watch, lately Pledged" },
      displaySc: { face: "IM Fell English SC", sample: "The Pawnbroker. The Customer." },
      hand: { face: "Pinyon Script", sample: "No. 417" },
      instrument: { face: "System monospace", sample: "search_records  3 hits  212 ms" },
      sizes: { heading: "The Sizes", sample: "A silver watch" },
    },
  },
} as const;
