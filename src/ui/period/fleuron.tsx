// A printer's flower: four petals with a leaf between each pair, about a centre. Drawn in the colour of the text around
// it, and an ornament, so hidden from assistive technology.
export function Fleuron({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className={`inline-block size-6 ${className}`}>
      {[0, 90, 180, 270].map((turn) => (
        <g key={turn} transform={`rotate(${turn} 12 12)`}>
          <path d="M12 10.5C9.5 8.5 9.5 4.5 12 1.5c2.5 3 2.5 7 0 9z" />
          <path d="M12 10.5c-1.2-1.8-1.2-3.4 0-5 1.2 1.6 1.2 3.2 0 5z" transform="rotate(45 12 12)" />
        </g>
      ))}
      <circle cx="12" cy="12" r="1.5" />
    </svg>
  );
}
