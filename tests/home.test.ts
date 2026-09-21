import { expect, test } from '@playwright/test';

test('user can navigate from the landing page to the demo', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1, name: 'Shifted Maps' })).toBeVisible();
  await page.getByRole('link', { name: 'Explore the Demo' }).click();

  await expect(page).toHaveURL(/\/map(?:\?.*)?$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Shifted Maps' })).toBeVisible();
});

test('landing page exposes its referenced public assets', async ({ page, request }) => {
  await page.goto('/');

  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    'content',
    'http://localhost:3000/images/shifted-maps-og.jpg'
  );
  await expect(page.locator('link[rel="shortcut icon"]')).toHaveAttribute('href', '/images/favicon.ico');
  await expect(page.locator('video source[type="video/mp4"]')).toHaveAttribute('src', '/videos/screencast-hd.mp4');
  await expect(page.locator('video source[type="video/webm"]')).toHaveAttribute('src', '/videos/screencast-hd.webm');

  const assetPaths = [
    '/downloads/ShiftedMaps_Paper_IEEE_2018_VISAP.pdf',
    '/downloads/ShiftedMaps_Poster_IEEE_2015.pdf',
    '/fonts/overpass-extrabold.woff2',
    '/fonts/overpass-italic.woff2',
    '/fonts/overpass-regular.woff2',
    '/images/favicon.ico',
    '/images/shifted-maps-og.jpg',
    '/videos/screencast-hd.mp4',
    '/videos/screencast-hd.webm',
  ];

  for (const assetPath of assetPaths) {
    const response = await request.head(assetPath);
    expect(response.ok(), `${assetPath} should be publicly available`).toBe(true);
  }
});
