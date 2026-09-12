import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { youtubeId } from '../src/utils/youtube';

const videoId = 'mzs_C29V9bA';
const path = '/eglise/cultes/watch/message-a-regarder';
const policy = readFileSync('render.yaml', 'utf8').match(/name: Content-Security-Policy\s+value: "([^"]+)"/)![1];
const widgetUrl = 'https://s.ytimg.com/yts/jsbin/www-widgetapi-test.js';
const mockAPI = `
window.__players = [];
window.__skipped = 0;
window.addEventListener('message', event => {
  if (event.origin === 'https://www.youtube-nocookie.com' && event.data === 'mock-skip') window.__skipped++;
});
window.YT = { Player: class {
  constructor(frame, options) {
    this.frame = frame; this.events = options.events; this.time = 0; this.state = -1;
    window.__players.push(this);
    // Real YouTube readiness arrives from the iframe, not from its constructor.
    this.loaded = () => frame.contentWindow?.postMessage('mock-ready-request', 'https://www.youtube-nocookie.com');
    this.message = event => {
      if (this.destroyed || this.ready || event.source !== frame.contentWindow ||
          event.origin !== 'https://www.youtube-nocookie.com' || event.data !== 'mock-frame-ready') return;
      this.ready = true;
      this.events.onReady({ target: this });
    };
    window.addEventListener('message', this.message);
    frame.addEventListener('load', this.loaded);
    this.loaded();
  }
  playVideo() { this.state = 1; this.events.onStateChange({ target: this, data: 1 }); }
  pauseVideo() { this.state = 2; this.events.onStateChange({ target: this, data: 2 }); }
  getPlayerState() { return this.state; }
  getCurrentTime() { return this.time; }
  destroy() {
    this.destroyed = true;
    window.removeEventListener('message', this.message);
    this.frame.removeEventListener('load', this.loaded);
    this.frame.remove();
  }
} };
window.onYouTubeIframeAPIReady?.();
`;
const frameHTML = `<!doctype html><html><head><meta charset="UTF-8"><style>
html,body{height:100%;margin:0;background:#161616;color:white;font:16px sans-serif}
button{position:absolute;right:16px;bottom:16px;padding:12px 20px}
</style></head><body><p>Lecteur de test</p>
<button onpointerenter="this.dataset.pointerInside='true'" onpointerleave="delete this.dataset.pointerInside" onclick="parent.postMessage('mock-skip','*');this.textContent='Annonce ignorée'">Ignorer</button>
<script>
function ready() {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    document.querySelector('button').dataset.ready = 'true';
    parent.postMessage('mock-frame-ready', '*');
  }));
}
window.addEventListener('load', ready);
window.addEventListener('message', event => {
  if (event.source === parent && event.data === 'mock-ready-request') ready();
});
</script></body></html>`;

async function prepare(page: Page, url = `https://www.youtube.com/watch?v=${videoId}`, legacy = false) {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('https://www.youtube-nocookie.com/embed/**', route => route.fulfill({ contentType: 'text/html', body: frameHTML }));
  await page.route('https://www.youtube.com/iframe_api', route => route.fulfill({ contentType: 'application/javascript', body:
    `const script=document.createElement('script');script.src='${widgetUrl}';document.head.appendChild(script);` }));
  await page.route(widgetUrl, route => route.fulfill({ contentType: 'application/javascript', body: mockAPI }));
  await page.route('**/api/v1/**', route => {
    const results = Array.from({ length: 12 }, (_, i) => ({
      id: `id-${i}`, slug: i ? `autre-message-${i}` : 'message-a-regarder', titre: i ? `Autre message ${i}` : 'Le message à regarder',
      titre_em: '', description_courte: '', youtube_url: url, serie: null, numero_dans_serie: null,
      date_culte: '2026-09-06T09:00:00Z', type_culte: { code: 'culte-dimanche', libelle_fr: 'Dimanche' },
      predicateur: { id: 'person', libelle: 'Prédicateur' }, duree_minutes: 60, thumbnail_url: '', audio_url: '',
      passages: [], citations_branham: [], plan: [], publie_le: '2026-09-06T10:00:00Z',
    }));
    return route.fulfill({ json: { count: results.length, results, next: null, previous: null } });
  });
  if (legacy) await page.route(`**${path}`, async route => {
    const response = await route.fetch();
    await route.fulfill({ response, headers: { ...response.headers(), 'content-security-policy': policy.replace(' https://www.youtube.com https://s.ytimg.com', '') } });
  });
  const response = await page.goto(path);
  expect(response?.headers()['content-security-policy']).toBe(legacy ? policy.replace(' https://www.youtube.com https://s.ytimg.com', '') : policy);
  await expect(page.getByRole('heading', { name: 'Le message à regarder', exact: true })).toBeVisible();
  return errors;
}

