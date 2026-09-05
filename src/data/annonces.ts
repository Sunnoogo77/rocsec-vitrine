import type { Annonce } from '../types';

/* ============================================================
   Annonces réelles de l'assemblée RST.
   - À venir : affiche officielle dans `affiche`.
   - Passées : compte-rendu dans `contentBlocks` (paragraphes
     Lorem Ipsum + images intercalées) à remplir par l'équipe
     pastorale avec un vrai compte-rendu et de vraies photos.
   ============================================================ */

const LOREM_PARA_LONG =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.';

const LOREM_PARA_SHORT =
  'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.';

const LOREM_PARA_MED =
  'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.';

export const annonces: Annonce[] = [

  /* ──────────────────────────────────────────────────────────────
     À VENIR
     ────────────────────────────────────────────────────────────── */

  {
    id: 'reunion-couples-2026',
    titre: 'Réunion des couples',
    titreEm: 'des couples',
    statut: 'a-venir',
    type: 'reunion',
    sousType: 'Couples',
    sousTypeLabel: 'Réunion · Couples',
    date: '2026-05-08',
    dl: 'VEN. MAI',
    lieu: 'Salle Bacchus, Vitry-sur-Seine',
    description:
      "Soirée d'enseignement dédiée aux couples mariés et fiancés de l'assemblée. Temps de prière, partage et échange autour du foyer.",
    affiche: '/images/annonces/reunion-couples/affiche.png',
    estPhare: true,
    featuredEyebrow: 'Annonce phare · Mai 2026',
    featuredMeta: [
      { lbl: 'Quand', val: 'Vendredi 8 mai 2026 · 19H30' },
      { lbl: 'Où',   val: 'Salle Bacchus, Vitry-sur-Seine' },
      { lbl: 'Type', val: 'Réunion · Couples' },
    ],
    ctaUrl: '/eglise/annonces/reunion-couples-2026',
  },

  {
    id: 'pentecote-2026',
    titre: 'Réunions de Pentecôte',
    titreEm: 'de Pentecôte',
    statut: 'a-venir',
    type: 'exceptionnelle',
    sousTypeLabel: 'Réunions exceptionnelles',
    date: '2026-05-22',
    dateFin: '2026-05-25',
    dl: 'VEN. MAI',
    dateDisplay: 'Du 22 au 25 mai 2026',
    lieu: 'Salle Bacchus, Vitry-sur-Seine',
    description:
      "Quatre jours de rassemblements exceptionnels autour de la Pentecôte : prédications, prière, adoration et veillée. Programme détaillé à venir.",
    affiche: '/images/annonces/pentecote/affiche.png',
    featuredMeta: [
      { lbl: 'Quand', val: 'Du 22 au 25 mai 2026' },
      { lbl: 'Où',   val: 'Salle Bacchus, Vitry-sur-Seine' },
      { lbl: 'Type', val: 'Réunions exceptionnelles' },
    ],
  },

  {
    id: 'voyage-marseille',
    titre: 'Voyage missionnaire',
    titreEm: 'à Marseille.',
    statut: 'a-venir',
    type: 'voyage',
    sousType: 'Mission',
    date: '2026-07-12',
    dateFin: '2026-07-18',
    dl: 'DIM. JUIL',
    lieu: 'Marseille · 13ᵉ et 14ᵉ',
    description:
      "Une semaine de prédication, de baptêmes et de visites de frères dans le sud. Cette mission s'inscrit dans le prolongement de l'œuvre de fondation. Inscriptions ouvertes au secrétariat jusqu'au 15 juin 2026.",
    featuredEyebrow: 'Annonce · Été 2026',
    featuredMeta: [
      { lbl: 'Quand', val: 'Du 12 au 18 juillet 2026' },
      { lbl: 'Où',   val: 'Marseille · 13ᵉ et 14ᵉ' },
      { lbl: 'Type', val: 'Voyage missionnaire' },
    ],
  },

  /* ──────────────────────────────────────────────────────────────
     PASSÉES — avec compte-rendu Lorem Ipsum + photos
     ────────────────────────────────────────────────────────────── */

  {
    id: 'reunion-jeunes-mai-2026',
    titre: 'Réunion des jeunes',
    titreEm: 'des jeunes',
    statut: 'passee',
    type: 'reunion',
    sousType: 'Jeunesse',
    sousTypeLabel: 'Réunion · Jeunesse',
    date: '2026-05-01',
    dl: 'VEN. MAI',
    lieu: 'Salle Bacchus, Vitry-sur-Seine',
    description:
      "Soirée de prière, d'enseignement et de partage à destination des jeunes de l'assemblée et de leurs invités.",
    affiche: '/images/annonces/reunion-jeunes/affiche.jpeg',
    contentBlocks: [
      { kind: 'paragraph', text: LOREM_PARA_LONG },
      { kind: 'image', src: '/images/annonces/reunion-jeunes/photo-1.png', alt: 'Photo de la réunion des jeunes', size: 'wide' },
      { kind: 'paragraph', text: LOREM_PARA_MED },
      { kind: 'paragraph', text: LOREM_PARA_SHORT },
      { kind: 'image', src: '/images/annonces/reunion-jeunes/photo-2.png', alt: 'Photo de la réunion des jeunes', size: 'medium' },
      { kind: 'paragraph', text: LOREM_PARA_LONG },
      { kind: 'paragraph', text: LOREM_PARA_SHORT },
    ],
  },

  {
    id: 'paques-2026',
    titre: 'Réunions spéciales',
    titreEm: 'de Pâques',
    statut: 'passee',
    type: 'exceptionnelle',
    sousTypeLabel: 'Réunions exceptionnelles',
    date: '2026-04-01',
    dateFin: '2026-04-05',
    dl: 'MER. AVR',
    dateDisplay: 'Du 1er au 5 avril 2026',
    lieu: 'Salle Bacchus, Vitry-sur-Seine',
    description:
      "Mercredi, jeudi, vendredi, samedi et dimanche : cinq jours de rassemblement autour de la Pâque, dont une veillée de prière le samedi soir.",
    affiche: '/images/annonces/paques-2026/affiche.jpeg',
    contentBlocks: [
      { kind: 'paragraph', text: LOREM_PARA_LONG },
      { kind: 'paragraph', text: LOREM_PARA_MED },
      { kind: 'paragraph', text: LOREM_PARA_SHORT },
      { kind: 'paragraph', text: LOREM_PARA_LONG },
    ],
  },
];
