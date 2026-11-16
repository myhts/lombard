// What the controls share. `hovered:` and `focused:` are the theme's own variants (src/ui/theme.css): each matches
// the real state and the specimen sheet's forced one.

// Keyboard focus: an ink outline, clear of the control's own border.
export const focusRing = "focused:outline-2 focused:outline-offset-2 focused:outline-ink";

// A change of colour takes --quick, and is instant for a reader who asks for reduced motion.
export const quickColours = "motion-safe:transition-colors motion-safe:duration-(--quick)";

// A box to write in, in ink and paper: `Field`'s input and the composer's text box are dressed alike.
export const textBox = `rounded-paper border border-ink-soft bg-paper px-3 py-2 text-ink placeholder:text-ink-soft enabled:hovered:border-ink enabled:hovered:shadow-resting disabled:cursor-not-allowed disabled:border-paper-edge disabled:bg-paper-aged disabled:text-ink-soft ${focusRing} ${quickColours}`;