async function nativeControlsAccessible(page: Page) {
  const iframe = page.locator('iframe[title="Lecteur vidéo YouTube"]');
  await expect(iframe).toBeVisible();
  expect(await iframe.evaluate(frame => {
    const box = frame.getBoundingClientRect();
    return [[.1,.1],[.5,.5],[.9,.9]].every(([x,y]) => document.elementFromPoint(box.x+box.width*x,box.y+box.height*y) === frame);
  })).toBe(true);
  const skip = page.frameLocator('iframe[title="Lecteur vidéo YouTube"]').getByRole('button', { name: 'Ignorer', exact: true });
  await expect(skip).toHaveAttribute('data-ready', 'true');
  // Chromium can report an OOPIF's DOM as ready before its first surface has
  // reached the compositor. Confirm real pointer delivery before the one click;
  // an overlay would prevent this event as well as the click being tested.
  await expect(async () => {
    await skip.hover();
    await expect(skip).toHaveAttribute('data-pointer-inside', 'true', { timeout: 200 });
  }).toPass({ timeout: 3000, intervals: [100, 200] });
  await skip.click();
  await expect(page.frameLocator('iframe[title="Lecteur vidéo YouTube"]').getByRole('button', { name: 'Annonce ignorée' })).toBeVisible();
}

test('le lecteur fonctionne sous la CSP de production et laisse cliquer les commandes YouTube', async ({ page }, info) => {
  const errors = await prepare(page);
  await expect(page.locator('[data-player-status]')).toHaveAttribute('data-player-status', 'ready');
  const iframe = page.locator('iframe[title="Lecteur vidéo YouTube"]');
  const src = new URL((await iframe.getAttribute('src'))!);
  expect(src.hostname).toBe('www.youtube-nocookie.com');
  expect(src.searchParams.get('controls')).toBe('1');
  expect(src.searchParams.get('fs')).toBe('1');
  expect(src.searchParams.get('origin')).toBe('http://127.0.0.1:4173');
  await expect(iframe).toHaveAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
  await nativeControlsAccessible(page);
  await expect.poll(() => page.evaluate(() => (window as unknown as { __skipped: number }).__skipped)).toBe(1);
  expect(errors).toEqual([]);
  await page.screenshot({ path: `test-results/youtube-native-${info.project.name}.png` });
});

test('la vidéo native reste accessible même avec l’ancienne CSP qui bloque le script', async ({ page }) => {
  const errors = await prepare(page, undefined, true);
  await expect(page.locator('[data-player-status]')).toHaveAttribute('data-player-status', 'limited');
  await nativeControlsAccessible(page);
  await expect(page.getByRole('link', { name: 'Ouvrir sur YouTube' })).toHaveAttribute('href', `https://www.youtube.com/watch?v=${videoId}`);
  expect(errors).toEqual([]);
});

test('une panne du script propose de réessayer et peut être réparée sans recharger la page', async ({ page }) => {
  await prepare(page);
  // New navigation resets the shared loader while keeping the route fixtures.
  await page.route('https://www.youtube.com/iframe_api', route => route.abort());
  await page.reload();
  await expect(page.locator('[data-player-status]')).toHaveAttribute('data-player-status', 'limited');
  await nativeControlsAccessible(page);
  await page.unroute('https://www.youtube.com/iframe_api');
  await page.route('https://www.youtube.com/iframe_api', route => route.fulfill({ contentType: 'application/javascript', body: mockAPI }));
  await page.getByRole('button', { name: 'Réessayer', exact: true }).click();
  await expect(page.locator('[data-player-status]')).toHaveAttribute('data-player-status', 'ready');
  await expect(page.locator('iframe[title="Lecteur vidéo YouTube"]')).toHaveCount(1);
});

