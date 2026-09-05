import type { GenesePage } from '../../types';

/* ============================================================
   GENÈSE — § Une semaine à Marseille
   Source : RST_archives/Une-semaine-à-Marseille.txt
   Publié le 8 novembre 2005 par Pasteur
   Retranscription intégrale — aucun changement de texte.
   ============================================================ */
export const marseille: GenesePage = {
  id: 'marseille',
  slug: 'marseille',
  titre: 'Une semaine à Marseille',
  eyebrow: 'Genèse · Événement marquant',
  sousTitre: "Mission missionnaire — Rocher d'Âge Tabernacle.",
  publieLe: '2005-11-08',
  blocs: [
    {
      kind: 'image',
      src: '/genese/marseille.png',
      alt: 'Une semaine à Marseille',
      caption: 'Les photos.',
    },
    {
      kind: 'paragraph',
      content:
        "Ils étaient nombreux à avoir répondu à l'appel du Seigneur. Les coeurs vivement touchés, ils se sont pretés à l'exécution de la \"prescription\" faite par le pasteur : \" Repentez-vous et faites-vous baptiser au nom du Seigneur Jésus-Christ…\"",
    },
    {
      kind: 'paragraph',
      content:
        "Le Seigneur a pourvu d'une église du \"Message du Temps de la Fin\" à Marseille (10, rue de l'Académie, 13001 Marseille). A l'invitation du pasteur Jean-Marie BETHU, le révérent NDAYE a tenu une série de réunions spéciales en vue de préparer \"ROCHER D'AGE TABERNACLE\" à la dédicace et à l'ordination de son pasteur. La mission que l'église de Paris a mené à Marseille a été couronnée de nombreux succès, pour la gloire de Jésus-Christ…",
    },
  ],
};
