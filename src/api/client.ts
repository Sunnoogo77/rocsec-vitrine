/** Public API client. API failures are shown by the consuming routes. */

const RAW_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';
const BASE = RAW_BASE.replace(/\/$/, '');

/** True si une URL d'API a été configurée via VITE_API_BASE_URL. */
export const API_ENABLED = BASE.length > 0;

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

interface GetOptions {
  signal?: AbortSignal;
  query?: Record<string, string | number | boolean | undefined>;
}

/**
 * GET typé. Lève `ApiError` sur statut HTTP ≥ 400 ou si l'API est désactivée.
 * Les hooks affichent un état vide ou une erreur en cas d’indisponibilité.
 */
export async function apiGet<T>(path: string, opts: GetOptions = {}): Promise<T> {
  if (!API_ENABLED) {
    throw new ApiError('API désactivée (VITE_API_BASE_URL non défini)', 0);
  }

  const url = new URL(`${BASE}${path.startsWith('/') ? path : `/${path}`}`, window.location.origin);
  if (opts.query) {
    for (const [key, value] of Object.entries(opts.query)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: opts.signal,
      credentials: 'omit',
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    throw new ApiError(`Network error: ${(err as Error).message}`, 0);
  }

  if (!response.ok) {
    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      /* corps non JSON */
    }
    throw new ApiError(
      `API ${response.status} ${response.statusText}`,
      response.status,
      payload,
    );
  }

  return (await response.json()) as T;
}

/** Format DRF standard pour les listes paginées. */
export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/**
 * POST multipart/form-data — utilisé pour la soumission publique d'un témoignage
 * (avec photos optionnelles). Lève `ApiError` sur statut HTTP ≥ 400.
 */
export async function apiPostForm<T>(
  path: string,
  formData: FormData,
  opts: { signal?: AbortSignal } = {},
): Promise<T> {
  if (!API_ENABLED) {
    throw new ApiError('API désactivée (VITE_API_BASE_URL non défini)', 0);
  }

  const url = `${BASE}${path.startsWith('/') ? path : `/${path}`}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers: { Accept: 'application/json' },
      signal: opts.signal,
      credentials: 'omit',
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    throw new ApiError(`Network error: ${(err as Error).message}`, 0);
  }

  if (!response.ok) {
    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      /* corps non JSON */
    }
    throw new ApiError(
      `API ${response.status} ${response.statusText}`,
      response.status,
      payload,
    );
  }

  return (await response.json()) as T;
}
