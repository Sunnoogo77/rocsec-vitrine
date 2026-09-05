/**
 * Fetcher RendezVous — récupère et transforme la réponse Django en `RendezVous`
 * conforme au contrat front (`src/types/index.ts`).
 *
 * Transformations :
 *   - extrait la traduction de la langue demandée (fallback FR)
 *   - reformate `heure_debut: "19:00:00"` (TimeField) → `heureDebut: "19H00"`
 *   - filtre `actif=true`
 */

import type { JourCulte, RendezVous } from '../types';
import { apiGet, type Paginated } from './client';

interface RawTraduction {
  langue: 'fr' | 'en';
  titre: string;
  description: string;
}

interface RawRendezVous {
  id: string;
  jour: JourCulte;
  heure_debut: string;
  heure_fin: string;
  actif: boolean;
  traductions: RawTraduction[];
}

function formatHeure(time: string): string {
  // "19:00:00" → "19H00" ; tolère "19:00" ou ""
  const [hh = '00', mm = '00'] = (time ?? '').split(':');
  return `${hh.padStart(2, '0')}H${mm.padStart(2, '0')}`;
}

function pickTraduction(
  traductions: RawTraduction[],
  lang: 'fr' | 'en',
): { titre: string; description: string } {
  const fr = traductions.find((t) => t.langue === 'fr');
  if (lang === 'en') {
    const en = traductions.find((t) => t.langue === 'en');
    if (en && (en.titre || en.description)) return en;
  }
  return fr ?? { titre: '', description: '' };
}

function toRendezVous(raw: RawRendezVous, lang: 'fr' | 'en'): RendezVous {
  const { titre, description } = pickTraduction(raw.traductions, lang);
  return {
    id: raw.id,
    jour: raw.jour,
    titre,
    heureDebut: formatHeure(raw.heure_debut),
    heureFin: formatHeure(raw.heure_fin),
    description,
  };
}

export async function fetchRendezVous(
  opts: { lang?: 'fr' | 'en'; signal?: AbortSignal } = {},
): Promise<RendezVous[]> {
  const lang = opts.lang ?? 'fr';
  const data = await apiGet<Paginated<RawRendezVous>>('/rendez-vous/', {
    signal: opts.signal,
  });
  return data.results.filter((rv) => rv.actif).map((rv) => toRendezVous(rv, lang));
}
