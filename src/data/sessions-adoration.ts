import type { SessionAdoration } from '../types';

/* ============================================================
   Sessions d'Adoration & Louange — longues vidéos qui
   contiennent une suite de cantiques chantés en direct.
   L'index cantiquesContenus permet à l'utilisateur de cliquer
   un cantique précis dans une session et de partir au bon
   moment dans la vidéo (start/endSec en secondes).

   En V1 les timestamps sont indicatifs ; ils seront enrichis
   précisément par l'équipe média via l'admin Django à venir.
   ============================================================ */

export const sessionsAdoration: SessionAdoration[] = [

  {
    id: 'celebration-musique-21',
    slug: 'celebration-musique-21',
    titre: 'Célébration de Dieu par la musique — 21 cantiques',
    date: '2023-07-15',
    videoUrl: 'https://www.youtube.com/watch?v=GdPuf714RkM',
    dureeMinutes: 95,
    evenement: 'Live au culte',
    interpretes: ['Fr. Jules Kayembe', 'Rév. Robert Ndaye M.'],
    cantiquesContenus: [
      /* Index indicatif — à préciser avec l'équipe musicale.
         Le start/end real viendra de l'admin Django. */
      { cantiqueId: 'recueil-007-combien-j-aime-jesus', titre: "Combien j'aime Jésus", startSec: 120 },
      { cantiqueId: 'roc-seculaire-ne-chancelle-pas', titre: 'Roc Séculaire ne chancelle pas', startSec: 540 },
      { cantiqueId: 'recueil-126-chant-de-victoire', titre: 'Chant de Victoire', startSec: 1380 },
    ],
  },

  {
    id: 'une-heure-dans-sa-presence',
    slug: 'une-heure-dans-sa-presence',
    titre: 'Une heure dans Sa présence — 11 cantiques inspirés',
    date: '2024-03-10',
    videoUrl: 'https://www.youtube.com/watch?v=RUoXYRQnRvw',
    dureeMinutes: 62,
    evenement: 'Session spéciale d\'adoration',
    interpretes: ['Fr. Jules Kayembe'],
    cantiquesContenus: [
      { cantiqueId: 'chaque-instant', titre: 'Chaque instant', startSec: 180 },
      { cantiqueId: 'ville-de-perles', titre: 'Ville de perles et de lumière', startSec: 720 },
      { cantiqueId: 'c-est-la-trace', titre: "C'est la trace", startSec: 1440 },
      { cantiqueId: 'recueil-088-plus-pres-de-toi-mon-dieu', titre: 'Plus près de Toi, mon Dieu', startSec: 2280 },
    ],
  },
];
