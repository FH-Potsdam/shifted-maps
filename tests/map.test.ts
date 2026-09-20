import { expect, test } from '@playwright/test';

test('user can select a visualization view', async ({ page }) => {
  await page.route('https://api.mapbox.com/**', (route) => route.abort());
  await page.goto('/map');

  await expect(page.getByText('Places are positioned by their geospatial location.')).toBeVisible();
  await page.getByRole('button', { name: 'Travel Frequency' }).click();

  await expect(page).toHaveURL(/\/map\?view=frequency$/);
  await expect(page.getByText('Network is arranged by average distance travelled between places.')).toBeVisible();
});

test('user can restore a visualization view from a shared URL', async ({ page }) => {
  await page.route('https://api.mapbox.com/**', (route) => route.abort());
  await page.goto('/map?view=duration&timeSpan=1454275200-1454880000');

  await expect(page.getByRole('button', { name: 'Travel Time' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText('Total Duration:')).toBeVisible();
});

test('user can restore a time range from a shared URL', async ({ page }) => {
  await page.route('https://api.mapbox.com/**', (route) => route.abort());
  await page.goto('/map?timeSpan=1454284800-1454889600');

  await expect(page.getByRole('slider', { name: 'Start date' })).toHaveAttribute('aria-valuenow', '1454284800');
  await expect(page.getByRole('slider', { name: 'End date' })).toHaveAttribute('aria-valuenow', '1454889600');
});
