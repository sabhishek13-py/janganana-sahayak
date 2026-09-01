import { expect, test } from '@playwright/test';

/** REQ-2: State-wise self-enumeration and survey dates. */
test.describe('REQ-2 finding your dates', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/schedule');
  });

  test('lists all 36 States and Union Territories in the picker', async ({ page }) => {
    const options = page.locator('#territory option');
    await expect(options).toHaveCount(37);
  });

  test('shows both windows and a countdown for a notified territory', async ({ page }) => {
    await page.selectOption('#territory', 'GA');
    await expect(page.getByRole('heading', { name: 'Goa' })).toBeVisible();
    await expect(page.getByText('1 April 2026 to 15 April 2026').first()).toBeVisible();
    await expect(page.getByText('16 April 2026 to 15 May 2026').first()).toBeVisible();
    await expect(page.getByRole('status').first()).toBeVisible();
  });

  test('says a territory is awaiting notification instead of inventing dates', async ({ page }) => {
    await page.selectOption('#territory', 'BR');
    await expect(page.getByText('Awaiting State notification').first()).toBeVisible();
  });

  test('splits the timetable for a partially snow-bound territory', async ({ page }) => {
    await page.selectOption('#territory', 'JK');
    await expect(page.getByText('Snow-bound, non-synchronous areas:')).toBeVisible();
    await expect(page.getByText('Rest of the territory:')).toBeVisible();
  });

  test('offers a calendar export for a notified territory', async ({ page }) => {
    await page.selectOption('#territory', 'KA');
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Add reminders to my calendar' }).click();
    expect((await download).suggestedFilename()).toBe('census-2027-ka.ics');
  });

  test('filters the national table and pairs the map with it', async ({ page }) => {
    await expect(page.getByText('36 of 36')).toBeVisible();
    await page.getByLabel('Search').fill('kerala');
    await expect(page.getByText('1 of 36')).toBeVisible();
    await expect(page.getByRole('img', { name: 'Notification status across India' })).toBeVisible();
  });
});
