import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useScrollDirection } from '../../hooks/useScrollDirection';
import { useSubnavOnDark } from '../../hooks/useSubnavOnDark';
import styles from './EgliseLayout.module.css';

const NAV_ITEMS = [
  { to: '/eglise', label: 'eglise.nav.cette-semaine', end: true },
  { to: '/eglise/cultes', label: 'eglise.nav.cultes', end: false },
  { to: '/eglise/cantiques', label: 'eglise.nav.cantiques', end: false },
  { to: '/eglise/annonces', label: 'eglise.nav.annonces', end: false },
  { to: '/eglise/temoignages', label: 'eglise.nav.temoignages', end: false },
] as const;

export default function EgliseLayout() {
  const { t } = useTranslation();
  const { direction, scrollY } = useScrollDirection(80);
  const subnavHidden = direction === 'down' && scrollY > 80;
  /* Détection dynamique : la subnav est "dark" tant que son bord
     inférieur se trouve au-dessus d'un élément `[data-page-hero]`.
     Cela s'adapte automatiquement à la hauteur du hero de chaque
     page (Annonces, Témoignages, Cultes, Cantiques, etc.). */
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
        aria-label="Navigation de l'espace Église"
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
