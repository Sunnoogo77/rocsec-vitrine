/** Hooks Cantiques & SessionsAdoration — mode API strict, pas de fallback static. */

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { Cantique, SessionAdoration } from '../types';
import { API_ENABLED } from '../api/client';
import { fetchCantiques, fetchSessionsAdoration } from '../api/cantiques';

export type DataStatus = 'loading' | 'success' | 'error';

export interface UseCantiquesResult {
  data: Cantique[];
  counts: { tous: number; recueil: number; special: number; adoration: number };
  status: DataStatus;
  error: string | null;
}

function computeCounts(list: Cantique[]) {
  return {
    tous: list.length,
    recueil: list.filter((c) => c.famille === 'recueil').length,
    special: list.filter((c) => c.famille === 'special').length,
    adoration: list.filter((c) => c.famille === 'adoration').length,
  };
}

export function useCantiques(): UseCantiquesResult {
  const { i18n } = useTranslation();
  const lang: 'fr' | 'en' = i18n.language === 'en' ? 'en' : 'fr';

  const [data, setData] = useState<Cantique[]>([]);
  const [status, setStatus] = useState<DataStatus>(API_ENABLED ? 'loading' : 'success');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!API_ENABLED) return;
    const controller = new AbortController();
    let cancelled = false;
    setStatus('loading');
    setError(null);
    fetchCantiques({ lang, signal: controller.signal })
      .then((d) => {
        if (cancelled) return;
        setData(d);
        setStatus('success');
      })
      .catch((err: Error) => {
        if (cancelled) return;
        if (err.name === 'AbortError') return;
        console.warn('[useCantiques] API indisponible :', err.message);
        setData([]);
        setStatus('error');
        setError(err.message);
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [lang]);

  const counts = useMemo(() => computeCounts(data), [data]);
  return { data, counts, status, error };
}

export interface UseSessionsAdorationResult {
  data: SessionAdoration[];
  status: DataStatus;
  error: string | null;
}

export function useSessionsAdoration(): UseSessionsAdorationResult {
  const { i18n } = useTranslation();
  const lang: 'fr' | 'en' = i18n.language === 'en' ? 'en' : 'fr';

  const [state, setState] = useState<UseSessionsAdorationResult>(() => ({
    data: [],
    status: API_ENABLED ? 'loading' : 'success',
    error: null,
  }));

  useEffect(() => {
    if (!API_ENABLED) return;
    const controller = new AbortController();
    let cancelled = false;
    setState((prev) => ({ ...prev, status: 'loading', error: null }));
    fetchSessionsAdoration({ lang, signal: controller.signal })
      .then((data) => {
        if (cancelled) return;
        setState({ data, status: 'success', error: null });
      })
      .catch((err: Error) => {
        if (cancelled) return;
        if (err.name === 'AbortError') return;
        console.warn('[useSessionsAdoration] API indisponible :', err.message);
        setState({ data: [], status: 'error', error: err.message });
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [lang]);

  return state;
}
