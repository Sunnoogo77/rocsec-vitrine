import type { ProjetNehemie } from '../types';

// Chiffres issus du wireframe (figés pour la présentation).
// La jauge de progression est calculée dynamiquement : collecte / objectif.
export const projetNehemie: ProjetNehemie = {
  objectif: 500000,
  collecte: 54259,
  devise: '€',
  miseAJour: '2026-04-27',

  batisseurs: [
    { initiales: 'R.N.', engagement: '200 € / mois' },
    { initiales: 'M.K.', engagement: '100 € / mois' },
    { initiales: 'J.M.', engagement: '50 € / mois' },
    { initiales: 'A.B.', engagement: '50 € / mois' },
    { initiales: 'C.D.', engagement: '200 € (don unique)' },
    { initiales: 'P.L.', engagement: '50 € / mois' },
  ],

  montants: [
    {
      id: '50',
      valeur: 50,
      label: '50 €',
      titre: 'Une pierre',
      description:
        "Contribue à l'acquisition des matériaux de base pour la rénovation du sanctuaire.",
    },
    {
      id: '200',
      valeur: 200,
      label: '200 €',
      titre: 'Une colonne',
      description:
        'Finance une partie des travaux structurels qui rendront la maison habitable.',
    },
    {
      id: 'libre',
      valeur: null,
      label: 'Libre',
      titre: 'À votre mesure',
      description:
        'Donnez selon ce que le Seigneur met sur votre cœur. Chaque contribution compte.',
    },
  ],

  modesDon: [
    {
      id: 'virement',
      icone: 'V',
      titre: 'Virement bancaire',
      instructions:
        "RIB disponible sur demande auprès du trésorier de l'assemblée. IBAN : FR•• •••• •••• •••• •••• ••• (à compléter).",
    },
    {
      id: 'cheque',
      icone: 'C',
      titre: 'Chèque',
      instructions:
        "Chèque à l'ordre de « Roc Séculaire Tabernacle » — adresse à compléter par le trésorier.",
    },
    {
      id: 'carte',
      icone: 'K',
      titre: 'Carte bancaire',
      instructions:
        'Paiement en ligne sécurisé. Lien à venir — intégration Stripe prévue (cf. ROADMAP.md).',
    },
    {
      id: 'especes',
      icone: 'E',
      titre: 'Espèces',
      instructions:
        'Remise en main propre au trésorier ou au pasteur lors des cultes. Un reçu vous sera remis.',
    },
  ],
};
