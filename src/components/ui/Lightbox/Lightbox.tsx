import { useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './Lightbox.module.css';

export interface LightboxImage {
  src: string;
  alt?: string;
  caption?: string;
}

interface LightboxProps {
  images: LightboxImage[];
  index: number;
  onClose: () => void;
  onNavigate: (newIndex: number) => void;
}

export function Lightbox({ images, index, onClose, onNavigate }: LightboxProps) {
  const total = images.length;
  const current = images[index];

  const next = useCallback(() => {
    onNavigate((index + 1) % total);
  }, [index, total, onNavigate]);

  const prev = useCallback(() => {
    onNavigate((index - 1 + total) % total);
  }, [index, total, onNavigate]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    };
    document.addEventListener('keydown', onKey);
    // Empêche le scroll du body sous le lightbox
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, next, prev]);

  if (!current) return null;

  return createPortal(
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={current.alt ?? current.caption ?? 'Image'}
      onClick={onClose}
    >
      <button
        className={styles.close}
        onClick={onClose}
        aria-label="Fermer"
        type="button"
      >
        ×
      </button>

      {total > 1 && (
        <button
          className={`${styles.nav} ${styles.navPrev}`}
          onClick={(e) => {
            e.stopPropagation();
            prev();
          }}
          aria-label="Image précédente"
          type="button"
        >
          ‹
        </button>
      )}

      <figure
        className={styles.figure}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={current.src}
          alt={current.alt ?? ''}
          className={styles.img}
        />
        {current.caption && (
          <figcaption className={styles.caption}>{current.caption}</figcaption>
        )}
      </figure>

      {total > 1 && (
        <button
          className={`${styles.nav} ${styles.navNext}`}
          onClick={(e) => {
            e.stopPropagation();
            next();
          }}
          aria-label="Image suivante"
          type="button"
        >
          ›
        </button>
      )}

      {total > 1 && (
        <p className={styles.counter} aria-live="polite">
          {index + 1} / {total}
        </p>
      )}
    </div>,
    document.body,
  );
}
