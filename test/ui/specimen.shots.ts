import { expect, test } from "@playwright/test";

// `pnpm ui:shots`: pictures of the specimen sheet for the owner's review, saved to .ui-shots/ (git-ignored). The
// browser checks of spec #12 join this run from #19.

// A phone and a laptop, the two widths every screen is judged at (docs/ui/THEME.md, rules 9 and 11).
const widths = [360, 1280];
// Every route that holds specimen sections. A ticket that adds a demo route lists it here.
const routes = ["/specimen"];

for (const route of routes) {
  for (const width of widths) {
    test(`${route} at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      const response = await page.goto(route);
      // A picture of an error page, or of no sections, would pass for a review that never happened.
      expect(response?.ok()).toBe(true);
      const sections = await page.locator("[data-specimen]").all();
      expect(sections.length).toBeGreaterThan(0);
      await page.evaluate(() => document.fonts.ready);

      const name = route.slice(1).replaceAll("/", "-");
      // The whole page first, so the frame around the sections can be judged too.
      await page.screenshot({ path: `.ui-shots/${name}-page-${width}.png`, fullPage: true });
      for (const section of sections) {
        const id = await section.getAttribute("data-specimen");
        await section.screenshot({ path: `.ui-shots/${name}-${id}-${width}.png` });
      }
    });
  }
}
