import { useId } from "react";
import { copy } from "../copy";

// The centre of each ball in the drawing: two above and one below, as a pawnbroker hangs them.
const balls = [
  [72, 87],
  [168, 87],
  [120, 139],
] as const;

// The bar's left scrolled end. The right one is the same path, mirrored.
const scroll =
  "M54 32C42 32 33 27 33 19C33 12.5 38.5 9 44 9C49 9 52.5 12.5 52.5 17C52.5 20.5 50 23 46.5 23C44 23 42.2 21.4 42.2 19.2";

// The pawnbroker's sign: three gilt balls hanging from a wrought-iron bar, over a board with the shop's name. The
// balls are decoration; the name and, when the shop is closed, the word for it are the sign's text.
export function ShopSign({
  name,
  closed = false,
  className = "",
}: {
  name: string;
  closed?: boolean;
  className?: string;
}) {
  // A gradient and a filter are found by id across the whole page, and a page can hold more than one sign (the
  // specimen sheet shows two), so each sign names its own.
  const id = useId();
  const gilt = `${id}-gilt`;
  const soft = `${id}-soft`;

  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      {/* The balls are objects in the shop, so they are shaded and cast a shadow; nothing here is a flat icon
          (docs/ui/THEME.md, "Pictures"). */}
      <svg aria-hidden="true" viewBox="0 0 240 172" className="w-44">
        <defs>
          {/* In each ball's own coordinates, so one gradient lights all three from the upper left. */}
          <radialGradient id={gilt} gradientUnits="userSpaceOnUse" cx="0" cy="0" r="32" fx="-12" fy="-13">
            <stop offset="0" className="stop-gilt-glint" />
            <stop offset="0.25" className="stop-gilt-lit" />
            <stop offset="0.62" className="stop-gilt-body" />
            <stop offset="1" className="stop-gilt-shade" />
          </radialGradient>
          <filter id={soft} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" />
          </filter>
        </defs>
        {/* The iron takes the colour of the text around it, so it shows on paper and on the dark counter alike. */}
        <g fill="none" stroke="currentColor" strokeLinecap="round">
          <circle cx="120" cy="9" r="5" strokeWidth="2" />
          <path strokeWidth="2.4" d="M120 14V31" />
          <path strokeWidth="3.4" d="M54 32H186" />
          <path strokeWidth="2.6" d={scroll} />
          <path strokeWidth="2.6" d={scroll} transform="matrix(-1 0 0 1 240 0)" />
        </g>
        {balls.map(([x, y]) => (
          <g key={`${x} ${y}`}>
            {/* An eye on the bar, a rod, and a collar where the rod meets the ball. */}
            <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <circle cx={x} cy="37.2" r="3.2" />
              <path d={`M${x} 40.4V${y - 29}`} />
            </g>
            <rect x={x - 3.5} y={y - 29} width="7" height="3.4" fill="currentColor" />
            <g transform={`translate(${x} ${y}) scale(0.8667)`}>
              <circle cx="3" cy="5" r="29" className="fill-ink" opacity="0.35" filter={`url(#${soft})`} />
              <circle r="30" fill={`url(#${gilt})`} />
            </g>
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
