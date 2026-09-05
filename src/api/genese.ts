/**
 * Fetcher GenesePage. Le backend renvoie une page avec ses blocs polymorphes
 * dans la traduction choisie (?lang). La vitrine attend un shape légèrement
 * différent : `publieLe` (camelCase), `titreEm`, `sousTitre`.
 */

import type { GenesePage, GeneseBlock } from '../types';
import { apiGet, type Paginated } from './client';

interface RawBloc {
  id: number;
  ordre: number;
  kind: GeneseBlock['kind'];
  content: string;
  level: number | null;
  source: string;
  reference: string;
  text: string;
  src: string;
  alt: string;
  caption: string;
  items: { auteur: string; recit: string }[];
}

interface RawGenesePage {
  id: string;
  slug: string;
  type: 'pilier' | 'evenement';
  ordre: number;
  publie_le_editorial: string | null;
  titre: string;
  titre_em: string;
  eyebrow: string;
  sous_titre: string;
  blocs: RawBloc[];
  publie_le: string | null;
}

function toBloc(raw: RawBloc): GeneseBlock {
  const out: GeneseBlock = { kind: raw.kind };
  if (raw.content) out.content = raw.content;
  if (raw.level === 2 || raw.level === 3) out.level = raw.level;
  if (raw.source) out.source = raw.source;
  if (raw.reference) out.reference = raw.reference;
  if (raw.text) out.text = raw.text;
  if (raw.src) out.src = raw.src;
  if (raw.alt) out.alt = raw.alt;
  if (raw.caption) out.caption = raw.caption;
  if (raw.items?.length) out.items = raw.items;
  return out;
}

function toGenesePage(raw: RawGenesePage): GenesePage {
  return {
    id: raw.slug,
    slug: raw.slug,
    titre: raw.titre,
    titreEm: raw.titre_em || undefined,
    eyebrow: raw.eyebrow,
    sousTitre: raw.sous_titre || undefined,
    publieLe: raw.publie_le_editorial || raw.publie_le || '',
    blocs: (raw.blocs ?? [])
      .slice()
      .sort((a, b) => a.ordre - b.ordre)
      .map(toBloc),
  };
}

export async function fetchGenesePages(
  opts: { lang?: 'fr' | 'en'; signal?: AbortSignal } = {},
): Promise<GenesePage[]> {
  const lang = opts.lang ?? 'fr';
  const data = await apiGet<Paginated<RawGenesePage> | RawGenesePage[]>(
    '/genese/',
    { signal: opts.signal, query: { lang } },
  );
  // Le viewset Genese a `pagination_class = None` donc renvoie une liste
  // plate. Tolérer aussi le format paginé au cas où.
  const list = Array.isArray(data) ? data : data.results;
  return list.map(toGenesePage);
}
