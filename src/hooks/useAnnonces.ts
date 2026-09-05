/** Hook Annonces — mode API strict, pas de fallback static. */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { Annonce } from '../types';
import { API_ENABLED } from '../api/client';
import { fetchAnnonces } from '../api/annonces';

export type DataStatus = 'loading' | 'success' | 'error';

export interface UseAnnoncesResult {
  data: Annonce[];
  status: DataStatus;
  error: string | null;
}

export function useAnnonces(): UseAnnoncesResult {
  const { i18n } = useTranslation();
  const lang: 'fr' | 'en' = i18n.language === 'en' ? 'en' : 'fr';

  const [state, setState] = useState<UseAnnoncesResult>(() => ({
    data: [],
    status: API_ENABLED ? 'loading' : 'success',
    error: null,
  }));

  useEffect(() => {
    if (!API_ENABLED) return;
    const controller = new AbortController();
    let cancelled = false;
    setState((prev) => ({ ...prev, status: 'loading', error: null }));
    fetchAnnonces({ lang, signal: controller.signal })
      .then((data) => {
        if (cancelled) return;
        setState({ data, status: 'success', error: null });
      })
      .catch((err: Error) => {
        if (cancelled) return;
        if (err.name === 'AbortError') return;
        console.warn('[useAnnonces] API indisponible :', err.message);
        setState({ data: [], status: 'error', error: err.message });
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [lang]);

  return state;
}