test('une vidéo non intégrable affiche la raison et un lien direct', async ({ page }) => {
  await prepare(page);
  await expect(page.locator('[data-player-status]')).toHaveAttribute('data-player-status', 'ready');
  await page.evaluate(() => {
    const player = (window as unknown as { __players: { events: { onError: (event: { data: number }) => void } }[] }).__players[0];
    player.events.onError({ data: 101 });
  });
  await expect(page.getByText('Cette vidéo ne peut pas être lue sur ce site.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ouvrir sur YouTube' })).toHaveAttribute('target', '_blank');
  await nativeControlsAccessible(page);
});

test('le mini-lecteur conserve la même iframe et sa barre ne recouvre pas les commandes', async ({ page }) => {
  await prepare(page);
  await expect(page.locator('[data-player-status]')).toHaveAttribute('data-player-status', 'ready');
  const iframe = page.locator('iframe[title="Lecteur vidéo YouTube"]');
  await iframe.evaluate(node => node.setAttribute('data-original-frame', 'yes'));
  await page.getByRole('searchbox', { name: 'Rechercher une prédication' }).fill('Autre');
  const toolbar = page.getByRole('toolbar', { name: 'Mini-lecteur — glisser pour déplacer' });
  await expect(toolbar).toBeVisible();
  await expect(iframe).toHaveAttribute('data-original-frame', 'yes');
  await expect.poll(async () => (await iframe.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(199);
  const frameBox = (await iframe.boundingBox())!;
  const barBox = (await toolbar.boundingBox())!;
  expect(frameBox.height).toBeGreaterThanOrEqual(199);
  expect(barBox.y + barBox.height).toBeLessThanOrEqual(frameBox.y + 1);
  await nativeControlsAccessible(page);
  await page.getByRole('button', { name: 'Réafficher le lecteur en place' }).click();
  await expect(toolbar).not.toBeVisible();
  await expect(iframe).toHaveAttribute('data-original-frame', 'yes');
});

test('un lien live YouTube et un changement de prédication chargent la bonne vidéo', async ({ page }) => {
  await prepare(page, `https://www.youtube.com/live/${videoId}?si=shared`);
  await expect(page.locator('[data-player-status]')).toHaveAttribute('data-player-status', 'ready');
  await expect(page.locator('iframe[title="Lecteur vidéo YouTube"]')).toHaveAttribute('src', new RegExp(`/embed/${videoId}\\?`));
  await page.getByRole('button', { name: 'Lire la prédication : Autre message 1', exact: true }).click();
  await expect(page).toHaveURL(/\/watch\/autre-message-1$/);
  await expect(page.locator('iframe[title="Lecteur vidéo YouTube"]')).toHaveCount(1);
  await expect(page.locator('[data-player-status]')).toHaveAttribute('data-player-status', 'ready');
});

test('le parseur reconnaît les liens officiels sans accepter les domaines trompeurs', () => {
  for (const input of [videoId, `https://youtu.be/${videoId}?si=test`, `https://www.youtube.com/watch?feature=share&v=${videoId}`, `https://m.youtube.com/shorts/${videoId}`, `https://www.youtube.com/live/${videoId}`, `https://www.youtube-nocookie.com/embed/${videoId}`]) expect(youtubeId(input)).toBe(videoId);
  for (const input of [`https://youtube.com.evil.example/watch?v=${videoId}`, `https://evil.example/youtube.com/watch?v=${videoId}`, `https://youtube.com@evil.example/watch?v=${videoId}`, `javascript:youtube.com/watch?v=${videoId}`, `https://youtube.com/watch?v=${videoId}extra`, `https://youtu.be/${videoId}/more`, '']) expect(youtubeId(input)).toBeNull();
});
