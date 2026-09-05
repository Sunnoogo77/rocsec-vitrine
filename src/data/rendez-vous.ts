import type { RendezVous } from '../types';

export const rendezVous: RendezVous[] = [
  {
    id: 'mercredi',
    jour: 'mercredi',
    titre: 'Culte du mercredi',
    heureDebut: '19H00',
    heureFin: '21H00',
    description: 'Culte de milieu de semaine autour de la Parole et de la communion fraternelle.',
  },
  {
    id: 'dimanche',
    jour: 'dimanche',
    titre: 'Culte du dimanche',
    heureDebut: '09H00',
    heureFin: '12H00',
    description:
      "Culte principal de l'assemblée. Prédication, louange, communion fraternelle.",
  },
  {
    id: 'vendredi',
    jour: 'vendredi',
    titre: 'Réunion de prière',
    heureDebut: '19H00',
    heureFin: '21H00',
    description: 'Réunion de prière intercessive et de communion fraternelle.',
  },
];
