import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { AnnonceStatut, AnnonceType } from '../../types';
import { useAnnonces } from '../../hooks/useAnnonces';
import { asset } from '../../utils/asset';
import styles from './Annonces.module.css';

type FilterStatut = AnnonceStatut | 'toutes';
type FilterType   = AnnonceType   | 'toutes';

const TYPE_DISPLAY: Record<AnnonceType, string> = {
  reunion:        'Réunion',
  voyage:         'Voyage',
  sortie:         'Sortie',
  exceptionnelle: 'Exceptionnelle',
};

function getDn(dateStr: string): string {
  return String(new Date(dateStr).getDate());
}

function getDl(dl?: string, dateStr?: string): string {
  if (dl) return dl;
  if (!dateStr) return '';
  const d   = new Date(dateStr);
  const wd  = d.toLocaleDateString('fr-FR', { weekday: 'short' })
                .toUpperCase().replace('.', '').slice(0, 3);
  const mo  = d.toLocaleDateString('fr-FR', { month:   'short' })
                .toUpperCase().replace('.', '').slice(0, 3);
  return `${wd}. ${mo}`;
}

function getMonthKey(dateStr: string): string {
  const d   = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function getMonthLabel(dateStr: string): string {
  const d   = new Date(dateStr);
  const raw = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export default function Annonces() {
  const { t } = useTranslation();
  const { data: annonces } = useAnnonces();
  const [filterStatut, setFilterStatut] = useState<FilterStatut>('toutes');
  const [filterType,   setFilterType]   = useState<FilterType>('toutes');

  /* Carousel : on tourne entre toutes les annonces à venir.
     Index initial = la plus proche chronologiquement. */
  const upcoming = annonces
    .filter((a) => a.statut === 'a-venir')
    .sort((a, b) => a.date.localeCompare(b.date));
  const [featuredIdx, setFeaturedIdx] = useState(0);
  const featured = upcoming[featuredIdx] ?? upcoming[0];

  const chronoAll = annonces.filter((a) => a.id !== featured?.id);

  const filtered = chronoAll.filter((a) => {
    if (filterStatut !== 'toutes' && a.statut !== filterStatut) return false;
    if (filterType   !== 'toutes' && a.type   !== filterType)   return false;
    return true;
  });

  /* Group by month, most-recent first */
  const monthMap = new Map<string, { label: string; key: string; items: typeof filtered }>();
  filtered.forEach((a) => {
    const key   = getMonthKey(a.date);
    const label = getMonthLabel(a.date);
    if (!monthMap.has(key)) monthMap.set(key, { label, key, items: [] });
    monthMap.get(key)!.items.push(a);
  });
  const groups = Array.from(monthMap.values()).sort((a, b) => b.key.localeCompare(a.key));

  /* Featured flag */
  const featuredFlagCls =
    featured?.statut === 'aujourd-hui' ? styles.flagToday :
    featured?.statut === 'passee'      ? styles.flagPast  :
    styles.flagSoon;
  const featuredFlagText =
    featured?.statut === 'aujourd-hui' ? "AUJOURD'HUI" :
    featured?.statut === 'passee'      ? 'PASSÉE' : 'À VENIR';

  /* Chip helpers */
  function chipSt(v: FilterStatut, label: string, muted = false) {
    const active = filterStatut === v;
    return (
      <button
        key={v}
        className={[
          styles.chip,
          active                  ? styles.chipActive : '',
          muted && !active        ? styles.chipMuted  : '',
        ].filter(Boolean).join(' ')}
        onClick={() => setFilterStatut(active && v !== 'toutes' ? 'toutes' : v)}
      >
        {label}
      </button>
    );
  }

  function chipTy(v: FilterType, label: string) {
    const active = filterType === v;
    return (
      <button
        key={v}
        className={[styles.chip, active ? styles.chipActive : ''].filter(Boolean).join(' ')}
        onClick={() => setFilterType(active ? 'toutes' : v)}
      >
        {label}
      </button>
    );
  }

  return (
    <div>

      {/* ── HERO ───────────────────────────────────────────────── */}
      <section data-page-hero className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.eyebrow}>{t('eglise.annonces.eyebrow')}</div>
          <h1 className={styles.heroTitle}>
            {t('eglise.annonces.titreLine1')}<br /><em>{t('eglise.annonces.titreLine2')}</em>
          </h1>
          <p className={styles.heroLede}>{t('eglise.annonces.lede')}</p>
        </div>
      </section>

      {/* ── FILTRES ────────────────────────────────────────────── */}
      <section className={styles.filters}>
        <div className={styles.filtersInner}>
          <div className={styles.filterGroup}>
            <span className={styles.lbl}>État</span>
            {chipSt('toutes',      'Toutes')}
            {chipSt('a-venir',     'À venir')}
            {chipSt('aujourd-hui', "Aujourd'hui")}
            {chipSt('passee',      'Passées', true)}
          </div>
          <div className={styles.filterGroup}>
            <span className={styles.lbl}>Type</span>
            {chipTy('reunion',        'Réunion')}
            {chipTy('voyage',         'Voyage')}
            {chipTy('sortie',         'Sortie')}
            {chipTy('exceptionnelle', 'Exceptionnelle')}
          </div>
        </div>
      </section>

      {/* ── ANNONCE PHARE — carousel sur les annonces à venir ─── */}
      {featured && (
        <section className={styles.featured}>
          <Link
            to={`/eglise/annonces/${featured.id}`}
            className={styles.featuredCard}
            aria-label={`Voir le détail : ${featured.titre}${featured.titreEm ? ' ' + featured.titreEm : ''}`}
          >

            <div className={styles.featuredImg}>
              {(featured.affiche || featured.image) && (
                <img
                  src={asset(featured.affiche ?? featured.image ?? '')}
                  alt={featured.titre}
                />
              )}
              <span className={`${styles.statusFlag} ${featuredFlagCls}`}>
                {featuredFlagText}
              </span>
            </div>

            <div className={styles.featuredBody}>
              {featured.featuredEyebrow && (
                <div className={styles.featuredEyebrow}>{featured.featuredEyebrow}</div>
              )}
              <h2>
                {featured.titre}
                {featured.titreEm && <><br /><em>{featured.titreEm}</em></>}
              </h2>
              <p>{featured.description}</p>
              {featured.featuredMeta && (
                <div className={styles.featuredMeta}>
                  {featured.featuredMeta.map((m) => (
                    <div key={m.lbl}>
                      <span className={styles.mLbl}>{m.lbl}</span>
                      <span className={styles.mVal}>{m.val}</span>
                    </div>
                  ))}
                </div>
              )}
              <span className={styles.moreLine}>
                En savoir plus →
              </span>
            </div>

          </Link>

          {upcoming.length > 1 && (
            <div className={styles.carouselNav} aria-label="Naviguer entre les annonces à venir">
              <button
                type="button"
                className={styles.carouselArrow}
                onClick={() => setFeaturedIdx((i) => (i - 1 + upcoming.length) % upcoming.length)}
                aria-label="Annonce précédente"
              >
                ←
              </button>
              <span className={styles.carouselDots} aria-hidden="true">
                {upcoming.map((_, i) => (
                  <span
                    key={i}
                    className={`${styles.carouselDot} ${i === featuredIdx ? styles.carouselDotActive : ''}`}
                  />
                ))}
              </span>
              <span className={styles.carouselCount}>
                {featuredIdx + 1} / {upcoming.length}
              </span>
              <button
                type="button"
                className={styles.carouselArrow}
                onClick={() => setFeaturedIdx((i) => (i + 1) % upcoming.length)}
                aria-label="Annonce suivante"
              >
                →
              </button>
            </div>
          )}
        </section>
      )}

      {/* ── CHRONOLOGIE ────────────────────────────────────────── */}
      <section className={styles.chrono}>
        {groups.map((group) => (
          <div key={group.key} className={styles.chronoMonth}>

            <div className={styles.monthHead}>
              <span className={styles.monthLbl}>{group.label}</span>
              <span className={styles.monthCount}>
                {group.items.length} annonce{group.items.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className={styles.chronoList}>
              {group.items.map((a) => {
                const stateCls =
                  a.statut === 'aujourd-hui' ? styles.stateToday :
                  a.statut === 'passee'      ? styles.statePast  :
                  styles.stateSoon;

                const typeText =
                  a.sousTypeLabel ??
                  `${TYPE_DISPLAY[a.type]}${a.sousType ? ` · ${a.sousType}` : ''}`;

                return (
                  <Link
                    key={a.id}
                    to={`/eglise/annonces/${a.id}`}
                    className={`${styles.annCard} ${stateCls}`}
                  >

                    <div className={styles.annDate}>
                      <span className={styles.dn}>{getDn(a.date)}</span>
                      <span className={styles.dl}>{getDl(a.dl, a.date)}</span>
                    </div>

                    <div className={styles.annBody}>
                      <span className={styles.annType}>{typeText}</span>
                      <h3>{a.titre}</h3>
                      <p>{a.description}</p>
                    </div>

                    <div className={[
                      styles.annState,
                      a.statut === 'aujourd-hui' ? styles.stateTodayTag :
                      a.statut === 'passee'      ? styles.statePastTag  :
                      styles.stateSoonTag,
                    ].join(' ')}>
                      {a.statut === 'aujourd-hui' ? "Aujourd'hui" :
                       a.statut === 'passee'      ? 'Passée'      : 'À venir'}
                    </div>

                  </Link>
                );
              })}
            </div>

          </div>
        ))}

        {filtered.length === 0 && (
          <p className={styles.empty}>
            Aucune annonce ne correspond à ces filtres.
          </p>
        )}
      </section>

    </div>
  );
}
