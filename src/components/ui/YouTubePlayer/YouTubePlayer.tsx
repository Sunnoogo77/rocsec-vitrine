import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { youtubeId } from '../../../utils/youtube';
import styles from './YouTubePlayer.module.css';

interface YouTubeAPIPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  getPlayerState: () => number;
  getCurrentTime: () => number;
  destroy: () => void;
}

interface YouTubeEvent {
  target: YouTubeAPIPlayer;
  data: number;
}

interface YouTubeAPI {
  Player: new (host: HTMLIFrameElement, options: {
    events: {
      onReady: (event: YouTubeEvent) => void;
      onStateChange: (event: YouTubeEvent) => void;
      onError: (event: YouTubeEvent) => void;
    };
  }) => YouTubeAPIPlayer;
}

declare global {
  interface Window {
    YT?: YouTubeAPI;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<YouTubeAPI> | null = null;

/** Shared API loading is optional: the native iframe already works without it. */
function loadYouTubeAPI(): Promise<YouTubeAPI> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;

  const pending = new Promise<YouTubeAPI>((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;
    const script = document.createElement('script');
    let settled = false;
    let timeout: number;

    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      script.removeEventListener('error', failed);
      if (window.onYouTubeIframeAPIReady === ready) {
        window.onYouTubeIframeAPIReady = previous;
      }
      if (error || !window.YT?.Player) {
        script.remove();
        reject(error ?? new Error('YouTube API unavailable'));
      } else {
        resolve(window.YT);
      }
    };
    const failed = () => finish(new Error('YouTube API could not load'));
    const ready = () => {
      try { previous?.(); } catch { /* Another integration must not block this player. */ }
      finish();
    };

    window.onYouTubeIframeAPIReady = ready;
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    script.addEventListener('error', failed);
    timeout = window.setTimeout(failed, 12_000);
    document.head.appendChild(script);
  });
  apiPromise = pending;
  // Handle the shared rejection even when every subscribing player unmounts.
  void pending.catch(() => {
    if (apiPromise === pending) apiPromise = null;
  });
  return pending;
}

export interface YouTubePlayerHandle {
  play: () => void;
  pause: () => void;
  toggle: () => void;
  isPlaying: () => boolean;
}

interface YouTubePlayerProps {
  videoUrl: string | undefined;
  videoKey?: string;
  autoplay?: boolean;
  onPlayingChange?: (playing: boolean) => void;
  onEnded?: () => void;
  disableKeyboard?: boolean;
  startSec?: number;
  endSec?: number;
  onTimeUpdate?: (currentSec: number) => void;
  onNoticeChange?: (visible: boolean) => void;
}

type PlayerStatus = 'loading' | 'ready' | 'limited' | 'error';

function embedError(code: number): string {
  if (code === 100) return 'Cette vidéo a été supprimée ou est privée.';
  if (code === 101 || code === 150) return 'Cette vidéo ne peut pas être lue sur ce site.';
  if (code === 153) return 'YouTube ne parvient pas à autoriser la lecture sur ce site.';
  return 'La vidéo ne peut pas être chargée pour le moment.';
}

