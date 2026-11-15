// Tailwind 4 runs as a PostCSS plugin, the set-up Next 16's CSS guide gives
// (node_modules/next/dist/docs/01-app/01-getting-started/11-css.md). There is no tailwind.config file: the theme is
// CSS, in src/ui/theme.css.
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
