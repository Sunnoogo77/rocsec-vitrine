import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useScrollDirection } from '../../hooks/useScrollDirection';
import { useSubnavOnDark } from '../../hooks/useSubnavOnDark';
import styles from './GeneseLayout.module.css';

const NAV_ITEMS = [
  { to: '/genese', label: 'genese.nav.sommaire', end: true },
  { to: '/genese/presentation', label: 'genese.nav.presentation', end: false },
  { to: '/genese/naissance', label: 'genese.nav.naissance', end: false },
  { to: '/genese/mission', label: 'genese.nav.mission', end: false },
  { to: '/genese/branham', label: 'genese.nav.branham', end: false },
  { to: '/genese/actes-du-saint-esprit', label: 'genese.nav.actes', end: false },
  { to: '/genese/offices', label: 'genese.nav.offices', end: false },
  { to: '/genese/services', label: 'genese.nav.services', end: false },
] as const;

export default function GeneseLayout() {
  const { t } = useTranslation();
  const { direction, scrollY } = useScrollDirection(80);
  const subnavHidden = direction === 'down' && scrollY > 80;
  /* Détection dynamique : la subnav est "dark" tant qu'elle survole
     un `[data-page-hero]` (le hero sombre de chaque page Genèse).
     Plus de seuil arbitraire de 420px qui était inadapté à plusieurs
     pages où le hero a une hauteur différente. */
  const subnavOnDark = useSubnavOnDark();

  return (
    <>
      <div className={styles.headerSpacer} aria-hidden="true" />
      <nav
        data-sticky-subnav
        className={[
          styles.subnav,
          subnavOnDark ? styles.subnavDark : styles.subnavLight,
          subnavHidden ? styles.subnavHidden : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-label="Navigation de l'espace Genèse"
      >
        <div className={styles.subnavInner}>
          {NAV_ITEMS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                isActive ? `${styles.subnavLink} ${styles.subnavLinkActive}` : styles.subnavLink
              }
            >
              {t(label)}
            </NavLink>
          ))}
        </div>
      </nav>
      <Outlet />
    </>
  );
}
