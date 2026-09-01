import { expect, test } from '@playwright/test';

/** REQ-6: Multiple Indian languages. */
const LOCALES = ['hi', 'bn', 'mr', 'te', 'ta', 'gu', 'kn', 'ml', 'or', 'pa', 'as', 'ur'] as const;

test.describe('REQ-6 languages', () => {
  test('offers thirteen languages in their own scripts', async ({ page }) => {
    await page.goto('/');
    const options = page.locator('#language-switcher option');
    await expect(options).toHaveCount(13);
    await expect(page.locator('#language-switcher option', { hasText: 'हिन्दी' })).toHaveCount(1);
    await expect(page.locator('#language-switcher option', { hasText: 'தமிழ்' })).toHaveCount(1);
  });

  test('switching language keeps you on the same page and updates lang', async ({ page }) => {
    await page.goto('/schedule');
    await page.selectOption('#language-switcher', 'hi');
    await expect(page).toHaveURL(/\/hi\/schedule/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'hi');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('जनगणना');
  });

  test('renders Urdu right to left', async ({ page }) => {
    await page.goto('/ur/trust');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ur');
  });

  for (const locale of LOCALES) {
    test(`serves a translated home page for ${locale}`, async ({ page }) => {
      await page.goto(`/${locale}`);
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      const heading = page.getByRole('heading', { level: 1 });
      await expect(heading).toBeVisible();
      // The heading must not still be the English source string.
      await expect(heading).not.toHaveText('Census 2027, explained simply');
    });
  }

  test('remembers the chosen language across a navigation', async ({ page }) => {
    await page.goto('/');
    await page.selectOption('#language-switcher', 'ta');
    await expect(page).toHaveURL(/\/ta$/);
    await page
      .getByRole('link', { name: /தமிழ்|கணக்கெடுப்பு/ })
      .first()
      .click();
    await expect(page).toHaveURL(/\/ta\//);
  });
});
