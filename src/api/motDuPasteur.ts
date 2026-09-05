/**
 * Fetcher MotDuPasteur — singleton éditorial alimenté par l'admin.
 */

import { apiGet } from './client';

export interface MotDuPasteurApi {
  texte_html_fr: string;
  texte_html_en: string;
  signature_fr: string;
  signature_en: string;
  modifie_le: string;
}

export interface MotDuPasteurDisplay {
  /** HTML du mot dans la langue choisie (FR fallback si EN vide). */
  texte_html: string;
  signature: string;
}

export async function fetchMotDuPasteur(
  opts: { lang?: 'fr' | 'en'; signal?: AbortSignal } = {},
): Promise<MotDuPasteurDisplay | null> {
  const data = await apiGet<MotDuPasteurApi>('/mot-du-pasteur/', {
    signal: opts.signal,
  });
  const lang = opts.lang ?? 'fr';
  const texte_html =
    lang === 'en' && data.texte_html_en ? data.texte_html_en : data.texte_html_fr;
  const signature =
    lang === 'en' && data.signature_en ? data.signature_en : data.signature_fr;
  if (!texte_html.trim()) return null; // pas encore saisi par l'admin
  return { texte_html, signature };
}
