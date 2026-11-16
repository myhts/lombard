import { expect, test, type Page } from "@playwright/test";

// `pnpm ui:shots`: pictures of the specimen sheet for the owner's review, saved to .ui-shots/ (git-ignored), and the
// browser checks of spec #12 ("Testing Decisions", seam 5).

// A phone and a laptop, the two widths every screen is judged at (docs/ui/THEME.md, rules 9 and 11).
const widths = [360, 1280];
// Every route that holds specimen sections. A ticket that adds a demo route lists it here.
const routes = ["/specimen"];

// The made-up exchange plays from a timer, and its text box opens only when it has played out.
async function exchangeBox(page: Page) {
  const box = page.locator('[data-specimen="exchange"]').getByRole("textbox", { name: "What do you say?" });
  await expect(box).toBeEnabled({ timeout: 20_000 });
  return box;
}

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
      // A picture taken sooner would show the exchange part-way through. A route without one has nothing to wait for.
      if ((await page.locator('[data-specimen="exchange"]').count()) > 0) await exchangeBox(page);

      const name = route.slice(1).replaceAll("/", "-");
      // The waiting pulse is drawn at its first frame, in full ink: caught part-way, it would pass for a fainter mark.
      const still = { animations: "disabled" } as const;
      // The whole page first, so the frame around the sections can be judged too.
      await page.screenshot({ path: `.ui-shots/${name}-page-${width}.png`, fullPage: true, ...still });
      for (const section of sections) {
        const id = await section.getAttribute("data-specimen");
        await section.screenshot({ path: `.ui-shots/${name}-${id}-${width}.png`, ...still });
      }
    });
  }
}

test("a line is written and sent by keyboard alone", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/specimen");
  const box = await exchangeBox(page);
  const exchange = page.locator('[data-specimen="exchange"]');

  // No pointer and no script puts the focus in the box: Tab walks to it from the top of the page.
  for (let presses = 0; presses < 60 && !(await box.evaluate((el) => el === document.activeElement)); presses++) {
    await page.keyboard.press("Tab");
  }
  await expect(box).toBeFocused();

  // Enter on an empty box sends nothing, and Shift+Enter starts a new line without sending.
  await page.keyboard.press("Enter");
  await page.keyboard.type("It keeps good time,");
  await page.keyboard.press("Shift+Enter");
  await page.keyboard.type("and has never been mended.");
  await expect(exchange.getByText("3 turns left")).toBeVisible();

  await page.keyboard.press("Enter");
  await expect(exchange.getByRole("log")).toContainText("Customer. It keeps good time, and has never been mended.");
  await expect(exchange.getByText("2 turns left")).toBeVisible();
  // The box is ready for the next line.
  await expect(box).toHaveValue("");
  await expect(box).toBeFocused();
});
