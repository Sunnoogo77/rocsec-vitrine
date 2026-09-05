/* ============================================================
   GENÈSE — Index agrégateur
   Centralise les pages des 7 piliers + 2 événements marquants.
   ============================================================ */

import type { GenesePage } from '../../types';
import { presentation } from './presentation';
import { naissance } from './naissance';
import { mission } from './mission';
import { branham } from './branham';
import { actes } from './actes';
import { offices } from './offices';
import { services } from './services';
import { marseille } from './marseille';
import { reunionJeunes2005 } from './reunion-jeunes-2005';

export {
  presentation,
  naissance,
  mission,
  branham,
  actes,
  offices,
  services,
  marseille,
  reunionJeunes2005,
};

/* Les 7 piliers de la sous-nav (ordre éditorial) */
export const PILIERS_GENESE: GenesePage[] = [
  presentation,
  naissance,
  mission,
  branham,
  actes,
  offices,
  services,
];

/* Les 2 événements marquants (hors sous-nav, accessibles via l'index) */
export const EVENEMENTS_GENESE: GenesePage[] = [
  marseille,
  reunionJeunes2005,
];
