/**
 * Hooks Genèse — chargement de toutes les pages d'archives + accès par slug.
 *
 * **Mode strict** : en mode API (`VITE_API_BASE_URL` défini), aucun fallback
 * static. Tant que l'API n'a pas répondu (ou en cas d'erreur), `data` reste
 * vide et les pages consommatrices doivent afficher un état de chargement
 * ou un message d'erreur.
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { GenesePage } from '../types';
import { API_ENABLED } from '../api/client';
import { fetchGenesePages } from '../api/genese';

let cacheByLang: Record<string, GenesePage[]> = {};

export type DataStatus = 'loading' | 'success' | 'error';

export interface UseGenesePagesResult {
  data: GenesePage[];
  status: DataStatus;
  error: string | null;
}

export function useGenesePages(): UseGenesePagesResult {
  const { i18n } = useTranslation();
  const lang: 'fr' | 'en' = i18n.language === 'en' ? 'en' : 'fr';

  const [state, setState] = useState<UseGenesePagesResult>(() => ({
    data: cacheByLang[lang] ?? [],
    status: API_ENABLED && !cacheByLang[lang] ? 'loading' : 'success',
    error: null,
  }));

  useEffect(() => {
    if (!API_ENABLED) return;
    if (cacheByLang[lang]) {
      setState({ data: cacheByLang[lang], status: 'success', error: null });
      return;
    }
    const controller = new AbortController();
    let cancelled = false;
    setState((prev) => ({ ...prev, status: 'loading', error: null }));
    fetchGenesePages({ lang, signal: controller.signal })
      .then((data) => {
        if (cancelled) return;
        cacheByLang = { ...cacheByLang, [lang]: data };
        setState({ data, status: 'success', error: null });
      })
      .catch((err: Error) => {
        if (cancelled) return;
        if (err.name === 'AbortError') return;
        console.warn('[useGenesePages] API indisponible :', err.message);
        setState({ data: [], status: 'error', error: err.message });
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [lang]);

  return state;
}

/**
 * Renvoie la page Genèse correspondant au slug.
 *   - En mode API : `null` tant que l'API n'a pas chargé. Aucun fallback static.
 *   - En mode legacy (pas d'API configurée) : utilise le `fallback` static fourni.
 */
export function useGenesePage(
  slug: string,
  fallback: GenesePage,
): GenesePage | null {
  const { data } = useGenesePages();
  const found = data.find((p) => p.slug === slug);
  if (found) return found;
  return API_ENABLED ? null : fallback;
}
