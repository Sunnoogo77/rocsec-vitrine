/** Hook VlogSemaine — singleton, mode API strict, pas de fallback static.
 *  `data` est null tant que l'API n'a pas répondu (ou en cas d'erreur / vlog non publié). */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { VlogSemaine } from '../types';
import { API_ENABLED } from '../api/client';
import { fetchVlogSemaine } from '../api/vlogSemaine';

export type DataStatus = 'loading' | 'success' | 'error';

export interface UseVlogSemaineResult {
  data: VlogSemaine | null;
  status: DataStatus;
  error: string | null;
}

export function useVlogSemaine(): UseVlogSemaineResult {
  const { i18n } = useTranslation();
  const lang: 'fr' | 'en' = i18n.language === 'en' ? 'en' : 'fr';

  const [state, setState] = useState<UseVlogSemaineResult>(() => ({
    data: null,
    status: API_ENABLED ? 'loading' : 'success',
    error: null,
  }));

  useEffect(() => {
    if (!API_ENABLED) return;
    const controller = new AbortController();
    let cancelled = false;
    setState((prev) => ({ ...prev, status: 'loading', error: null }));
    fetchVlogSemaine({ lang, signal: controller.signal })
      .then((data) => {
        if (cancelled) return;
        setState({ data, status: 'success', error: null });
      })
      .catch((err: Error) => {
        if (cancelled) return;
        if (err.name === 'AbortError') return;
        console.warn('[useVlogSemaine] API indisponible :', err.message);
        setState({ data: null, status: 'error', error: err.message });
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [lang]);

  return state;
}
