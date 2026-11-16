import { copy } from "../copy";

// The pawnbroker's sign: three golden balls hanging from a bracket, over a board with the shop's name. The balls are
// decoration; the name and, when the shop is closed, the word for it are the sign's text.
export function ShopSign({
  name,
  closed = false,
  className = "",
}: {
  name: string;
  closed?: boolean;
  className?: string;
}) {
  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      {/* The bracket takes the colour of the text around it, so it shows on paper and on the dark counter alike. */}
      <svg aria-hidden="true" viewBox="0 0 120 80" className="w-36">
        <g fill="none" stroke="currentColor" strokeLinecap="round">
          <path strokeWidth="3" d="M10 6h100" />
          <path strokeWidth="2" d="M10 6c-7 0-7 9 0 9M110 6c7 0 7 9 0 9" />
          <path strokeWidth="1.5" d="M34 6v12M86 6v12M60 6v38" />
        </g>
        {[
          [34, 30],
          [86, 30],
          [60, 56],
        ].map(([x = 0, y = 0]) => (
          <g key={x}>
            <circle cx={x} cy={y} r="12" className="fill-brass stroke-oak" />
            <circle cx={x - 4} cy={y - 4} r="3" className="fill-candle" opacity="0.7" />
          </g>
        ))}
      </svg>
      <p className="texture-oak rounded-paper border border-brass px-6 py-2 text-center font-display text-xl text-candle shadow-resting">
        {name}
      </p>
      {closed && (
        <p className="texture-laid type-pressed -mt-1 mb-2 -rotate-3 rounded-paper bg-paper px-4 font-display-sc text-lg text-ink shadow-resting">
          {copy.shopSign.closed}
        </p>
      )}
    </div>
  );
}
