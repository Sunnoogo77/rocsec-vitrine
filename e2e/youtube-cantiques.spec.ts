import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const mainVideo = 'mzs_C29V9bA';
const otherVideo = 'aqz-KE-bpKQ';
const policy = readFileSync('render.yaml', 'utf8').match(/name: Content-Security-Policy\s+value: "([^"]+)"/)![1];
const lyrics = (line: string) => [{ type: 'couplet', label: 'Couplet 1', lines: [line] }];

// Public API shapes are deliberately distinct from the camelCase UI models.
function cantique(slug: string, title: string, line: string) {
  return {
    id: `uuid-${slug}`, slug, numero: 'S001', numero_recueil: null,
    famille: { code: 'special', libelle_fr: 'Spéciaux' }, evenement: null,
    titre: title, titre_em: '', detail_by: '', youtube_url: `https://youtu.be/${mainVideo}`,
    audio_url: '', pdf_url: '', lyrics: lyrics(line), interpretes: [],
    interpretes_libelle: 'Assemblée', groupes_interpretes: [], interprete_lead: null,
    est_medley: false, passages: [], occurrences: [], duration: '4:00',
    recording_type: 'culte', recorded_at: '2026-09-06', date_enregistrement: '2026-09-06',
    date_effective: '2026-09-06', est_vedette: false, publie_le: '2026-09-06T10:00:00Z',
  };
}

const cantiques = [
  {
    ...cantique('chants-de-reconnaissance', 'Chants de reconnaissance', 'Paroles du medley'),
    est_medley: true,
    passages: [
      { id: 1, ordre: 1, titre: 'Grâce reçue', start_sec: 60, end_sec: 150, interpretes_libelle: '', lyrics: lyrics('Nous chantons la grâce reçue.') },
      { id: 2, ordre: 2, titre: 'Espérance vivante', start_sec: 180, end_sec: 240, interpretes_libelle: '', lyrics: lyrics('Notre espérance demeure vivante.') },
    ],
    occurrences: [
      { id: 11, video_url: `https://www.youtube.com/live/${mainVideo}`, start_sec: 60, end_sec: 240, interpretes: ['Assemblée'], interpretes_libelle: '', contexte: 'Culte du dimanche', date_evenement: '2026-09-06', session_adoration: null, session_adoration_slug: null },
      { id: 12, video_url: `https://youtu.be/${otherVideo}`, start_sec: 300, end_sec: 360, interpretes: ['Chorale'], interpretes_libelle: '', contexte: 'Répétition du mercredi', date_evenement: '2026-09-09', session_adoration: null, session_adoration_slug: null },
    ],
  },
  cantique('premier-cantique', 'Premier cantique', 'Texte du premier cantique.'),
  cantique('second-cantique', 'Second cantique', 'Texte du second cantique.'),
];

const sessions = [{
  id: 'session-musicale', slug: 'louange-du-dimanche', titre: 'Louange du dimanche',
  date: '2026-09-06', video_url: `https://www.youtube.com/watch?v=${otherVideo}`,
  audio_url: '', duree_minutes: 40, evenement: '', thumbnail_url: '',
  interpretes: [], interpretes_libelle: 'Assemblée', description: '', publie_le: '2026-09-06T10:00:00Z',
  cantiques_contenus: [
    { id: 21, cantique: 'uuid-premier-cantique', cantique_slug: 'premier-cantique', cantique_titre: 'Premier cantique', ordre: 1, start_sec: 120, end_sec: 180, titre_dans_session: '' },
    { id: 22, cantique: 'uuid-second-cantique', cantique_slug: 'second-cantique', cantique_titre: 'Second cantique', ordre: 2, start_sec: 240, end_sec: 300, titre_dans_session: '' },
  ],
}];

