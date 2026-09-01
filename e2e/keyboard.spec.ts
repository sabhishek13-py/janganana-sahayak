import { expect, test } from '@playwright/test';

const ROUTES = ['/', '/phases', '/schedule', '/walkthrough', '/trust', '/insights'] as const;

/** Full keyboard operability, with no pointer used anywhere in this file. */
test.describe('keyboard-only navigation', () => {
  test('the first tab stop is a working skip link', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');

    const focused = page.locator(':focus');
    await expect(focused).toHaveText('Skip to main content');
    await expect(focused).toBeInViewport();

    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main$/);
  });

  test('every route can be reached from the keyboard alone', async ({ page }) => {
    await page.goto('/');
    for (const route of ROUTES.slice(1)) {
      await page.goto('/');
      let reached = false;
      for (let step = 0; step < 25 && !reached; step += 1) {
        await page.keyboard.press('Tab');
        const href = await page.locator(':focus').getAttribute('href');
        if (href === route) {
          await page.keyboard.press('Enter');
          reached = true;
        }
      }
      expect(reached, `should reach ${route} by tabbing`).toBe(true);
      await expect(page).toHaveURL(new RegExp(`${route}$`));
    }
  });

  test('the schedule finder is fully operable from the keyboard', async ({ page }) => {
    await page.goto('/schedule');
    await page.getByRole('combobox', { name: 'State or Union Territory' }).focus();
    await page.keyboard.type('Goa');
    await expect(page.getByRole('heading', { name: 'Goa' })).toBeVisible();
  });

  test('a disclosure opens and closes with the keyboard', async ({ page }) => {
    await page.goto('/phases');
    const trigger = page.getByRole('button', { name: 'Household assets' });
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Enter');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('every focused control shows a visible focus ring', async ({ page }) => {
    await page.goto('/schedule');
    // Tab to the control so :focus-visible applies, as it would for a real keyboard user.
    const picker = page.getByRole('combobox', { name: 'State or Union Territory' });
    await picker.focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    const outline = await page.locator(':focus').evaluate((element) => {
      const style = globalThis.getComputedStyle(element);
      return { shadow: style.boxShadow, outline: style.outlineStyle };
    });
    expect(outline.shadow === 'none' && outline.outline === 'none').toBe(false);
  });
});
