/**
 * Hook React pour la liste des sermons (prédications).
 *
 * **Mode API strict** sur la branche `feat/api-wiring` :
 *   - `data` initial = []. Pas de fallback static.
 *   - Succès API : remplace par les données fraîches.
 *   - Erreur API : reste []. La page consommatrice affiche un placeholder
 *     inline dans la section concernée (le squelette de la page reste visible).
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { Sermon } from '../types';
import { API_ENABLED } from '../api/client';
import { fetchSermons } from '../api/sermons';

export type DataStatus = 'loading' | 'success' | 'error';

export interface UseSermonsResult {
  data: Sermon[];
  status: DataStatus;
  error: string | null;
}

export function useSermons(): UseSermonsResult {
  const { i18n } = useTranslation();
  const lang: 'fr' | 'en' = i18n.language === 'en' ? 'en' : 'fr';

  const [state, setState] = useState<UseSermonsResult>(() => ({
    data: [],
    status: API_ENABLED ? 'loading' : 'success',
    error: null,
  }));

  useEffect(() => {
    if (!API_ENABLED) return;
    const controller = new AbortController();
    let cancelled = false;
    setState((prev) => ({ ...prev, status: 'loading', error: null }));
    fetchSermons({ lang, signal: controller.signal })
      .then((data) => {
        if (cancelled) return;
        setState({ data, status: 'success', error: null });
      })
      .catch((err: Error) => {
        if (cancelled) return;
        if (err.name === 'AbortError') return;
        console.warn('[useSermons] API indisponible :', err.message);
        setState({ data: [], status: 'error', error: err.message });
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [lang]);

  return state;
}
