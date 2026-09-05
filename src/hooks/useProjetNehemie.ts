/**
 * Hook React pour le projet Néhémie — mode API strict, pas de fallback static.
 *
 * Renvoie `data: ProjetNehemie | null`. La page consommatrice combine elle-même
 * avec son squelette statique (objectif, batisseurs, montants, modes de don,
 * photos du sanctuaire) et n'utilise l'API que pour les champs réellement
 * dynamiques (essentiellement `collecte` et `miseAJour`).
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { ProjetNehemie } from '../types';
import { API_ENABLED } from '../api/client';
import { fetchProjetNehemie } from '../api/nehemie';

export type DataStatus = 'loading' | 'success' | 'error';

export interface UseProjetNehemieResult {
  data: ProjetNehemie | null;
  status: DataStatus;
  error: string | null;
}

export function useProjetNehemie(): UseProjetNehemieResult {
  const { i18n } = useTranslation();
  const lang: 'fr' | 'en' = i18n.language === 'en' ? 'en' : 'fr';

  const [state, setState] = useState<UseProjetNehemieResult>(() => ({
    data: null,
    status: API_ENABLED ? 'loading' : 'success',
    error: null,
  }));

  useEffect(() => {
    if (!API_ENABLED) return;
    const controller = new AbortController();
    let cancelled = false;
    setState((prev) => ({ ...prev, status: 'loading', error: null }));
    fetchProjetNehemie({ lang, signal: controller.signal })
      .then((data) => {
        if (cancelled) return;
        setState({ data, status: 'success', error: null });
      })
      .catch((err: Error) => {
        if (cancelled) return;
        if (err.name === 'AbortError') return;
        console.warn('[useProjetNehemie] API indisponible :', err.message);
        setState({ data: null, status: 'error', error: err.message });
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [lang]);

  return state;
}
