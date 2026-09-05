/**
 * Fetcher Annonce. Le backend renvoie un payload avec snake_case + dates ISO
 * et `statut_temporel` calculé serveur-side. La vitrine attend camelCase et
 * `date` (au lieu de `date_debut`).
 */

import type { Annonce, AnnonceContentBlock, AnnonceStatut, AnnonceType } from '../types';
import { apiGet, type Paginated } from './client';

interface RawAnnonce {
  id: string;
  slug: string;
  type: AnnonceType;
  sous_type: string;
  titre: string;
  titre_em: string;
  sous_type_label: string;
  description: string;
  date_display: string;
  dl: string;
  content_blocks: AnnonceContentBlock[];
  date_debut: string;
  date_fin: string | null;
  lieu: string;
  affiche_url: string | null;
  image_url: string | null;
  cta_url: string;
  est_phare: boolean;
  featured_eyebrow: string;
  featured_meta: { lbl: string; val: string }[];
  statut_temporel: AnnonceStatut;
  publie_le: string | null;
}

function toAnnonce(raw: RawAnnonce): Annonce {
  return {
    id: raw.slug || raw.id, // la vitrine route par "id" mais en pratique c'est le slug
    titre: raw.titre,
    titreEm: raw.titre_em || undefined,
    statut: raw.statut_temporel,
    type: raw.type,
    sousType: raw.sous_type || undefined,
    sousTypeLabel: raw.sous_type_label || undefined,
    // Le backend renvoie un datetime ISO complet ; la vitrine attend une date
    // simple « YYYY-MM-DD » (les formatteurs font `new Date(date + 'T12:00:00')`,
    // ce qui casse avec un datetime complet → « Invalid Date NaN »).
    date: raw.date_debut ? raw.date_debut.slice(0, 10) : '',
    dateFin: raw.date_fin ? raw.date_fin.slice(0, 10) : undefined,
    dl: raw.dl || undefined,
    dateDisplay: raw.date_display || undefined,
    lieu: raw.lieu,
    description: raw.description,
    image: raw.image_url || undefined,
    affiche: raw.affiche_url || undefined,
    contentBlocks: raw.content_blocks?.length ? raw.content_blocks : undefined,
    estPhare: raw.est_phare || undefined,
    featuredEyebrow: raw.featured_eyebrow || undefined,
    featuredMeta: raw.featured_meta?.length ? raw.featured_meta : undefined,
    ctaUrl: raw.cta_url || undefined,
  };
}

export async function fetchAnnonces(
  opts: { lang?: 'fr' | 'en'; signal?: AbortSignal } = {},
): Promise<Annonce[]> {
  const lang = opts.lang ?? 'fr';
  const data = await apiGet<Paginated<RawAnnonce>>('/annonces/', {
    signal: opts.signal,
    query: { lang, page_size: 100 },
  });
  return data.results.map(toAnnonce);
}
