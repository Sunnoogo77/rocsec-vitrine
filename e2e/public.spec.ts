import { test, expect } from '@playwright/test';

test('le HTML provenant de l’API ne peut pas exécuter un script', async ({ page }) => {
  await page.route('**/api/v1/**', route => {
    if (route.request().url().includes('/mot-du-pasteur/')) return route.fulfill({ json: {
      texte_html_fr: '<p>Un message vérifié</p><img src=x onerror="document.documentElement.dataset.exploited=1"><script>document.documentElement.dataset.exploited=1</script><a href="javascript:alert(1)">Texte</a>', texte_html_en: '', signature_fr: 'Pasteur', signature_en: ''
    } });
    return route.fulfill({ status: 503, json: { detail: 'Unavailable' } });
  });
  await page.goto('/');
  await expect(page.getByText('Un message vérifié')).toBeVisible();
  expect(await page.locator('html').getAttribute('data-exploited')).toBeNull();
  await expect(page.locator('a[href^="javascript:"], [onerror]')).toHaveCount(0);
});

test('une panne de l’API conserve une page utilisable', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/api/v1/**', route => route.fulfill({ status: 503, json: { detail: 'Unavailable' } }));
  await page.goto('/eglise/temoignages');
  await expect(page.getByRole('button', { name: /témoignage/i }).first()).toBeVisible();
  expect(errors).toEqual([]);
  await page.screenshot({ path: `test-results/public-${test.info().project.name}.png`, fullPage: true });
});

test('le formulaire reste fermé à l’envoi sans captcha configuré', async ({ page }) => {
  await page.route('**/api/v1/**', route => route.fulfill({ json: { count: 0, results: [], total_affiche: 0 } }));
  await page.goto('/eglise/temoignages');
  await page.getByRole('button', { name: /témoignage/i }).first().click();
  await expect(page.getByRole('button', { name: 'Envoyer le témoignage' })).toBeDisabled();
  await expect(page.getByText('Le formulaire est temporairement indisponible.')).toBeVisible();
});
