import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { youtubeId } from '../../../utils/youtube';
import styles from './YouTubePlayer.module.css';

/* ============================================================
   YouTubePlayer — IFrame Player API + custom overlay controls
   ------------------------------------------------------------
   - Charge dynamiquement l'API YouTube IFrame une seule fois
   - Encapsule un YT.Player et expose un ref impératif léger
     pour permettre à un parent (mini-bar PiP par ex.) de
     déclencher play/pause sans dupliquer la logique
   - Cache les contrôles natifs (controls=0) et superpose les
     siens : barre de progression, play/pause, volume,
     fullscreen, time
   - Auto-hide des contrôles après 2.4s d'inactivité en lecture
   - Raccourcis clavier : Space, ←/→, ↑/↓, M, F
   ============================================================ */

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<void> | null = null;

function loadYouTubeAPI(): Promise<void> {
  if (apiPromise) return apiPromise;
  apiPromise = new Promise<void>((resolve) => {
    if (typeof window === 'undefined') return resolve();
    if (window.YT && window.YT.Player) return resolve();

    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve();
    };

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    tag.async = true;
    document.head.appendChild(tag);
  });
  return apiPromise;
}

export interface YouTubePlayerHandle {
  play: () => void;
  pause: () => void;
  toggle: () => void;
  isPlaying: () => boolean;
}

