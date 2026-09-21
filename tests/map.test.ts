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

test('user can zoom the map and restore its position from a shared URL', async ({ page }) => {
  await page.route('https://api.mapbox.com/**', (route) => route.abort());
  await page.goto('/map?center=52.5114,13.3842&zoom=11');

  const map = page.getByRole('region', { name: 'Movement map' });
  await map.focus();
  await page.keyboard.press('Equal');

  await expect.poll(() => new URL(page.url()).searchParams.get('zoom')).toBe('12');

  await page.reload();
  await map.focus();
  await page.keyboard.press('Equal');

  await expect.poll(() => new URL(page.url()).searchParams.get('zoom')).toBe('13');
});

test('user can adjust the time range and restore it from a shared URL', async ({ page }) => {
  await page.route('https://api.mapbox.com/**', (route) => route.abort());
  await page.goto('/map');

  const startDate = page.getByRole('slider', { name: 'Start date' });
  await expect(startDate).toHaveAttribute('aria-valuenow', '1448928000');
  await startDate.focus();
  await page.keyboard.press('ArrowRight');

  await expect(startDate).toHaveAttribute('aria-valuenow', '1449014400');
  await expect(page.getByText('2. Dec ‘15')).toBeVisible();
  await expect.poll(() => new URL(page.url()).searchParams.get('timeSpan')).toBe('1449014400-1456358400');

  await page.reload();

  await expect(page.getByRole('slider', { name: 'Start date' })).toHaveAttribute('aria-valuenow', '1449014400');
  await expect(page.getByText('2. Dec ‘15')).toBeVisible();
});

test('user can explore a place with the keyboard and see it respond to map zoom', async ({ page }) => {
  await page.route('https://api.mapbox.com/**', (route) => route.abort());
  await page.goto('/map?center=52.494601,13.364713&zoom=16');

  const place = page.getByRole('button', { name: 'Place Anna' });
  await expect(place).toHaveAccessibleDescription(
    /^Visited 43 times with 25 days total stay\. Contains 12 nearby places:/
  );

  const radiusBeforeZoom = Number(await place.getAttribute('data-visual-radius'));
  await place.focus();
  await page.keyboard.press('Enter');
  await expect(place).toHaveAttribute('aria-pressed', 'true');

  const map = page.getByRole('region', { name: 'Movement map' });
  await map.focus();
  await page.keyboard.press('Equal');

  await expect.poll(() => new URL(page.url()).searchParams.get('zoom')).toBe('17');
  await expect
    .poll(async () => Number(await place.getAttribute('data-visual-radius')))
    .toBeGreaterThan(radiusBeforeZoom);
});

test('user can explore a connection with the keyboard and see it respond to map zoom', async ({ page }) => {
  await page.route('https://api.mapbox.com/**', (route) => route.abort());
  await page.goto('/map?center=52.494601,13.364713&zoom=16');

  const connection = page.getByRole('button', {
    name: 'Connection between Bahnhof Berlin Zoologischer Garten and Friedrich-Engels-Straße, Potsdam',
  });
  await expect(connection).toHaveAccessibleDescription(
    '1 trip with 27 km average distance and 21 minutes average travel time.'
  );

  const strokeWidthBeforeZoom = Number(await connection.getAttribute('data-visual-stroke-width'));
  await connection.focus();
  await page.keyboard.press('Enter');
  await expect(connection).toHaveAttribute('aria-pressed', 'true');

  const map = page.getByRole('region', { name: 'Movement map' });
  await map.focus();
  await page.keyboard.press('Equal');

  await expect.poll(() => new URL(page.url()).searchParams.get('zoom')).toBe('17');
  await expect
    .poll(async () => Number(await connection.getAttribute('data-visual-stroke-width')))
    .toBeGreaterThan(strokeWidthBeforeZoom);
});

test('zooming reveals a place contained in another place and its connection', async ({ page }) => {
  await page.route('https://api.mapbox.com/**', (route) => route.abort());
  await page.goto('/map?center=52.494601,13.364713&zoom=10');

  const map = page.getByRole('region', { name: 'Movement map' });
  const anna = page.getByRole('button', { name: 'Place Anna' });
  const zoologischerGarten = page.getByRole('button', {
    name: 'Place Bahnhof Berlin Zoologischer Garten',
  });
  const zoologischerGartenConnection = page.getByRole('button', {
    name: 'Connection between Bahnhof Berlin Zoologischer Garten and Friedrich-Engels-Straße, Potsdam',
  });

  await expect(anna).toHaveAccessibleDescription(/Contains \d+ nearby places: .*Bahnhof Berlin Zoologischer Garten/);
  await expect(zoologischerGarten).toHaveCount(0);
  await expect(zoologischerGartenConnection).toHaveCount(0);

  for (let zoom = 11; zoom <= 16; zoom += 1) {
    await map.focus();
    await page.keyboard.press('Equal');
    await expect.poll(() => new URL(page.url()).searchParams.get('zoom')).toBe(String(zoom));
  }

  await expect(zoologischerGarten).toBeVisible();
  await expect(zoologischerGartenConnection).toBeVisible();
  await expect(anna).not.toHaveAccessibleDescription(/Bahnhof Berlin Zoologischer Garten/);

  for (let zoom = 15; zoom >= 10; zoom -= 1) {
    await map.focus();
    await page.keyboard.press('Minus');
    await expect.poll(() => new URL(page.url()).searchParams.get('zoom')).toBe(String(zoom));
  }

  await expect(zoologischerGarten).toHaveCount(0);
  await expect(zoologischerGartenConnection).toHaveCount(0);
  await expect(anna).toHaveAccessibleDescription(/Bahnhof Berlin Zoologischer Garten/);
});
