import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import styles from './FilterSheet.module.css';

/* ============================================================
   FilterSheet — modal bottom-sheet iOS-like
   Pattern : backdrop + panel qui glisse depuis le bas (slide-up
   220ms easing Apple). Header avec handle pill + titre + ✕,
   body scrollable, footer sticky avec actions "Réinitialiser"
   + "Appliquer". Respecte les safe-areas iOS.

   Utilisation :
     <FilterSheet
       open={isOpen}
       onClose={() => setOpen(false)}
       title="Filtrer"
       activeCount={3}
       onReset={() => resetAll()}
       onApply={() => setOpen(false)}
     >
       <FilterGroup>...</FilterGroup>
     </FilterSheet>

   Pensé pour mobile (≤ 820px). Sur desktop le composant peut
   être utilisé aussi mais la sidebar habituelle est privilégiée.
   ============================================================ */

interface FilterSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Compteur affiché à côté du titre (nb de filtres actifs). */
  activeCount?: number;
  /** Bouton secondaire dans le footer. */
  onReset?: () => void;
  /** Bouton primaire dans le footer (par défaut ferme la sheet). */
  onApply?: () => void;
  /** Libellés personnalisables. */
  applyLabel?: string;
  resetLabel?: string;
  children: ReactNode;
}

export default function FilterSheet({
  open,
  onClose,
  title,
  activeCount,
  onReset,
  onApply,
  applyLabel = 'Voir les résultats',
  resetLabel = 'Réinitialiser',
  children,
}: FilterSheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  /* Escape pour fermer + body scroll lock pendant l'ouverture. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className={styles.backdrop} onClick={onClose} role="presentation">
      <div
        ref={panelRef}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.handle} aria-hidden="true" />

        <header className={styles.head}>
          <h2 className={styles.title}>
            {title}
            {typeof activeCount === 'number' && activeCount > 0 && (
              <span className={styles.count}>{activeCount}</span>
            )}
          </h2>
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Fermer les filtres"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        <div className={styles.body}>{children}</div>

        {(onReset || onApply) && (
          <footer className={styles.foot}>
            {onReset && (
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={onReset}
              >
                {resetLabel}
              </button>
            )}
            {onApply && (
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={onApply}
              >
                {applyLabel}
              </button>
            )}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  );
}
