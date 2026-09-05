import type { Temoignage } from '../types';

/* ============================================================
   Témoignages — placeholders Lorem Ipsum.
   Les noms (fictifs), dates et références bibliques sont
   conservés tels quels ; les contenus de récit sont en
   Lorem Ipsum, à remplir par l'équipe pastorale avec de
   vrais témoignages recueillis avec accord des fidèles.
   ============================================================ */

export const temoignages: Temoignage[] = [

  /* ── q1 — Citation courte (2 col) ─────────────────────────────── */
  {
    id: 'tem-q1',
    type: 'citation',
    auteur: '— une sœur · Île-de-France',
    cite: '— une sœur · Île-de-France',
    quoteText:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua, ut enim ad minim veniam.',
    date: '2026',
  },

  /* ── i1 — Récit illustré (4 col × 2 lignes) ───────────────────── */
  {
    id: 'tem-i1',
    type: 'illustre',
    auteur: '— frère R. · 41 ans · baptisé le 28 . 09 . 2025',
    cite: '— frère R. · 41 ans · baptisé le 28 . 09 . 2025',
    eyebrow: 'Récit · 14 . 03 . 2026',
    titre: 'Lorem ipsum dolor sit amet.',
    corps:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    image: '/images/sanctuaire.jpeg',
    hasDetail: true,
    date: '2026-03-14',
    detail: {
      tag: 'Récit · 14 . 03 . 2026 · 7 min de lecture',
      byline: 'Frère R. · 41 ans · baptisé le 28 . 09 . 2025 · publié avec son accord',
      readingMinutes: 7,
      paragraphs: [
        {
          kind: 'lede',
          text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
        },
        {
          kind: 'p',
          text: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        },
        {
          kind: 'pull',
          text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        },
        {
          kind: 'p',
          text: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
        },
        {
          kind: 'p',
          text: 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.',
        },
        {
          kind: 'p',
          text: 'Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur. Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur.',
        },
      ],
      versetRef: 'Matthieu 7 . 24',
      versetText:
        '« Quiconque entend ces paroles que je dis et les met en pratique. »',
    },
  },

  /* ── q2 — Citation courte avec accent rouge (2 col) ───────────── */
  {
    id: 'tem-q2',
    type: 'citation',
    auteur: '— une mère · 33 ans',
    cite: '— une mère · 33 ans',
    accentRouge: true,
    quoteText:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt.',
    date: '2025',
  },

  /* ── s1 — Récit moyen (3 col) ─────────────────────────────────── */
  {
    id: 'tem-s1',
    type: 'recit',
    auteur: '— frère J.K. · 37 ans · membre depuis 2018',
    cite: '— frère J.K. · 37 ans · membre depuis 2018',
    eyebrow: 'Récit · 09 . 02 . 2026',
    titre: 'Lorem ipsum dolor sit amet',
    corps:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit.',
    date: '2026-02-09',
  },

  /* ── q3 — Citation courte (3 col) ─────────────────────────────── */
  {
    id: 'tem-q3',
    type: 'citation',
    auteur: '— jeune adulte · 23 ans',
    cite: '— jeune adulte · 23 ans',
    quoteText:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    date: '2025',
  },

  /* ── i2 — Récit illustré (4 col × 2 lignes) ───────────────────── */
  {
    id: 'tem-i2',
    type: 'illustre',
    auteur: '— frère M. · 52 ans · baptisé le 24 . 01 . 2024',
    cite: '— frère M. · 52 ans · baptisé le 24 . 01 . 2024',
    eyebrow: 'Récit · 21 . 01 . 2026',
    titre: 'Lorem ipsum dolor sit amet.',
    corps:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip.',
    image: '/images/wmb-portrait.jpeg',
    hasDetail: false,
    date: '2026-01-21',
  },

  /* ── s2 — Récit moyen (2 col) ─────────────────────────────────── */
  {
    id: 'tem-s2',
    type: 'recit',
    auteur: '— un couple · 16 ans de mariage',
    cite: '— un couple · 16 ans de mariage',
    eyebrow: 'Récit · 15 . 12 . 2025',
    titre: 'Lorem ipsum dolor sit',
    corps:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    date: '2025-12-15',
  },

  /* ── q4 — Citation courte (2 col) ─────────────────────────────── */
  {
    id: 'tem-q4',
    type: 'citation',
    auteur: '— une sœur · venue de R.D. Congo en 2022',
    cite: '— une sœur · venue de R.D. Congo en 2022',
    quoteText:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    date: '2024',
  },

];

export const totalTemoignages = 94;
export const premiereTemoignageAnnee = 1999;
