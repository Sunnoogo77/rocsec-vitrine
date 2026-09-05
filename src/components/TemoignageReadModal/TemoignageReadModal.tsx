/**
 * Modal de lecture d'un témoignage.
 *
 * Hiérarchie : LE TEXTE est l'élément principal. Les photos arrivent
 * en galerie discrète sous le récit (scroll horizontal iOS si >1, sinon
 * une vignette unique). On ne met pas d'image en hero ; le titre reste
 * visible immédiatement.
 *
 * Animation spring iOS-style, backdrop blur, fermeture ESC / click backdrop.
 */

import { useEffect, useMemo, useRef, useState } from 'react';

import { asset } from '../../utils/asset';
import type { Temoignage } from '../../types';
import styles from './TemoignageReadModal.module.css';

interface Props {
  temoignage: Temoignage | null;
  onClose: () => void;
}

export function TemoignageReadModal({ temoignage, onClose }: Props) {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);

  // Photos disponibles : photos soumises par le témoin (galerie complète) +
  // fallback sur image éditoriale unique si pas de photos.
  const galerie = useMemo(() => {
    if (!temoignage) return [] as { url: string; legende: string }[];
    if (temoignage.photos && temoignage.photos.length > 0) {
      return temoignage.photos.map((p) => ({ url: p.url, legende: p.legende }));
    }
    if (temoignage.image) {
      return [{ url: temoignage.image, legende: '' }];
    }
    return [];
  }, [temoignage]);

  useEffect(() => {
    if (!temoignage) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (lightbox !== null) setLightbox(null);
        else onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    closeBtnRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [temoignage, onClose, lightbox]);

  if (!temoignage) return null;

  const eyebrow =
    temoignage.eyebrow ||
    (temoignage.type === 'citation'
      ? 'Citation'
      : temoignage.type === 'illustre'
      ? 'Témoignage illustré'
      : 'Récit');

  const longParagraphs = temoignage.detail?.paragraphs ?? [];
  const hasLong = longParagraphs.length > 0;

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="temReadTitle"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.panel}>
        <div className={styles.handle} aria-hidden="true" />

        <button
          ref={closeBtnRef}
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Fermer"
        >
          <svg
            width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <div className={styles.body}>
          {/* ── Texte : élément principal ─────────────────────── */}
          <div className={styles.eyebrow}>{eyebrow}</div>

          {temoignage.titre && (
            <h2 id="temReadTitle" className={styles.title}>
              {temoignage.titre}
            </h2>
          )}

          {temoignage.quoteText && (
            <blockquote className={styles.quote}>
              <span className={styles.glyph} aria-hidden="true">{'“'}</span>
              <p>{temoignage.quoteText}</p>
            </blockquote>
          )}

          {temoignage.corps && (
            <p className={styles.corps}>{temoignage.corps}</p>
          )}

          {hasLong && (
            <div className={styles.long}>
              {longParagraphs.map((para, i) => {
                if (para.kind === 'lede') return <p key={i} className={styles.lede}>{para.text}</p>;
                if (para.kind === 'pull') return <blockquote key={i} className={styles.pull}>{para.text}</blockquote>;
                return <p key={i}>{para.text}</p>;
              })}
            </div>
          )}

          {temoignage.detail?.versetRef && temoignage.detail?.versetText && (
            <div className={styles.verset}>
              <span className={styles.versetLbl}>Verset cité</span>
              <span className={styles.versetRef}>
                {temoignage.detail.versetRef} — {temoignage.detail.versetText}
              </span>
            </div>
          )}

          <cite className={styles.cite}>{temoignage.cite}</cite>

          {/* ── Photos : galerie sous le texte (scroll horizontal si >1) ─── */}
          {galerie.length > 0 && (
            <div className={styles.galerie}>
              <div className={styles.galerieHead}>
                <span className={styles.galerieLbl}>
                  {galerie.length === 1 ? 'Photo jointe' : `${galerie.length} photos jointes`}
                </span>
              </div>
              <div
                className={
                  galerie.length === 1 ? styles.galerieSingle : styles.galerieScroller
                }
              >
                {galerie.map((photo, i) => (
                  <button
                    key={i}
                    type="button"
                    className={styles.thumb}
                    onClick={() => setLightbox(i)}
                    aria-label={`Agrandir la photo ${i + 1} sur ${galerie.length}`}
                  >
                    <img src={asset(photo.url)} alt={photo.legende || ''} loading="lazy" />
                    {photo.legende && (
                      <span className={styles.thumbCaption}>{photo.legende}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Lightbox : photo plein écran ──────────────────────────── */}
      {lightbox !== null && galerie[lightbox] && (
        <div
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label={`Photo ${lightbox + 1} sur ${galerie.length}`}
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            className={styles.lightboxClose}
            onClick={() => setLightbox(null)}
            aria-label="Fermer la photo"
          >
            <svg
              width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>

          {galerie.length > 1 && lightbox > 0 && (
            <button
              type="button"
              className={`${styles.lightboxNav} ${styles.lightboxPrev}`}
              onClick={(e) => { e.stopPropagation(); setLightbox(lightbox - 1); }}
              aria-label="Photo précédente"
            >
              ‹
            </button>
          )}
          {galerie.length > 1 && lightbox < galerie.length - 1 && (
            <button
              type="button"
              className={`${styles.lightboxNav} ${styles.lightboxNext}`}
              onClick={(e) => { e.stopPropagation(); setLightbox(lightbox + 1); }}
              aria-label="Photo suivante"
            >
              ›
            </button>
          )}

          <img
            className={styles.lightboxImg}
            src={asset(galerie[lightbox].url)}
            alt={galerie[lightbox].legende || ''}
            onClick={(e) => e.stopPropagation()}
          />
          {galerie[lightbox].legende && (
            <p className={styles.lightboxCaption}>{galerie[lightbox].legende}</p>
          )}
          {galerie.length > 1 && (
            <p className={styles.lightboxCount}>
              {lightbox + 1} / {galerie.length}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
