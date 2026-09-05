/**
 * Hook React pour le mot du pasteur — mode API strict.
 *
 *   - Initial: null (vide). Pas de fallback static.
 *   - Succès: HTML riche fourni par l'admin.
 *   - Erreur ou vide: null → la page affiche la photo du pasteur seule + un
 *     placeholder textuel inline.
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { API_ENABLED } from '../api/client';
import { fetchMotDuPasteur, type MotDuPasteurDisplay } from '../api/motDuPasteur';

export type DataStatus = 'loading' | 'success' | 'error';

export interface UseMotDuPasteurResult {
  data: MotDuPasteurDisplay | null;
  status: DataStatus;
  error: string | null;
}

export function useMotDuPasteur(): UseMotDuPasteurResult {
  const { i18n } = useTranslation();
  const lang: 'fr' | 'en' = i18n.language === 'en' ? 'en' : 'fr';

  const [state, setState] = useState<UseMotDuPasteurResult>(() => ({
    data: null,
    status: API_ENABLED ? 'loading' : 'success',
    error: null,
  }));

  useEffect(() => {
    if (!API_ENABLED) return;
    const controller = new AbortController();
    let cancelled = false;
    setState((prev) => ({ ...prev, status: 'loading', error: null }));
    fetchMotDuPasteur({ lang, signal: controller.signal })
      .then((data) => {
        if (cancelled) return;
        setState({ data, status: 'success', error: null });
      })
      .catch((err: Error) => {
        if (cancelled) return;
        if (err.name === 'AbortError') return;
        console.warn('[useMotDuPasteur] API indisponible :', err.message);
        setState({ data: null, status: 'error', error: err.message });
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [lang]);

  return state;
}
