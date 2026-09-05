import type { ImageSemaine } from '../types';

/* ============================================================
   Galerie de la semaine — 6 emplacements en grille asymétrique
   (2 grandes + 4 petites).
   Les 2 premières photos viennent de la réunion des jeunes
   du 1er mai 2026.  Les 4 autres sont à fournir par l'équipe
   média après chaque culte.
   ============================================================ */

export const imagesSemaine: ImageSemaine[] = [
  {
    id: 'img-01',
    src: '/images/annonces/reunion-jeunes/photo-1.png',
    caption: 'Réunion des jeunes · vendredi 1er mai 2026',
    estGrande: true,
  },
  {
    id: 'img-02',
    src: '/images/annonces/reunion-jeunes/photo-2.png',
    caption: 'Réunion des jeunes · vendredi 1er mai 2026',
    estGrande: true,
  },
  {
    id: 'img-03',
    src: '/images/placeholder-gallery.svg',
    caption: 'Photo à fournir',
    estGrande: false,
  },
  {
    id: 'img-04',
    src: '/images/placeholder-gallery.svg',
    caption: 'Photo à fournir',
    estGrande: false,
  },
  {
    id: 'img-05',
    src: '/images/placeholder-gallery.svg',
    caption: 'Photo à fournir',
    estGrande: false,
  },
  {
    id: 'img-06',
    src: '/images/placeholder-gallery.svg',
    caption: 'Photo à fournir',
    estGrande: false,
  },
];
