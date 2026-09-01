import { expect, test } from '@playwright/test';

/** REQ-5: Visualise census data meaningfully. */
test.describe('REQ-5 the census in numbers', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/insights');
  });

  test('shows every chart with a text summary beside it', async ({ page }) => {
    await expect(page.getByRole('figure')).toHaveCount(5);
    await expect(page.getByText(/Kerala.*was highest at 94/)).toBeVisible();
  });

  test('gives every chart an accessible data table', async ({ page }) => {
    const disclosures = page.getByText('Show data table');
    await expect(disclosures).toHaveCount(5);
    await disclosures.first().click();
    await expect(page.getByRole('rowheader', { name: 'Kerala' }).first()).toBeVisible();
  });

  test('labels 2027 figures as estimates everywhere they appear', async ({ page }) => {
    await expect(page.getByText('Projection, not an official figure').first()).toBeVisible();
    await expect(page.getByText(/Estimated by this app, not by the Census/)).toBeVisible();
  });

  test('answers a natural-language question and names the chart', async ({ page }) => {
    await page.route('**/api/insights-query', async (route) => {
      await route.fulfill({
        json: {
          answer: 'Kerala had the highest literacy rate in 2011, at 94.0 per cent.',
          chartId: 'literacy',
          isProjection: false,
          groundedIn: ['Kerala: literacy 94%'],
        },
      });
    });

    await page
      .getByRole('textbox', { name: 'Ask a question about this data' })
      .fill('Which State was most literate?');
    await page.getByRole('button', { name: 'Answer' }).click();
    await expect(page.getByText(/Kerala had the highest literacy rate/)).toBeVisible();
    await expect(page.getByText(/Literacy rate by State, 2011/).first()).toBeVisible();
  });
});
