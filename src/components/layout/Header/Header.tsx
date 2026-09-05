import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { LivePill } from '../../ui/LivePill/LivePill';
import { useScrollDirection } from '../../../hooks/useScrollDirection';
import { asset } from '../../../utils/asset';
import styles from './Header.module.css';

export default function Header() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { direction, scrollY, pastHero } = useScrollDirection(80);

  const hidden = direction === 'down' && scrollY > 80;
  // Fond sombre sur les pages dont l'entrée est bleu naval.
  const hasShortDarkIntro = pathname.startsWith('/genese') || pathname.startsWith('/eglise');
  const onDark =
    ((pathname === '/' || pathname === '/nehemie') && !pastHero) ||
    (hasShortDarkIntro && scrollY < 420);

  const toggleLang = () => {
    void i18n.changeLanguage(i18n.language === 'fr' ? 'en' : 'fr');
  };

  /* ── Menu mobile (drawer plein écran) ───────────────────────────── */
  const [mobileOpen, setMobileOpen] = useState(false);
  const burgerRef = useRef<HTMLButtonElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  // Ferme le drawer à chaque changement d'URL (navigation par lien).
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock du scroll body + Escape pour fermer + focus initial.
  useEffect(() => {
    if (!mobileOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', onKey);

    // Focus le bouton de fermeture pour la navigation clavier.
    closeBtnRef.current?.focus();

    const burger = burgerRef.current;
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
      // Restaure le focus sur le burger quand on ferme.
      burger?.focus();
    };
  }, [mobileOpen]);

  return (
    <>
      <a href="#main-content" className={styles.skipLink}>
        {t('accessibility.skipToContent')}
      </a>
      <header
        className={[
          styles.header,
          hidden ? styles.hidden : '',
          onDark ? styles.onDark : styles.onLight,
          onDark && hasShortDarkIntro ? styles.onProtectedDark : '',
          scrollY > 12 && !onDark ? styles.scrolled : '',
        ]
          .filter(Boolean)
          .join(' ')}
        role="banner"
      >
        <div className={styles.inner}>
          {/* Logo officiel */}
          <NavLink to="/" className={styles.logo} aria-label={t('accessibility.logoAlt')}>
            <img
              src={asset('/logo-rst.png')}
              alt="Roc Séculaire Tabernacle"
              className={styles.logoImg}
              width={72}
              height={46}
            />
            <span className={styles.logoName}>Roc Séculaire Tabernacle</span>
          </NavLink>

          {/* Navigation principale (desktop / tablette) */}
          <nav className={styles.nav} aria-label="Navigation principale">
            <NavLink
              to="/"
              end
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
            >
              {t('nav.accueil')}
            </NavLink>
            <NavLink
              to="/nehemie"
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
            >
              {t('nav.nehemie')}
            </NavLink>
            <NavLink
              to="/genese"
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
            >
              {t('nav.genese')}
            </NavLink>
            <NavLink
              to="/eglise"
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
            >
              {t('nav.eglise')}
            </NavLink>
          </nav>

          {/* Utilitaires droite (desktop) */}
          <div className={styles.utility}>
            <LivePill onClick={() => navigate('/eglise')} />
            <div className={styles.langToggle} role="group" aria-label="Langue">
              <button
                className={`${styles.lang} ${i18n.language === 'fr' ? styles.langActive : ''}`}
                onClick={toggleLang}
                aria-label={t('accessibility.langFr')}
                aria-pressed={i18n.language === 'fr'}
              >
                FR
              </button>
              <span className={styles.langSep} aria-hidden="true">|</span>
              <button
                className={`${styles.lang} ${i18n.language === 'en' ? styles.langActive : ''}`}
                onClick={toggleLang}
                aria-label={t('accessibility.langEn')}
                aria-pressed={i18n.language === 'en'}
              >
                EN
              </button>
            </div>
          </div>

          {/* Bouton burger — visible uniquement sous 600 px via CSS */}
          <button
            ref={burgerRef}
            type="button"
            className={styles.burger}
            aria-label={t('accessibility.openMenu')}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu-drawer"
            onClick={() => setMobileOpen(true)}
          >
            <span className={styles.burgerBar} aria-hidden="true" />
            <span className={styles.burgerBar} aria-hidden="true" />
            <span className={styles.burgerBar} aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Drawer plein écran — rendu via portal pour échapper au z-index du header */}
      {mobileOpen &&
        createPortal(
          <div
            id="mobile-menu-drawer"
            className={styles.drawer}
            role="dialog"
            aria-modal="true"
            aria-label={t('accessibility.openMenu')}
          >
            <div className={styles.drawerHeader}>
              <NavLink
                to="/"
                className={styles.drawerLogo}
                onClick={() => setMobileOpen(false)}
              >
                <img
                  src={asset('/logo-rst.png')}
                  alt="Roc Séculaire Tabernacle"
                  className={styles.drawerLogoImg}
                  width={56}
                  height={36}
                />
                <span className={styles.drawerLogoName}>Roc Séculaire Tabernacle</span>
              </NavLink>
              <button
                ref={closeBtnRef}
                type="button"
                className={styles.drawerClose}
                aria-label={t('accessibility.closeMenu')}
                onClick={() => setMobileOpen(false)}
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>

            <nav className={styles.drawerNav} aria-label="Navigation principale">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `${styles.drawerLink} ${isActive ? styles.drawerLinkActive : ''}`
                }
              >
                {t('nav.accueil')}
              </NavLink>
              <NavLink
                to="/nehemie"
                className={({ isActive }) =>
                  `${styles.drawerLink} ${isActive ? styles.drawerLinkActive : ''}`
                }
              >
                {t('nav.nehemie')}
              </NavLink>
              <NavLink
                to="/genese"
                className={({ isActive }) =>
                  `${styles.drawerLink} ${isActive ? styles.drawerLinkActive : ''}`
                }
              >
                {t('nav.genese')}
              </NavLink>
              <NavLink
                to="/eglise"
                className={({ isActive }) =>
                  `${styles.drawerLink} ${isActive ? styles.drawerLinkActive : ''}`
                }
              >
                {t('nav.eglise')}
              </NavLink>
            </nav>

            <div className={styles.drawerFooter}>
              <LivePill
                onClick={() => {
                  setMobileOpen(false);
                  navigate('/eglise');
                }}
              />
              <div className={styles.drawerLangToggle} role="group" aria-label="Langue">
                <button
                  className={`${styles.drawerLang} ${i18n.language === 'fr' ? styles.drawerLangActive : ''}`}
                  onClick={toggleLang}
                  aria-label={t('accessibility.langFr')}
                  aria-pressed={i18n.language === 'fr'}
                >
                  FR
                </button>
                <span className={styles.drawerLangSep} aria-hidden="true">|</span>
                <button
                  className={`${styles.drawerLang} ${i18n.language === 'en' ? styles.drawerLangActive : ''}`}
                  onClick={toggleLang}
                  aria-label={t('accessibility.langEn')}
                  aria-pressed={i18n.language === 'en'}
                >
                  EN
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