const YouTubePlayer = forwardRef<YouTubePlayerHandle, YouTubePlayerProps>(
  function YouTubePlayer({
    videoUrl, videoKey, autoplay = true, onPlayingChange, onEnded,
    disableKeyboard = false, startSec, endSec, onTimeUpdate, onNoticeChange,
  }, ref) {
    const id = youtubeId(videoUrl);
    const start = typeof startSec === 'number' && Number.isFinite(startSec)
      ? Math.max(0, Math.floor(startSec)) : 0;
    const end = typeof endSec === 'number' && Number.isFinite(endSec) && Math.floor(endSec) > start
      ? Math.floor(endSec) : undefined;
    const containerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<YouTubeAPIPlayer | null>(null);
    const playingRef = useRef(false);
    const callbacks = useRef({ onPlayingChange, onEnded, onTimeUpdate });
    const [status, setStatus] = useState<PlayerStatus>('loading');
    const [error, setError] = useState('');
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
      onNoticeChange?.(Boolean(id) && (status === 'limited' || status === 'error'));
    }, [id, status, onNoticeChange]);

    useEffect(() => {
      callbacks.current = { onPlayingChange, onEnded, onTimeUpdate };
    }, [onPlayingChange, onEnded, onTimeUpdate]);

    const updatePlaying = useCallback((next: boolean) => {
      if (playingRef.current !== next) {
        playingRef.current = next;
        callbacks.current.onPlayingChange?.(next);
      }
    }, []);

    useImperativeHandle(ref, () => ({
      play: () => { try { playerRef.current?.playVideo(); } catch { /* Native controls remain available. */ } },
      pause: () => { try { playerRef.current?.pauseVideo(); } catch { /* Native controls remain available. */ } },
      toggle: () => {
        const player = playerRef.current;
        if (!player) return;
        try {
          if (player.getPlayerState() === 1) player.pauseVideo();
          else player.playVideo();
        } catch { /* Native controls remain available. */ }
      },
      isPlaying: () => playingRef.current,
    }), []);

    useEffect(() => {
      const container = containerRef.current;
      if (!id || !container) return;
      let cancelled = false;
      let player: YouTubeAPIPlayer | null = null;
      let poll: number | undefined;
      let ended = false;
      const startPolling = (target: YouTubeAPIPlayer) => {
        if (poll !== undefined) window.clearInterval(poll);
        poll = window.setInterval(() => {
          if (cancelled) return;
          try {
            const current = target.getCurrentTime();
            if (Number.isFinite(current) && current >= 0) callbacks.current.onTimeUpdate?.(current);
          } catch { /* A detached or unavailable player cannot report its time. */ }
        }, 250);
      };
      setStatus('loading');
      setError('');
      updatePlaying(false);

      // Creating this iframe before requesting the JS API avoids a blank host
      // if a blocker, an old CSP or a network failure prevents that API loading.
      const iframe = document.createElement('iframe');
      const params = new URLSearchParams({
        enablejsapi: '1', origin: window.location.origin, controls: '1', fs: '1',
        playsinline: '1', rel: '0', autoplay: autoplay ? '1' : '0',
        disablekb: disableKeyboard ? '1' : '0', start: String(start),
      });
      if (end !== undefined) params.set('end', String(end));
      iframe.src = `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
      iframe.title = 'Lecteur vidéo YouTube';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen';
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      container.replaceChildren(iframe);

      const unavailable = () => {
        if (!cancelled) setStatus((current) => current === 'error' ? current : 'limited');
      };
      const readyTimeout = window.setTimeout(unavailable, 15_000);
      const iframeFailed = () => {
        if (cancelled) return;
        window.clearTimeout(readyTimeout);
        setError('La vidéo ne peut pas être chargée pour le moment.');
        setStatus('error');
      };
      iframe.addEventListener('error', iframeFailed);

      void loadYouTubeAPI().then((api) => {
        if (cancelled) return;
        // Attach to the existing native iframe; do not replace it with an empty host.
        player = new api.Player(iframe, {
          events: {
            onReady: (event) => {
              if (cancelled) return;
              window.clearTimeout(readyTimeout);
              playerRef.current = event.target;
              setStatus((current) => current === 'error' ? current : 'ready');
              startPolling(event.target);
            },
            onStateChange: (event) => {
              if (cancelled) return;
              updatePlaying(event.data === 1);
              if (event.data === 1) {
                startPolling(event.target);
                window.clearTimeout(readyTimeout);
                setStatus('ready');
                setError('');
                ended = false;
              }
              if (event.data === 0 && !ended) {
                ended = true;
                callbacks.current.onEnded?.();
              }
            },
            onError: (event) => {
              if (cancelled) return;
              window.clearTimeout(readyTimeout);
              if (poll !== undefined) window.clearInterval(poll);
              updatePlaying(false);
              setError(embedError(event.data));
              setStatus('error');
            },
          },
        });
      }).catch(() => {
        window.clearTimeout(readyTimeout);
        unavailable();
      });

      return () => {
        cancelled = true;
        window.clearTimeout(readyTimeout);
        if (poll !== undefined) window.clearInterval(poll);
        iframe.removeEventListener('error', iframeFailed);
        playerRef.current = null;
        try { player?.destroy(); } catch { /* The iframe may already have been removed. */ }
        container.replaceChildren();
        updatePlaying(false);
      };
    }, [id, videoKey, autoplay, disableKeyboard, start, end, attempt, updatePlaying]);

    if (!id) return <div className={styles.player}><p className={styles.empty}>Vidéo indisponible.</p></div>;

    const watchUrl = `https://www.youtube.com/watch?v=${id}${start ? `&t=${start}s` : ''}`;
    return (
      <div className={styles.player} data-player-status={status}>
        <div ref={containerRef} className={styles.iframeHost} />
        {(status === 'limited' || status === 'error') && (
          <div className={styles.notice} role="status">
            <p>{status === 'error' ? error : 'Utilisez les commandes YouTube dans la vidéo. Si la lecture ne démarre pas, ouvrez-la sur YouTube.'}</p>
            <div className={styles.actions}>
              <button type="button" onClick={() => setAttempt((current) => current + 1)}>Réessayer</button>
              <a href={watchUrl} target="_blank" rel="noopener noreferrer">Ouvrir sur YouTube</a>
            </div>
          </div>
        )}
      </div>
    );
  },
);

export default YouTubePlayer;
