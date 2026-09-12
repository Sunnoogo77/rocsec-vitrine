import { expect, test, type Locator, type Page } from '@playwright/test';

async function catalogue(page: Page, count: number) {
  const results = Array.from({ length: count }, (_, index) => ({
    id: `sermon-${index}`, slug: `sermon-${index}`, titre: `Prédication ${index + 1}`,
    titre_em: '', description_courte: '', youtube_url: '', serie: null, numero_dans_serie: null,
    date_culte: `2026-09-${String(1 + index % 28).padStart(2, '0')}T09:00:00Z`,
    type_culte: { code: index % 2 ? 'culte-mercredi' : 'culte-dimanche', libelle_fr: 'Culte' },
    predicateur: { id: `person-${index}`, libelle: `Prédicateur ${index + 1}` },
    duree_minutes: 60, thumbnail_url: '', audio_url: '', passages: [], citations_branham: [], plan: [],
    publie_le: '2026-09-12T10:00:00Z',
  }));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/api/v1/**', (route) => route.fulfill({ json: {
    count: route.request().url().includes('/sermons/') ? count : 0,
    results: route.request().url().includes('/sermons/') ? results : [], next: null, previous: null,
  } }));
  await page.goto('/eglise/cultes');
  await expect(page.getByRole('button', { name: /^Ouvrir la prédication :/ })).toHaveCount(count);
}

async function bounds(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) throw new Error('Élément attendu à l’écran absent.');
  return box;
}

async function scrollTo(page: Page, top: number) {
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), top);
  // The header/subnav and the sidebar derive their direction in animation frames.
  // Give each scroll its own frame so a following upward scroll is not coalesced.
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
}

async function centered(page: Page, sidebar: Locator, offset: number) {
  await expect.poll(async () => {
    const box = await bounds(sidebar);
    return Math.abs(box.y + box.height / 2 - ((page.viewportSize()?.height ?? 0) + offset) / 2);
  }).toBeLessThan(3);
}

async function centeredBelowNavigation(page: Page, sidebar: Locator) {
  await expect.poll(async () => {
    const offset = await page.evaluate(() => Math.max(0,
      document.querySelector('header[role="banner"]')?.getBoundingClientRect().bottom ?? 0,
      document.querySelector('[data-sticky-subnav]')?.getBoundingClientRect().bottom ?? 0));
    const box = await bounds(sidebar);
    return Math.abs(box.y + box.height / 2 - ((page.viewportSize()?.height ?? 0) + offset) / 2);
  }).toBeLessThan(3);
}

for (const count of [1, 60]) {
  test(`les filtres suivent le catalogue et quittent le pied de page (${count} prédications)`, async ({ page }, info) => {
    await catalogue(page, count);
    const sidebar = page.getByRole('complementary', { name: 'Filtres', exact: true });
    const board = page.getByRole('region', { name: 'Catalogue des prédications' });
    const footer = page.getByRole('contentinfo');
    if (info.project.name === 'mobile') {
      await expect(sidebar).not.toBeVisible();
      await page.getByRole('button', { name: 'Ouvrir les filtres' }).click();
      const sheet = page.getByRole('dialog', { name: 'Filtres', exact: true });
      await expect(sheet).toBeVisible();
      await sheet.getByRole('checkbox', { name: /^2026/ }).check();
      await sheet.getByRole('button', { name: 'Voir tout', exact: true }).click();
      await expect(sheet).not.toBeVisible();
      await expect(page.getByRole('button', { name: /^Ouvrir la prédication :/ })).toHaveCount(count);
      await page.getByRole('button', { name: 'Ouvrir les filtres' }).click();
      await page.getByRole('dialog').getByRole('button', { name: 'Réinitialiser', exact: true }).click();
      await page.getByRole('button', { name: 'Fermer les filtres' }).click();
      await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
    } else {
      const initial = await bounds(sidebar);
      const hero = await bounds(page.locator('[data-page-hero]'));
      expect(initial.y).toBeGreaterThan(hero.y + hero.height);
      await scrollTo(page, 150);
      await expect.poll(async () => Math.abs((await bounds(sidebar)).y - (initial.y - 150))).toBeLessThan(3);
      if (count > 1) {
        const boardDocumentTop = (await bounds(board)).y + await page.evaluate(() => window.scrollY);
        await scrollTo(page, boardDocumentTop + 400);
        await centered(page, sidebar, 0);
        await scrollTo(page, boardDocumentTop + 800);
        await centered(page, sidebar, 0);
        await scrollTo(page, boardDocumentTop + 700);
        const offset = await page.evaluate(() =>
          (document.querySelector('header[role="banner"]')?.getBoundingClientRect().height ?? 0) +
          (document.querySelector('[data-sticky-subnav]')?.getBoundingClientRect().height ?? 0));
        await centered(page, sidebar, offset);
        await page.screenshot({ path: `test-results/cultes-sidebar-sticky-${info.project.name}.png` });
      } else {
        // A single result must not be padded to a full viewport by the filter column.
        expect((await bounds(sidebar)).height).toBeLessThan((page.viewportSize()?.height ?? 0) - 100);
      }
      const boardBottom = (await bounds(board)).y + (await bounds(board)).height + await page.evaluate(() => window.scrollY);
      await scrollTo(page, boardBottom - 140);
      await expect.poll(async () => {
        const side = await bounds(sidebar);
        return side.y + side.height - (await bounds(footer)).y;
      }).toBeLessThanOrEqual(0);
      const side = await bounds(sidebar);
      expect(side.y).toBeLessThan(0);
      expect(side.y + side.height).toBeLessThanOrEqual((await bounds(footer)).y);
    }
    await scrollTo(page, await page.evaluate(() => document.documentElement.scrollHeight));
    await expect(footer).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/cultes-sidebar-footer-${count}-${info.project.name}.png` });
  });
}

test('les filtres restent accessibles sur un écran bas et en mode réduit', async ({ page }, info) => {
  test.skip(info.project.name === 'mobile', 'Le mobile conserve sa feuille de filtres, couverte séparément.');
  await page.setViewportSize({ width: 1100, height: 520 });
  await catalogue(page, 60);
  const sidebar = page.getByRole('complementary', { name: 'Filtres', exact: true });
  const board = page.getByRole('region', { name: 'Catalogue des prédications' });
  await scrollTo(page, (await bounds(board)).y + 400);
  await sidebar.locator('summary').filter({ hasText: 'Prédicateur' }).click();
  await centered(page, sidebar, 0);
  const expanded = await bounds(sidebar);
  expect(expanded.height).toBeLessThanOrEqual(488);
  await sidebar.getByRole('checkbox', { name: /^Prédicateur 9\b/ }).scrollIntoViewIfNeeded();
  await expect(sidebar.getByRole('checkbox', { name: /^Prédicateur 9\b/ })).toBeInViewport();
  await expect(sidebar.getByRole('button', { name: 'Réinitialiser les filtres' })).toBeInViewport();
  await sidebar.getByRole('button', { name: 'Réduire les filtres' }).click();
  await centeredBelowNavigation(page, sidebar);
  expect((await bounds(sidebar)).height).toBeLessThan(expanded.height);
  await sidebar.getByRole('button', { name: 'Déplier les filtres' }).click();
  await centeredBelowNavigation(page, sidebar);
  await expect.poll(async () => (await bounds(sidebar)).width).toBe(230);
  await page.screenshot({ path: 'test-results/cultes-sidebar-small-screen.png' });
});
