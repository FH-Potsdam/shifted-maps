import { expect, test } from '@playwright/test';

test('user can navigate from the landing page to the demo', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1, name: 'Shifted Maps' })).toBeVisible();
  await page.getByRole('link', { name: 'Explore the Demo' }).click();

  await expect(page).toHaveURL(/\/map(?:\?.*)?$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Shifted Maps' })).toBeVisible();
});
