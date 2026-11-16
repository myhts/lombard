// What the three controls share. `hovered:` and `focused:` are the theme's own variants (src/ui/theme.css): each matches
// the real state and the specimen sheet's forced one.

// Keyboard focus: an ink outline, clear of the control's own border.
export const focusRing = "focused:outline-2 focused:outline-offset-2 focused:outline-ink";

// A change of colour takes --quick, and is instant for a reader who asks for reduced motion.
export const quickColours = "motion-safe:transition-colors motion-safe:duration-(--quick)";
