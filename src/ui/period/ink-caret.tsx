// The ink caret: a pen's nib, resting at the end of a line while its words still arrive (docs/ui/THEME.md, "Texture
// and light"). Drawn in the colour of the text it follows, and a mark, so hidden from assistive technology. It never
// blinks: its caller takes it away when the stream ends.
export function InkCaret({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 10 16"
      fill="currentColor"
      fillRule="evenodd"
      className={`ml-1 inline-block h-4 w-2.5 rotate-12 align-text-bottom ${className}`}
    >
      {/* The nib, point down, with its breather hole and the slit that runs from it to the point. */}
      <path d="M5 16 1 7C1 3.5 2.6 1 5 0c2.4 1 4 3.5 4 7zM5 5.2a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4zM4.7 8.5h.6v5h-.6z" />
    </svg>
  );
}
