// The ink caret: a pen's nib (docs/ui/THEME.md, "Texture and light"). At the end of a line whose words still arrive it
// rests, and never blinks: its caller takes it away when the stream ends. With `writing` it makes small pen strokes
// instead, beside the saying that stands in the dialogue while the customer waits. The strokes, and the room they
// take, are the theme's (`ink-caret-writing` in theme.css), and a reader who asks for reduced motion gets the nib
// still. Drawn in the colour of the text beside it, and a mark, so hidden from assistive technology.
export function InkCaret({ writing = false, className = "" }: { writing?: boolean; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 10 16"
      fill="currentColor"
      fillRule="evenodd"
      className={`inline-block h-4 w-2.5 rotate-12 ${writing ? "ink-caret-writing" : "ml-1 align-text-bottom"} ${className}`}
    >
      {/* The nib, point down, with its breather hole and the slit that runs from it to the point. */}
      <path d="M5 16 1 7C1 3.5 2.6 1 5 0c2.4 1 4 3.5 4 7zM5 5.2a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4zM4.7 8.5h.6v5h-.6z" />
    </svg>
  );
}
