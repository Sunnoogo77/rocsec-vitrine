/**
 * Fetcher VlogSemaine — singleton effectif (le vlog publié actif).
 *
 * Le backend renvoie une liste paginée des vlogs publiés ordonnés par date
 * desc. La vitrine ne consomme que le PREMIER (le plus récent). Singleton de
 * fait, grâce à la `UniqueConstraint` partielle côté Django qui garantit un
 * seul vlog avec statut=publie.
 *
 * Transformations :
 *  - aplatit `traduction` (selon `?lang=fr`) dans les champs racine attendus
 *    par la vitrine (titreMessage, pitchMessage, verset, filDuMessage…)
 *  - formate `heure_culte` (TimeField "19:30:00") en "19H30"
 *  - dénormalise `cantique_semaine_detail` vers `cantiqueSemaine`
 *  - dénormalise `temoignageSemaine` depuis la traduction
 */

import type { VlogSemaine } from '../types';
import { apiGet, type Paginated } from './client';

interface RawTraduction {
  langue: 'fr' | 'en';
  titre_message: string;
  titre_suffix: string;
  pitch_message: string;
  serie: string;
  predicateur_libelle: string;
  verset_reference: string;
  verset_texte: string;
  fil_paragraphe1: string;
  fil_paragraphe2: string;
  fil_versets: string[];
  temoignage_auteur: string;
  temoignage_texte: string;
}

interface RawCantiqueSemaine {
  id: string;
  slug: string;
  numero: string;
  titre: string;
  soliste: string;
  youtube_url: string;
  audio_url: string;
  vues_count: number;
  date_enregistrement: string;
}

interface RawVlog {
  id: string;
  date_culte: string;
  heure_culte: string;
  sermon: string | null;
  sermon_detail: unknown;
  cantique_semaine: string | null;
  cantique_semaine_detail: RawCantiqueSemaine | null;
  poster_url: string | null;
  replay_url: string;
  publie_le: string | null;
  traduction: RawTraduction | null;
}

function formatHeure(time: string): string {
  // "19:30:00" → "19H30"
  const [hh = '00', mm = '00'] = (time ?? '').split(':');
  return `${hh.padStart(2, '0')}H${mm.padStart(2, '0')}`;
}

function toVlogSemaine(raw: RawVlog): VlogSemaine {
  const t = raw.traduction;
  const c = raw.cantique_semaine_detail;
  return {
    date: raw.date_culte,
    titreMessage: t?.titre_message ?? '',
    titreSuffix: t?.titre_suffix || undefined,
    pitchMessage: t?.pitch_message ?? '',
    serie: t?.serie ?? '',
    predicateur: t?.predicateur_libelle ?? '',
    heureCulte: formatHeure(raw.heure_culte),
    verset: {
      reference: t?.verset_reference ?? '',
      texte: t?.verset_texte ?? '',
    },
    poster: raw.poster_url ?? undefined,
    replayUrl: raw.replay_url || undefined,
    filDuMessage: {
      paragraphe1: t?.fil_paragraphe1 ?? '',
      paragraphe2: t?.fil_paragraphe2 ?? '',
      versets: t?.fil_versets ?? [],
    },
    cantiqueSemaine: {
      titre: c?.titre ?? '',
      soliste: c?.soliste ?? '',
      videoUrl: c?.youtube_url || undefined,
      audioUrl: c?.audio_url || undefined,
      vuesCount:
        c?.vues_count !== undefined && c?.vues_count > 0
          ? `${c.vues_count.toLocaleString('fr-FR')} vues`
          : undefined,
      dateEnregistrement: c?.date_enregistrement || undefined,
    },
    temoignageSemaine: {
      auteur: t?.temoignage_auteur ?? '',
      texte: t?.temoignage_texte ?? '',
    },
  };
}

export async function fetchVlogSemaine(
  opts: { lang?: 'fr' | 'en'; signal?: AbortSignal } = {},
): Promise<VlogSemaine | null> {
  const lang = opts.lang ?? 'fr';
  const data = await apiGet<Paginated<RawVlog>>('/vlog-semaine/', {
    signal: opts.signal,
    query: { lang },
  });
  const first = data.results[0];
  return first ? toVlogSemaine(first) : null;
}
