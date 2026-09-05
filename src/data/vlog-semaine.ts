import type { VlogSemaine } from '../types';

/* ============================================================
   Cette semaine — vitrine du dernier culte.
   Le titre, la date et le prédicateur sont réels.
   Le fil du message et le témoignage sont des placeholders
   Lorem Ipsum à remplir par l'équipe pastorale après chaque
   culte.  Le cantique de la semaine pointe vers le Cantique
   spécial de Pâques 2026 (Fr. Jules Kayembe).
   ============================================================ */

export const vlogSemaine: VlogSemaine = {
  date: '2026-04-29',
  titreMessage: 'Nous ne sommes pas',
  titreSuffix: 'des demi-chrétiens.',
  pitchMessage:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  serie: '',
  predicateur: 'Fr. Michel Orodapo',
  heureCulte: '19H30',
  verset: {
    reference: 'RÉFÉRENCE À CONFIRMER',
    texte:
      '« Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. »',
  },
  poster: undefined,
  replayUrl: 'https://www.youtube.com/watch?v=WmhljxW5zUU',

  filDuMessage: {
    paragraphe1:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    paragraphe2: '',
    versets: [],
  },

  cantiqueSemaine: {
    titre: 'Cantique spécial — Pâques 2026',
    soliste: 'Fr. Jules Kayembe',
    audioUrl: undefined,
    videoUrl: 'https://www.youtube.com/watch?v=7OLGUUubcGM',
  },

  temoignageSemaine: {
    auteur: "Une sœur d'Île-de-France",
    texte:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua, ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  },
};
