/**
 * Fetcher Temoignage — récupère la liste publiée et la transforme au contrat
 * vitrine (camelCase, agrégation du sous-objet `detail` quand has_detail=true).
 */

import type { Temoignage, TemoignageType, TemoignageParagraph } from '../types';
import { apiGet, type Paginated } from './client';

interface RawTemoignagePhoto {
  id: string;
  url: string;
  legende: string;
  ordre: number;
}

interface RawTemoignage {
  id: string;
  slug: string;
  type: TemoignageType;
  accent_rouge: boolean;
  image_url: string | null;
  photos?: RawTemoignagePhoto[];
  has_detail: boolean;
  auteur: string;
  cite: string;
  quote_text: string;
  eyebrow: string;
  titre: string;
  corps: string;
  paragraphs: TemoignageParagraph[];
  byline: string;
  reading_minutes: number | null;
  tag: string;
  verset_ref: string;
  verset_text: string;
  publie_le: string | null;
  lang_disponibles: string[];
}

function toTemoignage(raw: RawTemoignage): Temoignage {
  const photos = (raw.photos ?? []).map((p) => ({
    id: p.id,
    url: p.url,
    legende: p.legende,
  }));
  const out: Temoignage = {
    id: raw.id,
    auteur: raw.auteur,
    type: raw.type,
    accentRouge: raw.accent_rouge || undefined,
    cite: raw.cite,
    quoteText: raw.quote_text || undefined,
    eyebrow: raw.eyebrow || undefined,
    titre: raw.titre || undefined,
    corps: raw.corps || undefined,
    // Image principale : soit l'image éditoriale (Temoignage.image), soit la
    // première photo soumise par le témoin si pas d'image éditoriale.
    image: raw.image_url || photos[0]?.url || undefined,
    photos: photos.length > 0 ? photos : undefined,
    hasDetail: raw.has_detail || undefined,
    date: raw.publie_le ?? '',
  };
  if (raw.has_detail) {
    out.detail = {
      tag: raw.tag,
      byline: raw.byline,
      readingMinutes: raw.reading_minutes ?? 0,
      paragraphs: raw.paragraphs ?? [],
      versetRef: raw.verset_ref,
      versetText: raw.verset_text,
    };
  }
  return out;
}

export async function fetchTemoignages(
  opts: { lang?: 'fr' | 'en'; signal?: AbortSignal } = {},
): Promise<Temoignage[]> {
  const lang = opts.lang ?? 'fr';
  const data = await apiGet<Paginated<RawTemoignage>>('/temoignages/', {
    signal: opts.signal,
    query: { lang, page_size: 50 },
  });
  return data.results.map(toTemoignage);
}

/** Compteurs éditoriaux (singleton). */
export interface TemoignagesStats {
  total_affiche: number;
  premiere_annee: number;
}

export async function fetchTemoignagesStats(
  opts: { signal?: AbortSignal } = {},
): Promise<TemoignagesStats | null> {
  try {
    return await apiGet<TemoignagesStats>('/temoignages/stats/', {
      signal: opts.signal,
    });
  } catch {
    return null;
  }
}
