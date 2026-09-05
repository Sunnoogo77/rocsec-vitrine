import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/* ============================================================
   useSubnavOnDark
   ------------------------------------------------------------
   Détecte si la sticky subnav (Église / Genèse) est actuellement
   superposée à un hero sombre OU si elle est passée au-dessus
   du contenu clair (canvas).

   Approche : on cherche un élément `[data-page-hero]` et on compare
   son bord inférieur au bord inférieur de la subnav. Si le hero est
   encore plus bas que la subnav, on est en dark. Sinon, en light.

   Problème historique : à la navigation SPA, React démonte la page
   précédente AVANT de monter la nouvelle. Pendant ce micro-instant,
   `document.querySelector('[data-page-hero]')` renvoie `null` et le
   hook restait coincé en "light" (couleur incorrecte sur les pages
   à hero sombre — Témoignages, Genèse, Annonces, etc.).

   Solution : on combine 3 mécanismes pour ne jamais rater le hero :
   1) Retry rAF pendant ~800ms après chaque changement de pathname
      pour attraper le hero quand il finit par être monté.
   2) MutationObserver sur document.body pour re-calculer dès qu'un
      nouveau hero apparaît dans le DOM (fallback robuste).
   3) Listener scroll/resize pour la mise à jour pendant le défilement.

   Pages sans hero = la subnav reste en dark (couleur par défaut) au
   lieu de basculer en light : moins choquant que l'inverse.
   ============================================================ */

function getStickyOffset(): number {
  const nav = document.querySelector('[data-sticky-subnav]') as HTMLElement | null;
  if (!nav) return 124;
  const rect = nav.getBoundingClientRect();
  return rect.top + rect.height;
}

export function useSubnavOnDark(): boolean {
  const { pathname } = useLocation();
  const [onDark, setOnDark] = useState(true);

  useEffect(() => {
    let scrollRaf: number | null = null;
    let retryRaf: number | null = null;
    let retries = 0;
    const MAX_RETRIES = 50; // ~833ms à 60fps

    const computeFromHero = (hero: HTMLElement) => {
      const heroBottom = hero.getBoundingClientRect().bottom;
      const subnavBottom = getStickyOffset();
      setOnDark(heroBottom > subnavBottom);
    };

    const update = () => {
      scrollRaf = null;
      const hero = document.querySelector<HTMLElement>('[data-page-hero]');
      if (hero) computeFromHero(hero);
      // Si pas de hero (transition SPA en cours) → on garde l'état actuel,
      // PAS de fallback automatique vers light.
    };

    /* Retry mechanism : à chaque changement de pathname, on cherche le
       hero jusqu'à 50 frames (~830ms). Évite le bug où le hero n'est pas
       encore monté à l'instant où le useEffect tire. */
    const tryFindHero = () => {
      retryRaf = null;
      const hero = document.querySelector<HTMLElement>('[data-page-hero]');
      if (hero) {
        computeFromHero(hero);
      } else if (retries++ < MAX_RETRIES) {
        retryRaf = requestAnimationFrame(tryFindHero);
      }
      // Sinon : pas de hero trouvé après 800ms → la page n'a pas de hero,
      // on laisse la valeur par défaut (dark) inchangée.
    };
    tryFindHero();

    /* MutationObserver : recalcule dès qu'un nouveau hero apparaît dans
       le DOM. Couvre les cas où la page met plus de 800ms à se monter
       (chargement lent, etc.). */
    const observer = new MutationObserver(() => {
      const hero = document.querySelector<HTMLElement>('[data-page-hero]');
      if (hero) computeFromHero(hero);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    const onScroll = () => {
      if (scrollRaf !== null) return;
      scrollRaf = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      if (scrollRaf !== null) cancelAnimationFrame(scrollRaf);
      if (retryRaf !== null) cancelAnimationFrame(retryRaf);
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [pathname]);

  return onDark;
}
