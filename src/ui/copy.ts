// Every string the interface shows lives here (docs/ui/THEME.md, rule 6): components read their words from this file or
// take them as props. The sample text is invented. None of it comes from the Old Bailey data, and none uses the long s.
export const copy = {
  shopSign: { closed: "Closed" },
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
    sheet: {
      heading: "The Sheet",
      plain: "Plain",
      aged: "Aged",
      lifted: "Lifted",
      sample: "Laid paper under pressed display type. This line is body text, and is not pressed.",
    },
    rule: { heading: "Rules and Flowers", thin: "Thin", double: "Double", flower: "With flower", fleuron: "Fleuron" },
    shopSign: { heading: "The Shop Sign", open: "Open", closed: "Closed", name: "The Three Balls" },
    controls: {
      states: { default: "Default", hover: "Hover", focus: "Focus", disabled: "Disabled" },
      button: { heading: "The Button", text: "Say it" },
      field: { heading: "The Field", label: "Invite code", value: "WATCH-1753" },
      switch: { heading: "The Switch", off: "Snuff the candle: off", on: "Snuff the candle: on" },
    },
    money: {
      heading: "Money",
      inline: "Inline",
      sentence: "Lent upon a silver watch, the sum of",
      ledger: "In a ledger column",
      pledges: { watch: "A silver watch", buckles: "A pair of buckles", coat: "A cloth coat", ring: "A gold ring" },
    },
  },
} as const;
