import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCantiques, useSessionsAdoration } from '../../hooks/useCantiques';
import type { CantiqueFamille } from '../../types';
import HymnaireBrowser from '../../components/ui/HymnaireBrowser/HymnaireBrowser';
import styles from './Cantiques.module.css';

/* ============================================================
   CANTIQUES — Page hymnaire (entry point de l'espace cantiques)
   ------------------------------------------------------------
   Sous le hero, on reproduit le visuel "hymnaire" de la watch
   shell (route /eglise/cantiques/watch/hymnaire/:famille) :
     - Bande sombre en haut avec 3 pills (Recueil / Spéciaux /
       Session d'adoration) qui basculent localement la famille
       affichée (pas de navigation).
     - Zone blanche arrondie en dessous (effet "rouleau") avec
       <HymnaireBrowser/> qui fait toute la logique : search,
       chips année, grille 16:9 ou table des matières recueil.
   Au clic sur un cantique → /eglise/cantiques/watch/:slug
   Au clic sur une session → /eglise/cantiques/watch/session-:slug
   La navigation est entièrement gérée par HymnaireBrowser.
   ============================================================ */

export default function Cantiques() {
  const { t } = useTranslation();
  const { counts } = useCantiques();
  const { data: sessionsAdoration } = useSessionsAdoration();
  const FAMILLES = useMemo<{ key: CantiqueFamille; label: string; count: number }[]>(
    () => [
      { key: 'recueil',   label: 'Recueil',          count: counts.recueil },
      { key: 'special',   label: 'Spéciaux',         count: counts.special },
      { key: 'adoration', label: 'Service de chant', count: sessionsAdoration.length + counts.adoration },
    ],
    [counts.recueil, counts.special, counts.adoration, sessionsAdoration.length],
  );
  const [activeFamille, setActiveFamille] = useState<CantiqueFamille>('recueil');

  const [hasScrolled, setHasScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 80) {
        setHasScrolled(true);
        window.removeEventListener('scroll', onScroll);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <main id="main-content" className={styles.page}>

      {/* ══════════════════════════════════════════════════════════
          HERO glass dark — inchangé
          ══════════════════════════════════════════════════════════ */}
      <section data-page-hero className={styles.hero} aria-label={t('eglise.cantiques.eyebrow')}>
        <div className={styles.heroInner}>
          <div className={styles.heroEyebrow}>{t('eglise.cantiques.eyebrow')}</div>
          <h1 className={styles.heroTitle}>
            {t('eglise.cantiques.titreLine1')}<br />
            <em>{t('eglise.cantiques.titreLine2')}</em>
          </h1>
          <div className={styles.heroRef}>{t('eglise.cantiques.ref')}</div>
          <p className={styles.heroLede}>{t('eglise.cantiques.lede')}</p>
        </div>

        <button
          type="button"
          className={[
            styles.scrollHint,
            hasScrolled ? styles.scrollHintHidden : '',
          ].join(' ')}
          onClick={() => {
            window.scrollTo({ top: window.innerHeight * 0.85, behavior: 'smooth' });
          }}
          aria-label="Découvrir l'hymnaire"
        >
          <span className={styles.scrollHintLabel}>Découvrir l'hymnaire</span>
          <span className={styles.scrollHintArrow} aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </button>
      </section>

      {/* ══════════════════════════════════════════════════════════
          HYMNAIRE EMBED — reproduit le visuel watch shell
          - Bande sombre avec pills (gauche), brand "Hymnaire" (droite)
          - Zone blanche arrondie en dessous avec HymnaireBrowser
          ══════════════════════════════════════════════════════════ */}
      <section className={styles.hymnaireSection} aria-label="Hymnaire">
        <div className={styles.hymnaireBand}>
          <nav className={styles.hymnairePills} aria-label="Familles de cantiques">
            {FAMILLES.map((f) => {
              const isActive = activeFamille === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  className={[
                    styles.hymnairePill,
                    isActive ? styles.hymnairePillActive : '',
                  ].join(' ')}
                  onClick={() => setActiveFamille(f.key)}
                  aria-pressed={isActive}
                >
                  <span>{f.label}</span>
                  <span className={styles.hymnairePillCount}>{f.count}</span>
                </button>
              );
            })}
          </nav>

          <span className={styles.hymnaireLbl}>Hymnaire</span>
        </div>

        <div className={styles.hymnaireRouleau}>
          <HymnaireBrowser famille={activeFamille} />
        </div>
      </section>
    </main>
  );
}
