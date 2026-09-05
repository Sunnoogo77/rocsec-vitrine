import type { Cantique } from '../types';

/* ============================================================
   Cantiques de l'assemblée — trois familles :
     - recueil : entrées du livre traditionnel (numerotées)
     - special : cantiques particuliers, solos, compositions
     - adoration : référencés via les SessionAdoration (voir
       src/data/sessionsAdoration.ts) ; les Cantique listés ici
       en famille=recueil ou special peuvent aussi apparaître
       dans une session via leurs occurrences[].sessionId.

   Les vidéos pointent vers la chaîne YouTube Kollonell.
   Les paroles seront complétées par l'équipe musicale.
   ============================================================ */

export const cantiques: Cantique[] = [

  /* ══════════════════════════════════════════════════════════
     CANTIQUES SPÉCIAUX — compositions + lives
     ══════════════════════════════════════════════════════════ */

  {
    id: 'paques-2026-amonaki-pasi',
    slug: 'paques-2026-amonaki-pasi',
    numero: 'S01',
    titre: 'Cantique spécial — Pâques 2026',
    titleEm: 'Pâques 2026',
    famille: 'special',
    solisteOuChoeur: 'Fr. Jules Kayembe',
    detailBy: 'Fr. Jules Kayembe · enregistré pour Pâques 2026 · Roc Séculaire Tabernacle',
    recordedAt: 'Pâques 2026',
    duration: '7MIN 26',
    recordingType: 'studio',
    videoUrl: 'https://www.youtube.com/watch?v=7OLGUUubcGM',
    estVedette: true,
    lyrics: [],
    occurrences: [
      {
        id: 'occ-paques-2026-studio',
        videoUrl: 'https://www.youtube.com/watch?v=7OLGUUubcGM',
        interpretes: ['Fr. Jules Kayembe'],
        contexte: 'Studio · Pâques 2026',
        dateEvenement: '2026-04-05',
      },
    ],
  },

  {
    id: 'chaque-instant',
    slug: 'chaque-instant',
    numero: 'S02',
    titre: 'Chaque instant',
    famille: 'special',
    solisteOuChoeur: 'Fr. Jules Kayembe · acoustique',
    recordingType: 'studio',
    videoUrl: 'https://www.youtube.com/watch?v=op6mald-WnE',
    lyrics: [],
    occurrences: [
      {
        id: 'occ-chaque-instant-studio',
        videoUrl: 'https://www.youtube.com/watch?v=op6mald-WnE',
        interpretes: ['Fr. Jules Kayembe'],
        contexte: 'Studio · acoustique',
      },
    ],
  },

  {
    id: 'c-est-la-trace',
    slug: 'c-est-la-trace',
    numero: 'S03',
    titre: "C'est la trace",
    famille: 'special',
    solisteOuChoeur: 'Fr. Jules Kayembe · acoustique',
    recordingType: 'studio',
    videoUrl: 'https://www.youtube.com/watch?v=YzBtvB5maTM',
    lyrics: [],
    occurrences: [
      {
        id: 'occ-c-est-la-trace-studio',
        videoUrl: 'https://www.youtube.com/watch?v=YzBtvB5maTM',
        interpretes: ['Fr. Jules Kayembe'],
        contexte: 'Studio · acoustique',
      },
    ],
  },

  {
    id: 'ville-de-perles',
    slug: 'ville-de-perles',
    numero: 'S04',
    titre: 'Ville de perles et de lumière',
    famille: 'special',
    solisteOuChoeur: 'Fr. Jules Kayembe · acoustique',
    recordingType: 'studio',
    videoUrl: 'https://www.youtube.com/watch?v=JD8Zc8SffPo',
    lyrics: [],
    occurrences: [
      {
        id: 'occ-ville-de-perles-studio',
        videoUrl: 'https://www.youtube.com/watch?v=JD8Zc8SffPo',
        interpretes: ['Fr. Jules Kayembe'],
        contexte: 'Studio · acoustique',
      },
    ],
  },

  {
    id: 'roc-seculaire-ne-chancelle-pas',
    slug: 'roc-seculaire-ne-chancelle-pas',
    numero: 'S05',
    titre: 'Roc Séculaire ne chancelle pas',
    famille: 'special',
    solisteOuChoeur: 'Fr. Jules Kayembe',
    videoUrl: 'https://www.youtube.com/watch?v=oWHm58YIACI',
    lyrics: [],
    occurrences: [
      {
        id: 'occ-roc-ne-chancelle-pas',
        videoUrl: 'https://www.youtube.com/watch?v=oWHm58YIACI',
        interpretes: ['Fr. Jules Kayembe'],
        contexte: 'Live au culte',
      },
    ],
  },

  {
    id: 'je-veux-monter',
    slug: 'je-veux-monter',
    numero: 'S06',
    titre: 'Je veux monter sur la montagne',
    famille: 'special',
    solisteOuChoeur: 'Fr. Jules Kayembe · live au culte',
    recordedAt: '24 . 07 . 2022',
    recordingType: 'live',
    videoUrl: 'https://www.youtube.com/watch?v=GIFxKt1CkRo',
    lyrics: [],
    occurrences: [
      {
        id: 'occ-je-veux-monter-2022-07-24',
        videoUrl: 'https://www.youtube.com/watch?v=GIFxKt1CkRo',
        interpretes: ['Fr. Jules Kayembe'],
        contexte: 'Live au culte',
        dateEvenement: '2022-07-24',
      },
    ],
  },

  {
    id: 'que-me-serait-il-arrive',
    slug: 'que-me-serait-il-arrive',
    numero: 'S07',
    titre: 'Que me serait-il arrivé ?',
    famille: 'special',
    solisteOuChoeur: 'Fr. Jules Kayembe · live au culte',
    recordedAt: '15 . 05 . 2022',
    recordingType: 'live',
    videoUrl: 'https://www.youtube.com/watch?v=5u8SpeC0_qs',
    lyrics: [],
    occurrences: [
      {
        id: 'occ-que-me-serait-il-arrive-2022-05-15',
        videoUrl: 'https://www.youtube.com/watch?v=5u8SpeC0_qs',
        interpretes: ['Fr. Jules Kayembe'],
        contexte: 'Live au culte',
        dateEvenement: '2022-05-15',
      },
    ],
  },

  {
    id: 'ton-amour-nous-environne',
    slug: 'ton-amour-nous-environne',
    numero: 'S08',
    titre: 'Ton amour nous environne',
    famille: 'special',
    solisteOuChoeur: 'Past. Robert Ndaye feat. Fr. Jules Kayembe',
    recordingType: 'live',
    videoUrl: 'https://www.youtube.com/watch?v=29SmF9wfaGY',
    lyrics: [],
    occurrences: [
      {
        id: 'occ-ton-amour-environne-live',
        videoUrl: 'https://www.youtube.com/watch?v=29SmF9wfaGY',
        interpretes: ['Past. Robert Ndaye M.', 'Fr. Jules Kayembe'],
        contexte: 'Live au culte · duo',
      },
    ],
  },

  /* ══════════════════════════════════════════════════════════
     CANTIQUES DU RECUEIL — paroles à transcrire par l'équipe
     musicale ; numéros à confirmer avec le livre officiel.
     Pas (encore) de vidéos liées : les occurrences pourront être
     enrichies plus tard quand un cantique du recueil sera repéré
     dans une session d'adoration ou un live.
     ══════════════════════════════════════════════════════════ */

  {
    id: 'recueil-007-combien-j-aime-jesus',
    slug: 'combien-j-aime-jesus',
    numero: '007',
    numeroRecueil: 7,
    titre: "Combien j'aime Jésus",
    famille: 'recueil',
    solisteOuChoeur: 'Recueil de l\'assemblée',
    lyrics: [],
    occurrences: [],
  },

  {
    id: 'recueil-042-quel-ami-fidele-et-tendre',
    slug: 'quel-ami-fidele-et-tendre',
    numero: '042',
    numeroRecueil: 42,
    titre: 'Quel ami fidèle et tendre',
    famille: 'recueil',
    solisteOuChoeur: 'Recueil de l\'assemblée',
    lyrics: [],
    occurrences: [],
  },

  {
    id: 'recueil-088-plus-pres-de-toi-mon-dieu',
    slug: 'plus-pres-de-toi-mon-dieu',
    numero: '088',
    numeroRecueil: 88,
    titre: 'Plus près de Toi, mon Dieu',
    famille: 'recueil',
    solisteOuChoeur: 'Recueil de l\'assemblée',
    lyrics: [],
    occurrences: [],
  },

  {
    id: 'recueil-126-chant-de-victoire',
    slug: 'chant-de-victoire',
    numero: '126',
    numeroRecueil: 126,
    titre: 'Chant de Victoire',
    famille: 'recueil',
    solisteOuChoeur: 'Recueil de l\'assemblée',
    videoUrl: 'https://www.youtube.com/watch?v=ZAFB2Z3sKkU',
    lyrics: [],
    occurrences: [
      {
        id: 'occ-recueil-126-rst',
        videoUrl: 'https://www.youtube.com/watch?v=ZAFB2Z3sKkU',
        interpretes: ['Chœur RST'],
        contexte: 'Live à Roc Séculaire Tabernacle',
      },
    ],
  },

  {
    id: 'recueil-203-approche-toi',
    slug: 'approche-toi',
    numero: '203',
    numeroRecueil: 203,
    titre: 'Approche-toi',
    famille: 'recueil',
    solisteOuChoeur: 'Recueil de l\'assemblée',
    lyrics: [],
    occurrences: [],
  },
];

/** Compteurs par famille — utilisé par la page bibliothèque pour
 *  les badges des onglets. */
export const cantiqueCounts = {
  tous:      cantiques.length,
  recueil:   cantiques.filter((c) => c.famille === 'recueil').length,
  special:   cantiques.filter((c) => c.famille === 'special').length,
  adoration: cantiques.filter((c) => c.famille === 'adoration').length,
} as const;
