/**
 * Préfixe un chemin d'asset (servi depuis public/) avec le base URL Vite.
 *
 * En dev   : asset('/images/foo.jpg') → '/images/foo.jpg'
 * En prod  : asset('/images/foo.jpg') → '/RST/images/foo.jpg'
 *           (selon la valeur de `base` dans vite.config.ts)
 *
 * Vite ne réécrit PAS les chaînes `src="/..."` en JSX, contrairement aux
 * imports JS. Ce helper compense en concaténant explicitement BASE_URL.
 *
 * Accepte aussi bien '/path' que 'path' — le résultat n'a jamais de
 * double slash.
 */
const BASE = import.meta.env.BASE_URL; // toujours terminé par '/'

export function asset(path: string): string {
  if (!path) return path;
  // URLs absolues (http://, https://, //) ou data:/blob: : pas de préfixage
  if (/^([a-z]+:)?\/\//i.test(path) || path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }
  const cleaned = path.startsWith('/') ? path.slice(1) : path;
  return `${BASE}${cleaned}`;
}
