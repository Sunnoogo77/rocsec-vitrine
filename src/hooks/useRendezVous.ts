/**
 * Hook React pour récupérer la liste des `RendezVous` (horaires de cultes).
 *
 * **Mode strict** (sur cette branche `feat/api-wiring`) :
 *   - Si `VITE_API_BASE_URL` est défini → l'API est la SEULE source de vérité.
 *     Aucun fallback static : si le backend ne répond pas, on retourne [].
 *     Cela permet de vérifier visuellement que la connexion API marche.
 *   - Si `VITE_API_BASE_URL` n'est PAS défini (prod GitHub Pages actuelle) →
 *     on utilise les données statiques (`src/data/rendez-vous.ts`).
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { RendezVous } from '../types';
import { rendezVous as staticRendezVous } from '../data/rendez-vous';
import { API_ENABLED } from '../api/client';
import { fetchRendezVous } from '../api/rendezVous';

export type DataStatus = 'loading' | 'success' | 'error';

export interface UseRendezVousResult {
  data: RendezVous[];
  status: DataStatus;
  error: string | null;
}

export function useRendezVous(): UseRendezVousResult {
  const { i18n } = useTranslation();
  const lang: 'fr' | 'en' = i18n.language === 'en' ? 'en' : 'fr';

  const [state, setState] = useState<UseRendezVousResult>(() => ({
    data: API_ENABLED ? [] : staticRendezVous,
    status: API_ENABLED ? 'loading' : 'success',
    error: null,
  }));

  useEffect(() => {
    if (!API_ENABLED) return;

    const controller = new AbortController();
    let cancelled = false;

    setState((prev) => ({ ...prev, status: 'loading', error: null }));

    fetchRendezVous({ lang, signal: controller.signal })
      .then((data) => {
        if (cancelled) return;
        setState({ data, status: 'success', error: null });
      })
      .catch((err: Error) => {
        if (cancelled) return;
        if (err.name === 'AbortError') return;
        console.warn('[useRendezVous] API indisponible :', err.message);
        setState({ data: [], status: 'error', error: err.message });
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [lang]);

  return state;
}
