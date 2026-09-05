/** Hook ImagesSemaine — mode API strict, pas de fallback static. */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { ImageSemaine } from '../types';
import { API_ENABLED } from '../api/client';
import { fetchImagesSemaine } from '../api/imagesSemaine';

export type DataStatus = 'loading' | 'success' | 'error';

export interface UseImagesSemaineResult {
  data: ImageSemaine[];
  status: DataStatus;
  error: string | null;
}

export function useImagesSemaine(): UseImagesSemaineResult {
  const { i18n } = useTranslation();
  const lang: 'fr' | 'en' = i18n.language === 'en' ? 'en' : 'fr';

  const [state, setState] = useState<UseImagesSemaineResult>(() => ({
    data: [],
    status: API_ENABLED ? 'loading' : 'success',
    error: null,
  }));

  useEffect(() => {
    if (!API_ENABLED) return;
    const controller = new AbortController();
    let cancelled = false;
    setState((prev) => ({ ...prev, status: 'loading', error: null }));
    fetchImagesSemaine({ lang, signal: controller.signal })
      .then((data) => {
        if (cancelled) return;
        setState({ data, status: 'success', error: null });
      })
      .catch((err: Error) => {
        if (cancelled) return;
        if (err.name === 'AbortError') return;
        console.warn('[useImagesSemaine] API indisponible :', err.message);
        setState({ data: [], status: 'error', error: err.message });
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [lang]);

  return state;
}
