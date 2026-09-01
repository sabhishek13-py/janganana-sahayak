import { expect, test } from '@playwright/test';

/** REQ-3: Guide users through self-enumeration. */
test.describe('REQ-3 practising self-enumeration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/walkthrough');
  });

  test('rehearses all 33 questions without submitting anything', async ({ page }) => {
    await expect(page.getByText('Progress: 0 / 33')).toBeVisible();
    await page.getByRole('textbox', { name: /Building number/ }).fill('12A');
    await expect(page.getByText('Progress: 1 / 33')).toBeVisible();
    await expect(page.locator('form[method="post"]')).toHaveCount(0);
  });

  test('stores nothing in the browser', async ({ page }) => {
    await page.getByRole('textbox', { name: /Building number/ }).fill('12A');
    const stored = await page.evaluate(() => {
      const dump = (storage: Storage): string => {
        const parts: string[] = [];
        for (let index = 0; index < storage.length; index += 1) {
          const key = storage.key(index);
          if (key !== null) parts.push(`${key}=${storage.getItem(key) ?? ''}`);
        }
        return parts.join('&');
      };
      return {
        local: dump(globalThis.localStorage),
        session: dump(globalThis.sessionStorage),
        cookie: document.cookie,
      };
    });

    expect(stored.local).not.toContain('12A');
    expect(stored.session).not.toContain('12A');
    expect(stored.cookie).not.toContain('12A');
  });

  test('clears practice answers on request', async ({ page }) => {
    await page.getByRole('textbox', { name: /Building number/ }).fill('12A');
    await page.getByRole('button', { name: 'Clear my practice answers' }).click();
    await expect(page.getByRole('textbox', { name: /Building number/ })).toHaveValue('');
    await expect(page.getByText('Practice answers cleared')).toBeVisible();
  });

  test('answers a grounded question from the dataset', async ({ page }) => {
    await page.route('**/api/ask', async (route) => {
      await route.fulfill({
        json: {
          answer: 'Self-enumeration opens fifteen days before houselisting.',
          notYetNotified: false,
          groundedIn: ['Self-enumeration: 15 days'],
        },
      });
    });

    await page.getByRole('textbox', { name: 'Ask about the census' }).fill('When does it open?');
    await page.getByRole('button', { name: 'Ask', exact: true }).click();
    await expect(page.getByText(/opens fifteen days before houselisting/)).toBeVisible();
  });

  test('says "not yet notified" rather than inventing Phase II questions', async ({ page }) => {
    await page.route('**/api/ask', async (route) => {
      await route.fulfill({
        json: {
          answer: 'The Phase II questions have not been notified yet.',
          notYetNotified: true,
          groundedIn: ['Phase II questions: NOT YET NOTIFIED'],
        },
      });
    });

    await page.getByRole('textbox', { name: 'Ask about the census' }).fill('Phase II questions?');
    await page.getByRole('button', { name: 'Ask', exact: true }).click();
    await expect(page.getByText(/have not been notified yet/)).toBeVisible();
  });
});
