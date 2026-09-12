/**
 * Helpers YouTube — extraction d'ID, URL d'embed paramétrée, miniature.
 * Toutes les fonctions acceptent une URL pleine ou un ID brut, et
 * renvoient `null` quand l'entrée n'est pas reconnue.
 */

const ID_REGEX = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com']);
const EMBED_HOSTS = new Set(['youtube-nocookie.com', 'www.youtube-nocookie.com']);

export function youtubeId(url: string | undefined): string | null {
  if (typeof url !== 'string') return null;
  const value = url.trim();
  if (ID_REGEX.test(value)) return value;
  try {
    const parsed = new URL(value);
    if (!['https:', 'http:'].includes(parsed.protocol) || parsed.username || parsed.password || parsed.port) return null;
    const host = parsed.hostname.toLowerCase();
    let id: string | null = null;
    if (host === 'youtu.be' || host === 'www.youtu.be') {
      id = parsed.pathname.match(/^\/([A-Za-z0-9_-]{11})\/?$/)?.[1] ?? null;
    } else if (YOUTUBE_HOSTS.has(host)) {
      id = /^\/watch\/?$/.test(parsed.pathname)
        ? parsed.searchParams.get('v')
        : parsed.pathname.match(/^\/(?:live|shorts|embed)\/([A-Za-z0-9_-]{11})\/?$/)?.[1] ?? null;
    } else if (EMBED_HOSTS.has(host)) {
      id = parsed.pathname.match(/^\/embed\/([A-Za-z0-9_-]{11})\/?$/)?.[1] ?? null;
    }
    return id && ID_REGEX.test(id) ? id : null;
  } catch {
    return null;
  }
}

interface EmbedOpts {
  autoplay?: boolean;
}

/**
 * URL d’embed nocookie. Les commandes et le clavier natifs restent disponibles.
 * rel=0 limite les suggestions aux vidéos de la même chaîne ; playsinline=1
 * permet la lecture dans la page sur iOS.
 */
export function youtubeEmbedUrl(
  url: string | undefined,
  opts: EmbedOpts = {},
): string | null {
  const id = youtubeId(url);
  if (!id) return null;
  const params = new URLSearchParams({
    rel: '0',
    controls: '1',
    playsinline: '1',
    ...(opts.autoplay ? { autoplay: '1' } : {}),
  });
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}

/** URL de la miniature haute définition d'une vidéo YouTube. */
export function youtubeThumbnail(url: string | undefined): string | null {
  const id = youtubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}
