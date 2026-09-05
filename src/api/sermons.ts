/**
 * Fetcher Sermon. Le backend renvoie un payload riche (serie nested, predicateur
 * nested via Personne, type_culte nested via TypeCulte). La vitrine attend un
 * shape aplati (predicateur en string, typeCulte en code).
 *
 * Conversions importantes :
 *   - `date_culte` ISO datetime → `date` (jour ISO) + `heure` ("19H30")
 *   - `duree_minutes` int → `duree` ("1H 28MIN")
 *   - `type_culte.code` → `typeCulte`
 *   - `predicateur.libelle` → `predicateur`
 *   - `serie.titre_fr` → `serie` (string)
 */

import type { PassageBiblique, CitationBranham, PlanItem, Sermon, TypeCulte } from '../types';
import { apiGet, type Paginated } from './client';

interface RawType { code: string; libelle_fr: string }
interface RawPersonne { id: string; libelle: string }
interface RawSerie { id: string; titre_fr: string }

interface RawSermon {
  id: string;
  slug: string;
  titre: string;
  titre_em: string;
  description_courte: string;
  youtube_url: string;
  serie: RawSerie | null;
  numero_dans_serie: number | null;
  date_culte: string;
  type_culte: RawType | null;
  predicateur: RawPersonne | null;
  duree_minutes: number | null;
  thumbnail_url: string;
  audio_url: string;
  passages: PassageBiblique[];
  citations_branham: CitationBranham[];
  plan: PlanItem[];
  publie_le: string | null;
}

function formatHeure(iso: string): string {
  // ISO datetime "2026-04-26T19:30:00+00:00" → "19H30" (local heuristique)
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}H${mm}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  return d.toISOString().slice(0, 10);
}

function formatDuree(minutes: number | null): string | undefined {
  if (!minutes || minutes <= 0) return undefined;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}MIN`;
  return `${h}H ${String(m).padStart(2, '0')}MIN`;
}

function toSermon(raw: RawSermon): Sermon {
  return {
    id: raw.slug || raw.id,
    titre: raw.titre,
    titleEm: raw.titre_em || undefined,
    // Pas de fallback hardcodé : si l'admin n'a pas assigné de série,
    // la vitrine n'affichera pas de série du tout (chaîne vide).
    serie: raw.serie?.titre_fr ?? '',
    numeroSerie: raw.numero_dans_serie ?? undefined,
    date: formatDate(raw.date_culte),
    heure: formatHeure(raw.date_culte),
    predicateur: raw.predicateur?.libelle ?? '',
    duree: formatDuree(raw.duree_minutes),
    typeCulte: (raw.type_culte?.code as TypeCulte | undefined) ?? undefined,
    thumbnail: raw.thumbnail_url || undefined,
    description: raw.description_courte || undefined,
    videoUrl: raw.youtube_url || undefined,
    audioUrl: raw.audio_url || undefined,
    passages: raw.passages ?? [],
    citationsBranham: raw.citations_branham ?? [],
    plan: raw.plan ?? [],
  };
}

export async function fetchSermons(
  opts: { lang?: 'fr' | 'en'; signal?: AbortSignal } = {},
): Promise<Sermon[]> {
  const lang = opts.lang ?? 'fr';
  const data = await apiGet<Paginated<RawSermon>>('/sermons/', {
    signal: opts.signal,
    query: { lang, page_size: 100 },
  });
  return data.results.map(toSermon);
}
