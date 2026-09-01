import { expect, test } from '@playwright/test';

/** REQ-1: Explain the two phases and what each collects. */
test.describe('REQ-1 the two phases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/phases');
  });

  test('shows both phases with exactly one h1', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.getByRole('heading', { name: 'Phase I (HLO)' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Phase II (PE)' })).toBeVisible();
  });

  test('says Phase I questions are notified and Phase II questions are not', async ({ page }) => {
    await expect(page.getByText('Questions notified: 33 questions.')).toBeVisible();
    await expect(page.getByText('Questions not yet notified')).toBeVisible();
  });

  test('reveals why a category is asked and what is not collected', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Household assets' });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByText(/No bank balance, no income figure/)).toBeVisible();
  });

  test('changes the guidance for each situation', async ({ page }) => {
    await expect(page.getByText(/You answer for the home you live in/)).toBeVisible();
    await page.getByRole('radio', { name: 'I have no fixed address' }).check();
    await expect(page.getByText(/counts houseless people separately/)).toBeVisible();
  });
});