interface YouTubePlayerProps {
  videoUrl: string | undefined;
  /** Réinitialise le player quand cette clé change (ex. on switch de sermon) */
  videoKey?: string;
  autoplay?: boolean;
  /** Notifie le parent de tout changement d'état lecture/pause */
  onPlayingChange?: (playing: boolean) => void;
  /** Appelé quand la vidéo arrive à son terme — utile pour enchainer */
  onEnded?: () => void;
  /** Désactive les raccourcis clavier (utile si concurrent avec d'autres handlers) */
  disableKeyboard?: boolean;
  /** Démarre la lecture à cette seconde (deep-link YouTube). Utile
   *  pour pointer un cantique précis dans une longue session. */
  startSec?: number;
  /** Arrête la lecture à cette seconde. La vidéo n'est pas tronquée
   *  côté YouTube — c'est le player qui appelle pause() une fois
   *  l'instant atteint. */
  endSec?: number;
  /** Notifie le parent du temps de lecture courant (en secondes), pollé
   *  à ~4 Hz. Utile pour synchroniser un index/paroles sur le timecode
   *  (ex. SessionView : sélectionne automatiquement le cantique en cours). */
  onTimeUpdate?: (currentSec: number) => void;
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

const YouTubePlayer = forwardRef<YouTubePlayerHandle, YouTubePlayerProps>(
  function YouTubePlayer(
    {
      videoUrl,
      videoKey,
      autoplay = true,
      onPlayingChange,
      onEnded,
      disableKeyboard = false,
      startSec,
      endSec,
      onTimeUpdate,
    },
    ref,
  ) {
    const id = youtubeId(videoUrl);
    const containerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<any>(null);

    const [ready, setReady] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(80);
    const [muted, setMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [scrubTime, setScrubTime] = useState<number | null>(null);

    const hideTimerRef = useRef<number | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    /* Refs vers les callbacks pour garantir qu'on lit toujours la dernière
       version dans les events YT.Player (le useEffect d'init n'a en deps
       que [id, videoKey] pour ne pas réinstancier le player à chaque
       changement de prop). */
    const onPlayingChangeRef = useRef(onPlayingChange);
    const onEndedRef = useRef(onEnded);
    const onTimeUpdateRef = useRef(onTimeUpdate);
    useEffect(() => { onPlayingChangeRef.current = onPlayingChange; }, [onPlayingChange]);
    useEffect(() => { onEndedRef.current = onEnded; }, [onEnded]);
    useEffect(() => { onTimeUpdateRef.current = onTimeUpdate; }, [onTimeUpdate]);

    const setPlayingState = useCallback((next: boolean) => {
      setPlaying(next);
      onPlayingChangeRef.current?.(next);
    }, []);

    /* ── Init / re-init player quand l'id vidéo change ───── */
    useEffect(() => {
      if (!id || !containerRef.current) return;

      let cancelled = false;
      setReady(false);
      setPlaying(false);
      setCurrentTime(0);
      setDuration(0);

      loadYouTubeAPI().then(() => {
        if (cancelled || !containerRef.current) return;

        // Détruit le player précédent s'il existe.
        if (playerRef.current) {
          try { playerRef.current.destroy(); } catch { /* noop */ }
          playerRef.current = null;
        }

        // Recrée un host vide (YT remplace l'élément cible par une iframe,
        // donc il faut qu'il soit vide à chaque init).
        const host = document.createElement('div');
        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(host);

        playerRef.current = new window.YT.Player(host, {
          videoId: id,
          playerVars: {
            controls: 0,
            modestbranding: 1,
            rel: 0,
            iv_load_policy: 3,
            playsinline: 1,
            fs: 0,
            disablekb: 1,
            autoplay: autoplay ? 1 : 0,
            /* Deep-link YouTube : start = secondes depuis le début ;
               end = stop natif YouTube (en plus du watcher JS). */
            ...(typeof startSec === 'number' ? { start: Math.max(0, Math.floor(startSec)) } : {}),
            ...(typeof endSec === 'number'   ? { end:   Math.max(0, Math.floor(endSec))   } : {}),
          },
          events: {
            onReady: (e: any) => {
              if (cancelled) return;
              setReady(true);
              setDuration(e.target.getDuration() ?? 0);
              setVolume(e.target.getVolume() ?? 80);
              setMuted(e.target.isMuted?.() ?? false);
              if (autoplay) {
                try { e.target.playVideo(); } catch { /* noop */ }
              }
            },
            onStateChange: (e: any) => {
              if (cancelled) return;
              const PS = window.YT.PlayerState;
              if (e.data === PS.PLAYING) setPlayingState(true);
              else if (e.data === PS.PAUSED || e.data === PS.ENDED) setPlayingState(false);
              if (e.data === PS.ENDED) onEndedRef.current?.();

              // La durée n'est connue qu'une fois la lecture engagée parfois.
              const d = e.target.getDuration?.();
              if (d && d !== duration) setDuration(d);
            },
          },
        });
      });

      return () => {
        cancelled = true;
        if (playerRef.current) {
          try { playerRef.current.destroy(); } catch { /* noop */ }
          playerRef.current = null;
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, videoKey]);

    /* ── Polling currentTime à 4 Hz pendant la lecture ───── */
    useEffect(() => {
      if (!ready) return;
      const interval = window.setInterval(() => {
        const p = playerRef.current;
        if (!p || !p.getCurrentTime) return;
        const t = p.getCurrentTime();
        if (typeof t === 'number') {
          setCurrentTime(t);
          onTimeUpdateRef.current?.(t);
          /* Pause automatique quand on atteint endSec (en plus du
             paramètre `end` de l'IFrame API qui est parfois imprécis). */
          if (typeof endSec === 'number' && t >= endSec) {
            try { p.pauseVideo(); } catch { /* noop */ }
          }
        }
      }, 250);
      return () => window.clearInterval(interval);
    }, [ready, endSec]);

    /* ── Auto-hide des contrôles après inactivité ───────── */
    const showControlsTemporarily = useCallback(() => {
      setShowControls(true);
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
      if (playing) {
        hideTimerRef.current = window.setTimeout(() => setShowControls(false), 2400);
      }
    }, [playing]);

    useEffect(() => {
      if (!playing) {
        setShowControls(true);
        return;
      }
      hideTimerRef.current = window.setTimeout(() => setShowControls(false), 2400);
      return () => {
        if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
      };
    }, [playing]);

    /* ── Listen fullscreen change ─────────────────────────── */
    useEffect(() => {
      const onFs = () => setIsFullscreen(document.fullscreenElement === wrapperRef.current);
      document.addEventListener('fullscreenchange', onFs);
      return () => document.removeEventListener('fullscreenchange', onFs);
    }, []);

    /* ── Actions ──────────────────────────────────────────── */
    const playAction = useCallback(() => {
      const p = playerRef.current;
      if (!p) return;
      try { p.playVideo(); } catch { /* noop */ }
    }, []);

    const pauseAction = useCallback(() => {
      const p = playerRef.current;
      if (!p) return;
      try { p.pauseVideo(); } catch { /* noop */ }
    }, []);

    const togglePlay = useCallback(() => {
      if (playing) pauseAction(); else playAction();
      showControlsTemporarily();
    }, [playing, playAction, pauseAction, showControlsTemporarily]);

    const seekRel = useCallback(
      (delta: number) => {
        const p = playerRef.current;
        if (!p) return;
        const t = (p.getCurrentTime?.() ?? 0) + delta;
        const d = p.getDuration?.() ?? duration;
        const target = Math.max(0, Math.min(d || 0, t));
        try { p.seekTo(target, true); } catch { /* noop */ }
        setCurrentTime(target);
        showControlsTemporarily();
      },
      [duration, showControlsTemporarily],
    );

    const seekTo = useCallback(
      (target: number) => {
        const p = playerRef.current;
        if (!p) return;
        try { p.seekTo(target, true); } catch { /* noop */ }
        setCurrentTime(target);
      },
      [],
    );

    const setVolumeAction = useCallback((v: number) => {
      const p = playerRef.current;
      if (!p) return;
      const clamped = Math.max(0, Math.min(100, v));
      try {
        p.setVolume(clamped);
        if (clamped > 0 && p.isMuted?.()) p.unMute();
      } catch { /* noop */ }
      setVolume(clamped);
      setMuted(clamped === 0);
    }, []);

    const toggleMute = useCallback(() => {
      const p = playerRef.current;
      if (!p) return;
      const isMuted = p.isMuted?.() ?? muted;
      try {
        if (isMuted) { p.unMute(); setMuted(false); }
        else         { p.mute();   setMuted(true); }
      } catch { /* noop */ }
    }, [muted]);

    const toggleFullscreen = useCallback(() => {
      if (!wrapperRef.current) return;
      if (document.fullscreenElement) {
        document.exitFullscreen?.();
      } else {
        wrapperRef.current.requestFullscreen?.();
      }
    }, []);

    /* ── Ref impératif pour le parent ─────────────────────── */
    useImperativeHandle(ref, () => ({
      play: playAction,
      pause: pauseAction,
      toggle: togglePlay,
      isPlaying: () => playing,
    }), [playAction, pauseAction, togglePlay, playing]);

    /* ── Raccourcis clavier ───────────────────────────────── */
    useEffect(() => {
      if (disableKeyboard) return;
      const onKey = (e: KeyboardEvent) => {
        // Évite d'intercepter les frappes dans les inputs.
        const t = e.target as HTMLElement | null;
        if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
        switch (e.key) {
          case ' ':
          case 'k':
            e.preventDefault(); togglePlay(); break;
          case 'ArrowLeft': e.preventDefault(); seekRel(-5);  break;
          case 'ArrowRight': e.preventDefault(); seekRel(5);  break;
          case 'ArrowUp':   e.preventDefault(); setVolumeAction(volume + 5); break;
          case 'ArrowDown': e.preventDefault(); setVolumeAction(volume - 5); break;
          case 'm': case 'M': e.preventDefault(); toggleMute(); break;
          case 'f': case 'F': e.preventDefault(); toggleFullscreen(); break;
        }
      };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }, [disableKeyboard, togglePlay, seekRel, setVolumeAction, toggleMute, toggleFullscreen, volume]);

    /* ── Handlers UI ──────────────────────────────────────── */
    const onProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;
      const target = Math.max(0, Math.min(1, ratio)) * duration;
      seekTo(target);
    };

    const onProgressDrag = (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.buttons !== 1) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;
      setScrubTime(Math.max(0, Math.min(1, ratio)) * duration);
    };

    const onProgressMouseUp = () => {
      if (scrubTime !== null) {
        seekTo(scrubTime);
        setScrubTime(null);
      }
    };

    const displayedTime = scrubTime ?? currentTime;
    const progressRatio = duration > 0 ? Math.min(1, displayedTime / duration) : 0;

    if (!id) {
      return (
        <div className={styles.player}>
          <div className={styles.empty}>Vidéo indisponible.</div>
        </div>
      );
    }

    return (
      <div
        ref={wrapperRef}
        className={[
          styles.player,
          isFullscreen ? styles.playerFullscreen : '',
          showControls ? '' : styles.playerHideCursor,
        ].join(' ')}
        onMouseMove={showControlsTemporarily}
        onMouseLeave={() => {
          if (playing) setShowControls(false);
        }}
      >
        {/* Hôte de l'iframe — YT remplace ce div par l'iframe. */}
        <div ref={containerRef} className={styles.iframeHost} />

        {/* Cliquable layer pour play/pause sur tap sur la vidéo. */}
        <button
          type="button"
          className={styles.tapLayer}
          onClick={togglePlay}
          aria-label={playing ? 'Pause' : 'Lire'}
        />

        {/* Big play button au centre quand on est en pause. */}
        {!playing && (
          <button
            type="button"
            className={styles.bigPlay}
            onClick={togglePlay}
            aria-label="Lire"
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        )}

        {/* Overlay controls (auto-hide en lecture). */}
        <div
          className={[
            styles.controls,
            showControls ? styles.controlsVisible : '',
          ].join(' ')}
        >
          {/* Progress bar — cliquable + drag. */}
          <div
            className={styles.progressTrack}
            onMouseDown={onProgressClick}
            onMouseMove={onProgressDrag}
            onMouseUp={onProgressMouseUp}
            onMouseLeave={onProgressMouseUp}
          >
            <div className={styles.progressBuffer} />
            <div
              className={styles.progressFill}
              style={{ width: `${progressRatio * 100}%` }}
            />
            <div
              className={styles.progressHandle}
              style={{ left: `${progressRatio * 100}%` }}
            />
          </div>

          <div className={styles.bar}>
            <div className={styles.barLeft}>
              <button
                type="button"
                className={styles.iconBtn}
                onClick={togglePlay}
                aria-label={playing ? 'Pause' : 'Lire'}
              >
                {playing ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="5" width="4" height="14" rx="1" />
                    <rect x="14" y="5" width="4" height="14" rx="1" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              {/* Volume : icône + slider qui apparaît au hover. */}
              <div className={styles.volumeGroup}>
                <button
                  type="button"
                  className={styles.iconBtn}
                  onClick={toggleMute}
                  aria-label={muted ? 'Réactiver le son' : 'Couper le son'}
                >
                  {muted || volume === 0 ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <line x1="23" y1="9" x2="17" y2="15" />
                      <line x1="17" y1="9" x2="23" y2="15" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                    </svg>
                  )}
                </button>
                <div className={styles.volumeSliderWrap}>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={muted ? 0 : volume}
                    onChange={(e) => setVolumeAction(Number(e.target.value))}
                    className={styles.volumeSlider}
                    aria-label="Volume"
                  />
                </div>
              </div>

              <span className={styles.time}>
                {formatTime(displayedTime)} <span className={styles.timeSep}>/</span> {formatTime(duration)}
              </span>
            </div>

            <div className={styles.barRight}>
              <button
                type="button"
                className={styles.iconBtn}
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
              >
                {isFullscreen ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="4 14 10 14 10 20" />
                    <polyline points="20 10 14 10 14 4" />
                    <line x1="14" y1="10" x2="21" y2="3" />
                    <line x1="3" y1="21" x2="10" y2="14" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 3 21 3 21 9" />
                    <polyline points="9 21 3 21 3 15" />
                    <line x1="21" y1="3" x2="14" y2="10" />
                    <line x1="3" y1="21" x2="10" y2="14" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

export default YouTubePlayer;
