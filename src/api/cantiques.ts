/**
 * Fetcher Cantique + SessionAdoration.
 *
 * Transformations majeures :
 *   - famille (objet nested) → famille.code (CantiqueFamille string)
 *   - youtube_url + audio_url depuis traduction (publique : déjà aplati)
 *   - occurrences[].video_url → videoUrl, etc.
 *   - sessions : cantiques_contenus dénormalisés
 */

import type {
  Cantique,
  CantiqueFamille,
  CantiqueOccurrence,
  SessionAdoration,
  VerseBlock,
} from '../types';
import { apiGet, type Paginated } from './client';

interface RawFamille { code: string; libelle_fr: string }

interface RawOccurrence {
  id: number;
  video_url: string;
  start_sec: number | null;
  end_sec: number | null;
  interpretes: string[];
  interpretes_libelle: string;
  contexte: string;
  date_evenement: string | null;
  session_adoration: string | null;
  session_adoration_slug: string | null;
}

interface RawEvenement {
  id: string;
  nom_fr: string;
  nom_en: string;
  date_evenement: string | null;
  close: boolean;
}

interface RawGroupePersonnes {
  id: string;
  nom_fr: string;
  nom_en: string;
}

interface RawPassage {
  id?: number;
  ordre: number;
  titre: string;
  start_sec: number;
  end_sec: number | null;
  interpretes_libelle: string;
  lyrics?: VerseBlock[];
}

interface RawCantique {
  id: string;
  slug: string;
  numero: string;
  numero_recueil: number | null;
  famille: RawFamille | null;
  evenement: RawEvenement | null;
  titre: string;
  titre_em: string;
  detail_by: string;
  youtube_url: string;
  audio_url: string;
  pdf_url: string;
  lyrics: VerseBlock[];
  interpretes: { id: string; libelle: string }[];
  interpretes_libelle: string;
  interprete_lead?: { id: string; libelle: string } | null;
  groupes_interpretes?: RawGroupePersonnes[];
  est_medley?: boolean;
  passages?: RawPassage[];
  occurrences: RawOccurrence[];
  duration: string;
  recording_type: 'studio' | 'culte' | 'live' | '';
  recorded_at: string;
  date_enregistrement: string;
  /** Date « finale » résolue côté backend : prend la `date_evenement` de
   *  l'événement rattaché en priorité, sinon `recorded_at` ou `date_enregistrement`. */
  date_effective?: string;
  est_vedette: boolean;
  publie_le: string | null;
}

function toOccurrence(raw: RawOccurrence): CantiqueOccurrence {
  return {
    id: String(raw.id),
    videoUrl: raw.video_url,
    startSec: raw.start_sec ?? undefined,
    endSec: raw.end_sec ?? undefined,
    interpretes: raw.interpretes,
    contexte: raw.contexte || undefined,
    dateEvenement: raw.date_evenement || undefined,
    sessionId: raw.session_adoration_slug || undefined,
  };
}

