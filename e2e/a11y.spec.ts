import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const ROUTES = ['/', '/phases', '/schedule', '/walkthrough', '/trust', '/insights'] as const;
const WCAG_AA = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] as const;

/** WCAG 2.2 AA, asserted on every route. Zero violations is the bar. */
test.describe('accessibility', () => {
  for (const route of ROUTES) {
    test(`${route} has no axe violations`, async ({ page }) => {
      await page.goto(route);
      const results = await new AxeBuilder({ page }).withTags([...WCAG_AA]).analyze();
      expect(results.violations).toEqual([]);
    });
  }

  test('a right-to-left locale has no axe violations either', async ({ page }) => {
    await page.goto('/ur/trust');
    const results = await new AxeBuilder({ page }).withTags([...WCAG_AA]).analyze();
    expect(results.violations).toEqual([]);
  });

  for (const route of ROUTES) {
    test(`${route} has exactly one h1 and no skipped heading levels`, async ({ page }) => {
      await page.goto(route);
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);

      const levels = await page
        .locator('h1, h2, h3, h4, h5, h6')
        .evaluateAll((nodes) => nodes.map((node) => Number(node.tagName.slice(1))));
      for (let index = 1; index < levels.length; index += 1) {
        const previous = levels[index - 1] ?? 1;
        const current = levels[index] ?? 1;
        expect(current - previous, `heading order at index ${String(index)}`).toBeLessThanOrEqual(
          1,
        );
      }
    });
  }

  test('no route reuses a DOM id, which would break label and aria references', async ({
    page,
  }) => {
    for (const route of ROUTES) {
      await page.goto(route);
      const duplicates = await page.locator('[id]').evaluateAll((nodes) => {
        const seen = new Map<string, number>();
        for (const node of nodes) {
          seen.set(node.id, (seen.get(node.id) ?? 0) + 1);
        }
        return [...seen.entries()].filter(([, count]) => count > 1).map(([id]) => id);
      });
      expect(duplicates, `duplicate ids on ${route}`).toEqual([]);
    }
  });

  test('every form control has a real label, not a placeholder alone', async ({ page }) => {
    for (const route of ROUTES) {
      await page.goto(route);
      const unlabelled = await page
        .locator('input:not([type=hidden]), select, textarea')
        .evaluateAll((nodes) =>
          nodes
            .filter((node) => {
              const id = node.getAttribute('id');
              const hasLabel = id !== null && document.querySelector(`label[for="${id}"]`) !== null;
              const hasAria =
                node.getAttribute('aria-label') !== null ||
                node.getAttribute('aria-labelledby') !== null;
              return !hasLabel && !hasAria;
            })
            .map((node) => node.outerHTML.slice(0, 120)),
        );
      expect(unlabelled, `unlabelled controls on ${route}`).toEqual([]);
    }
  });

  test('every page has one main landmark and a skip link into it', async ({ page }) => {
    for (const route of ROUTES) {
      await page.goto(route);
      await expect(page.getByRole('main')).toHaveCount(1);
      await expect(page.locator('a.skip-link')).toHaveAttribute('href', '#main');
    }
  });
});
