import { expect, test } from '@playwright/test';

/** REQ-4: Data privacy and misinformation. */
test.describe('REQ-4 privacy and rumours', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/trust');
  });

  test('explains the confidentiality guarantee with its citation', async ({ page }) => {
    await expect(page.getByText(/not open to inspection/)).toBeVisible();
    await expect(page.getByText('Census Act, 1948, section 15').first()).toBeVisible();
  });

  test('lists what the census never asks for', async ({ page }) => {
    await expect(page.getByText(/A bank account number, an IFSC code/)).toBeVisible();
    await expect(page.getByText(/A one-time password, PIN, or any password/)).toBeVisible();
  });

  test('tells the reader how to verify an enumerator', async ({ page }) => {
    await expect(page.getByText('Ask to see the census identity card')).toBeVisible();
    await expect(page.getByText(/Refuse any request for money, an OTP/)).toBeVisible();
  });

  test('classifies a scam message and offers a shareable rebuttal', async ({ page }) => {
    await page.route('**/api/claim-check', async (route) => {
      await route.fulfill({
        json: {
          verdict: 'FALSE',
          reason: 'No census enumerator asks for a one-time password.',
          rebuttal: 'This is a scam. The census never asks for an OTP.',
          groundedIn: ['Household assets'],
        },
      });
    });

    await page.getByRole('textbox', { name: 'Check a claim' }).fill('They asked me for an OTP.');
    await page.getByRole('button', { name: 'Check this claim' }).click();

    await expect(page.getByText('False', { exact: true })).toBeVisible();
    await expect(page.getByRole('figure')).toContainText('This is a scam');
    await expect(page.getByRole('figure')).toContainText('censusindia.gov.in');
  });

  test('uses NOT_YET_NOTIFIED for an unnotified detail', async ({ page }) => {
    await page.route('**/api/claim-check', async (route) => {
      await route.fulfill({
        json: {
          verdict: 'NOT_YET_NOTIFIED',
          reason: 'The Phase II wording has not been notified.',
          rebuttal: 'Nobody can quote the Phase II questions yet.',
          groundedIn: ['Phase II questions: NOT YET NOTIFIED'],
        },
      });
    });

    await page
      .getByRole('textbox', { name: 'Check a claim' })
      .fill('Caste question asks for a certificate.');
    await page.getByRole('button', { name: 'Check this claim' }).click();
    await expect(page.getByText('Not yet notified', { exact: true }).first()).toBeVisible();
  });
});