const mockAPI = `
window.__cantiquePlayers = [];
window.YT = { Player: class {
  constructor(frame, options) {
    this.frame = frame; this.events = options.events; this.state = -1;
    this.time = Number(new URL(frame.src).searchParams.get('start') || 0);
    window.__cantiquePlayers.push(this);
    setTimeout(() => {
      if (this.destroyed) return;
      this.events.onReady({ target: this });
      if (new URL(frame.src).searchParams.get('autoplay') === '1') this.playVideo();
    }, 0);
  }
  playVideo() { this.state = 1; this.events.onStateChange({ target: this, data: 1 }); }
  pauseVideo() { this.state = 2; this.events.onStateChange({ target: this, data: 2 }); }
  getPlayerState() { return this.state; }
  getCurrentTime() { return this.time; }
  destroy() { this.frame.remove(); this.destroyed = true; }
} };
window.onYouTubeIframeAPIReady?.();
`;

interface MockPlayer {
  time: number;
  destroyed?: boolean;
  events: { onError: (event: { data: number }) => void };
  playVideo: () => void;
}

async function prepare(page: Page, slug: string) {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('https://www.youtube-nocookie.com/embed/**', route => route.fulfill({
    contentType: 'text/html',
    body: '<!doctype html><html><body style="margin:0;background:#161616;color:white">Lecteur natif de test</body></html>',
  }));
  await page.route('https://www.youtube.com/iframe_api', route => route.fulfill({ contentType: 'application/javascript', body: mockAPI }));
  await page.route('**/api/v1/**', route => {
    const pathname = new URL(route.request().url()).pathname;
    const results = pathname.endsWith('/sessions-adoration/') ? sessions
      : pathname.endsWith('/cantiques/') ? cantiques : [];
    return route.fulfill({ json: { count: results.length, results, next: null, previous: null } });
  });
  const response = await page.goto(`/eglise/cantiques/watch/${slug}`);
  expect(response?.headers()['content-security-policy']).toBe(policy);
  await expect(page.locator('[data-player-status]')).toHaveAttribute('data-player-status', 'ready');
  await expect(page.locator('iframe[title="Lecteur vidéo YouTube"]')).toHaveCount(1);
  return errors;
}

async function expectBounds(page: Page, video: string, start: number, end?: number) {
  const iframe = page.locator('iframe[title="Lecteur vidéo YouTube"]');
  await expect.poll(async () => {
    const src = await iframe.getAttribute('src');
    if (!src) return null;
    const parsed = new URL(src);
    return { video: parsed.pathname, start: parsed.searchParams.get('start'), end: parsed.searchParams.get('end') };
  }).toEqual({ video: `/embed/${video}`, start: String(start), end: end === undefined ? null : String(end) });
  await expect(page.locator('[data-player-status]')).toHaveAttribute('data-player-status', 'ready');
}

async function advancePlayback(page: Page, seconds: number) {
  await page.evaluate(value => {
    const players = (window as unknown as { __cantiquePlayers: MockPlayer[] }).__cantiquePlayers;
    const player = [...players].reverse().find(candidate => !candidate.destroyed);
    if (!player) throw new Error('No active mock player');
    player.time = value;
    player.playVideo();
  }, seconds);
}

async function openPanel(page: Page, mobile: boolean, kind: 'session' | 'medley', panel: 'index' | 'lyrics') {
  if (!mobile) {
    await page.getByRole('tab', { name: panel === 'lyrics' ? 'Paroles' : /^Cantiques/ }).click();
    return;
  }
  const dialog = page.getByRole('dialog');
  if (await dialog.isVisible()) await dialog.getByRole('button', { name: 'Fermer les filtres' }).click();
  const name = panel === 'index'
    ? kind === 'session' ? 'Voir la liste des cantiques de la session' : 'Voir la liste des chants'
    : kind === 'session' ? 'Voir les paroles du cantique en cours' : 'Voir les paroles du chant en cours';
  await page.getByRole('button', { name, exact: true }).click();
}