function toCantique(raw: RawCantique, lang: 'fr' | 'en' = 'fr'): Cantique {
  // Le libellé d'interprètes affiché côté vitrine reproduit la logique backend :
  // si lead désigné → "<lead> · acc. <autres>", sinon parité.
  // L'override `interpretes_libelle` reste prioritaire.
  const groupesNames = (raw.groupes_interpretes ?? []).map((g) =>
    lang === 'en' && g.nom_en ? g.nom_en : g.nom_fr,
  );
  const leadId = raw.interprete_lead?.id;
  const leadLabel = raw.interprete_lead?.libelle ?? '';
  const personnesAutres = (raw.interpretes ?? [])
    .filter((p) => p.id !== leadId)
    .map((p) => p.libelle);
  const autres = [...groupesNames, ...personnesAutres].filter(Boolean);
  let interpretesLibelles: string;
  if (raw.interpretes_libelle) {
    interpretesLibelles = raw.interpretes_libelle;
  } else if (leadLabel) {
    interpretesLibelles = autres.length > 0
      ? `${leadLabel} · acc. ${autres.join(' · ')}`
      : leadLabel;
  } else {
    interpretesLibelles = autres.join(' · ');
  }
  return {
    id: raw.slug || raw.id,
    slug: raw.slug,
    numero: raw.numero,
    numeroRecueil: raw.numero_recueil ?? undefined,
    titre: raw.titre,
    titleEm: raw.titre_em || undefined,
    famille: (raw.famille?.code as CantiqueFamille) ?? 'special',
    evenement: raw.evenement
      ? {
          id: raw.evenement.id,
          nom: lang === 'en' && raw.evenement.nom_en ? raw.evenement.nom_en : raw.evenement.nom_fr,
          date: raw.evenement.date_evenement ?? undefined,
          close: raw.evenement.close,
        }
      : undefined,
    groupesInterpretes:
      raw.groupes_interpretes && raw.groupes_interpretes.length > 0
        ? raw.groupes_interpretes.map((g) => ({
            id: g.id,
            nom: lang === 'en' && g.nom_en ? g.nom_en : g.nom_fr,
          }))
        : undefined,
    leadInterprete: leadLabel || undefined,
    estMedley: raw.est_medley ?? false,
    passages:
      raw.passages && raw.passages.length > 0
        ? raw.passages.map((p) => ({
            ordre: p.ordre,
            titre: p.titre,
            startSec: p.start_sec,
            endSec: p.end_sec ?? undefined,
            interpretesLibelle: p.interpretes_libelle || undefined,
            lyrics: p.lyrics && p.lyrics.length > 0 ? p.lyrics : undefined,
          }))
        : undefined,
    solisteOuChoeur: interpretesLibelles,
    detailBy: raw.detail_by || undefined,
    // Date effective : héritée de l'événement si rattachement, sinon
    // recorded_at / date_enregistrement (résolution faite côté backend).
    dateEnregistrement: raw.date_effective || raw.date_enregistrement || undefined,
    recordedAt: raw.date_effective || raw.recorded_at || undefined,
    duration: raw.duration || undefined,
    recordingType: raw.recording_type || undefined,
    videoUrl: raw.youtube_url || undefined,
    audioUrl: raw.audio_url || undefined,
    pdfUrl: raw.pdf_url || undefined,
    estVedette: raw.est_vedette || undefined,
    lyrics: raw.lyrics?.length ? raw.lyrics : undefined,
    occurrences: raw.occurrences?.length
      ? raw.occurrences.map(toOccurrence)
      : undefined,
  };
}

export async function fetchCantiques(
  opts: { lang?: 'fr' | 'en'; signal?: AbortSignal } = {},
): Promise<Cantique[]> {
  const lang = opts.lang ?? 'fr';
  const data = await apiGet<Paginated<RawCantique>>('/cantiques/', {
    signal: opts.signal,
    query: { lang, page_size: 200 },
  });
  return data.results.map((r) => toCantique(r, lang));
}

/* ============================================================
   Sessions d'adoration
============================================================ */

interface RawSessionCantique {
  id: number;
  cantique: string;
  cantique_slug: string;
  cantique_titre: string;
  ordre: number;
  start_sec: number;
  end_sec: number | null;
  titre_dans_session: string;
}

interface RawSessionAdoration {
  id: string;
  slug: string;
  date: string;
  video_url: string;
  audio_url: string;
  duree_minutes: number | null;
  evenement: string;
  thumbnail_url: string;
  interpretes: { id: string; libelle: string }[];
  interpretes_libelle: string;
  titre: string;
  description: string;
  cantiques_contenus: RawSessionCantique[];
  publie_le: string | null;
}

function toSessionAdoration(raw: RawSessionAdoration): SessionAdoration {
  const interpretes = raw.interpretes_libelle
    ? [raw.interpretes_libelle]
    : (raw.interpretes ?? []).map((p) => p.libelle);
  return {
    id: raw.id,
    slug: raw.slug,
    titre: raw.titre,
    date: raw.date,
    videoUrl: raw.video_url,
    dureeMinutes: raw.duree_minutes ?? undefined,
    evenement: raw.evenement || undefined,
    thumbnail: raw.thumbnail_url || undefined,
    interpretes,
    cantiquesContenus: raw.cantiques_contenus?.length
      ? raw.cantiques_contenus
          .sort((a, b) => a.ordre - b.ordre)
          .map((c) => ({
            cantiqueId: c.cantique_slug || String(c.cantique),
            titre: c.cantique_titre,
            startSec: c.start_sec,
            endSec: c.end_sec ?? undefined,
          }))
      : undefined,
  };
}

export async function fetchSessionsAdoration(
  opts: { lang?: 'fr' | 'en'; signal?: AbortSignal } = {},
): Promise<SessionAdoration[]> {
  const lang = opts.lang ?? 'fr';
  const data = await apiGet<Paginated<RawSessionAdoration>>('/sessions-adoration/', {
    signal: opts.signal,
    query: { lang, page_size: 100 },
  });
  return data.results.map(toSessionAdoration);
}
