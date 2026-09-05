/**
 * Fetcher ImageSemaine — galerie hebdo (jusqu'à 6 photos).
 *
 * Filtre actif=true côté front (au cas où l'admin garde des photos désactivées
 * en base). Mapping snake → camel : image_url → src, est_grande → estGrande.
 * La caption est déjà localisée par le backend selon ?lang.
 */

import type { ImageSemaine } from '../types';
import { apiGet, type Paginated } from './client';

interface RawImageSemaine {
  id: string;
  image: string | null;
  image_url: string | null;
  caption: string;
  caption_fr: string;
  caption_en: string;
  est_grande: boolean;
  ordre: number;
  semaine_iso: number;
  annee: number;
  actif: boolean;
}

function toImageSemaine(raw: RawImageSemaine): ImageSemaine {
  return {
    id: raw.id,
    src: raw.image_url ?? raw.image ?? '',
    caption: raw.caption ?? raw.caption_fr ?? '',
    estGrande: raw.est_grande || undefined,
  };
}

export async function fetchImagesSemaine(
  opts: { lang?: 'fr' | 'en'; signal?: AbortSignal } = {},
): Promise<ImageSemaine[]> {
  const lang = opts.lang ?? 'fr';
  const data = await apiGet<Paginated<RawImageSemaine>>('/images-semaine/', {
    signal: opts.signal,
    query: { lang },
  });
  return data.results
    .filter((img) => img.actif && img.image_url)
    .sort((a, b) => a.ordre - b.ordre)
    .map(toImageSemaine);
}