test('un cantique conserve les bornes de chaque occurrence et change de vidéo sans doublon', async ({ page }) => {
  const errors = await prepare(page, 'chants-de-reconnaissance');
  await expectBounds(page, mainVideo, 60, 240);
  const occurrences = page.getByRole('region', { name: 'Vu dans ces vidéos' });
  await expect(occurrences.getByRole('button', { name: /Culte du dimanche/ })).toHaveAttribute('aria-pressed', 'true');
  await occurrences.getByRole('button', { name: /Répétition du mercredi/ }).click();
  await expectBounds(page, otherVideo, 300, 360);
  await expect(occurrences.getByRole('button', { name: /Répétition du mercredi/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('iframe[title="Lecteur vidéo YouTube"]')).toHaveCount(1);
  expect(await page.evaluate(() => (window as unknown as { __cantiquePlayers: MockPlayer[] }).__cantiquePlayers.filter(player => !player.destroyed).length)).toBe(1);
  expect(errors).toEqual([]);
});

test('le temps du medley synchronise les paroles et un clic saute au passage choisi', async ({ page, isMobile }) => {
  const errors = await prepare(page, 'chants-de-reconnaissance');
  const iframe = page.locator('iframe[title="Lecteur vidéo YouTube"]');
  await iframe.evaluate(frame => frame.setAttribute('data-original-frame', 'yes'));
  await advancePlayback(page, 80);
  await openPanel(page, isMobile, 'medley', 'lyrics');
  await expect(page.getByRole('region', { name: 'Paroles : Grâce reçue', exact: true })).toContainText('Nous chantons la grâce reçue.');
  // A recovered native player must resume time reporting without a remount.
  await page.evaluate(() => {
    const players = (window as unknown as { __cantiquePlayers: MockPlayer[] }).__cantiquePlayers;
    players.find(player => !player.destroyed)!.events.onError({ data: 5 });
  });
  await expect(page.locator('[data-player-status]')).toHaveAttribute('data-player-status', 'error');
  await advancePlayback(page, 190);
  await expect(page.locator('[data-player-status]')).toHaveAttribute('data-player-status', 'ready');
  await expect(page.getByRole('region', { name: 'Paroles : Espérance vivante', exact: true })).toContainText('Notre espérance demeure vivante.');
  await expect(iframe).toHaveAttribute('data-original-frame', 'yes');
  await openPanel(page, isMobile, 'medley', 'index');
  await page.getByRole('button', { name: /Grâce reçue.*1:00/ }).click();
  // A passage jump deliberately removes the occurrence's end bound so the medley continues.
  await expectBounds(page, mainVideo, 60);
  await expect(page.getByRole('region', { name: 'Paroles : Grâce reçue', exact: true })).toBeVisible();
  await expect(iframe).not.toHaveAttribute('data-original-frame', 'yes');
  expect(errors).toEqual([]);
});

test('une session suit le cantique en cours et applique les timecodes de l’index', async ({ page, isMobile }) => {
  const errors = await prepare(page, 'session-louange-du-dimanche');
  await expect(page.getByRole('heading', { name: 'Louange du dimanche', exact: true })).toBeVisible();
  await expectBounds(page, otherVideo, 0);
  const iframe = page.locator('iframe[title="Lecteur vidéo YouTube"]');
  await iframe.evaluate(frame => frame.setAttribute('data-original-frame', 'yes'));
  await advancePlayback(page, 140);
  await openPanel(page, isMobile, 'session', 'lyrics');
  await expect(page.getByRole('region', { name: 'Paroles : Premier cantique', exact: true })).toContainText('Texte du premier cantique.');
  await advancePlayback(page, 260);
  await expect(page.getByRole('region', { name: 'Paroles : Second cantique', exact: true })).toContainText('Texte du second cantique.');
  await expect(iframe).toHaveAttribute('data-original-frame', 'yes');
  await openPanel(page, isMobile, 'session', 'index');
  await page.getByRole('button', { name: /Premier cantique.*2:00/ }).click();
  await expectBounds(page, otherVideo, 120, 180);
  await expect(page.getByRole('region', { name: 'Paroles : Premier cantique', exact: true })).toBeVisible();
  await openPanel(page, isMobile, 'session', 'index');
  await page.getByRole('button', { name: /Second cantique.*4:00/ }).click();
  await expectBounds(page, otherVideo, 240, 300);
  await expect(page.getByRole('region', { name: 'Paroles : Second cantique', exact: true })).toBeVisible();
  await expect(page.locator('iframe[title="Lecteur vidéo YouTube"]')).toHaveCount(1);
  expect(errors).toEqual([]);
});
