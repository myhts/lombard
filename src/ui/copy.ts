// Every string the interface shows lives here (docs/ui/THEME.md, rule 6): components read their words from this file or
// take them as props. The sample text is invented. None of it comes from the Old Bailey data, and none uses the long s.
export const copy = {
  shopSign: { closed: "Closed" },
  // The speakers' names, as the dialogue sets them before each line.
  speakers: { pawnbroker: "Pawnbroker", customer: "Customer" },
  // The dialogue's accessible name.
  dialogue: { label: "The conversation" },
  // What the pawnbroker is seen to do while a tool runs, keyed by the tool's name: a new tool gets its line by adding
  // one entry here (the event table in docs/ui/THEME.md).
  stageDirections: {
    search_records: "He turns the pages of the Proceedings.",
    appraise: "He weighs it in his hand and reckons.",
    check_notices: "He looks over the notices by the door.",
  },
  // What stands in the dialogue while the customer waits for the pawnbroker's answer: a saying a London shop of the
  // 1750s could have known, and what is printed after it (settled in #19). The words are the source's, in modern
  // spelling and capitals: Fuller's Gnomologia (1732) and Ray's English Proverbs (1737) for the proverbs, the Folger
  // Shakespeare for the two plays, and the King James Bible for the last. All are long out of copyright, and none
  // comes from the Old Bailey data.
  // The longest saying stays last: the specimen sheet shows the last one, to show how a saying wraps on a phone.
  sayings: [
    { words: "Neither a borrower nor a lender be.", source: "Hamlet" },
    { words: "All that glisters is not gold.", source: "The Merchant of Venice" },
    { words: "He that goes a borrowing goes a sorrowing.", source: "Proverb" },
    { words: "A fool and his money are soon parted.", source: "Proverb" },
    { words: "Honesty is the best policy.", source: "Proverb" },
    { words: "Better go to bed supperless than rise in debt.", source: "Proverb" },
    { words: "Good paymasters need not bring a pawn.", source: "Proverb" },
    { words: "Out of debt, out of danger.", source: "Proverb" },
    { words: "Good bargains are pickpockets.", source: "Proverb" },
    { words: "Debt is the worst poverty.", source: "Proverb" },
    {
      words: "The rich ruleth over the poor, and the borrower is servant to the lender.",
      source: "The Book of Proverbs",
    },
  ],
  // The composer. `sending` is read out by a screen reader; on screen, sending is the waiting pulse beside the button.
  composer: {
    label: "What do you say?",
    say: "Say it",
    sending: "Sending",
    visitOver: "The visit is over.",
    turnsLeft: (turns: number) => (turns === 0 ? "No turns left" : turns === 1 ? "1 turn left" : `${turns} turns left`),
  },
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
    dialogue: {
      heading: "The Dialogue",
      pawnbroker: "A pawnbroker line",
      customer: "A customer line",
      streaming: "Streaming",
      waiting: "Waiting, with a saying",
      stageDirection: "A stage direction",
    },
    stageDirection: { heading: "Stage Directions", running: "while it runs", returned: "after it returns" },
    composer: { heading: "The Composer", idle: "Idle", sending: "Sending", disabled: "Disabled", over: "Visit over" },
    // The made-up exchange, in the order it is played. It names no sum, so `Money` stays the one place that writes one.
    exchange: {
      heading: "A Made-up Exchange",
      opening: "Good day to you. I have a silver watch I should like to pledge.",
      question: "A fair piece, though the case is worn at the hinge. How did you come by it?",
      answer: "It was my father's. He left it to me this last winter.",
      verdict:
        "I find no notice of such a watch, and the records show a like one pledged without complaint. I will lend upon it, if the term suits you.",
    },
  },
} as const;
