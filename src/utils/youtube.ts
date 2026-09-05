/**
 * Helpers YouTube — extraction d'ID, URL d'embed paramétrée, miniature.
 * Toutes les fonctions acceptent une URL pleine ou un ID brut, et
 * renvoient `null` quand l'entrée n'est pas reconnue.
 */

const ID_REGEX = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/;

export function youtubeId(url: string | undefined): string | null {
  if (!url) return null;
  const m = url.match(ID_REGEX);
  return m ? m[1] : null;
}

interface EmbedOpts {
  autoplay?: boolean;
}

/**
 * URL d'embed nocookie avec branding YouTube réduit au minimum :
 * - rel=0           : pas de vidéos suggérées d'autres chaînes à la fin
 * - modestbranding  : retire le watermark YouTube de la barre
 * - iv_load_policy=3: pas d'annotations
 * - playsinline=1   : iOS lit dans la page plutôt qu'en plein écran
 */
export function youtubeEmbedUrl(
  url: string | undefined,
  opts: EmbedOpts = {},
): string | null {
  const id = youtubeId(url);
  if (!id) return null;
  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    iv_load_policy: '3',
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
