import { useMemo, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useSermons } from '../../hooks/useSermons';
import type { Sermon, TypeCulte } from '../../types';
import { youtubeThumbnail } from '../../utils/youtube';
import FilterSheet from '../../components/ui/FilterSheet/FilterSheet';
import styles from './Cultes.module.css';

/* ============================================================
   CULTES — Bibliothèque pure des prédications
   ------------------------------------------------------------
   Cette route ne joue plus de vidéo. Au clic sur une capsule on
   navigue vers /eglise/cultes/watch/:id qui est une page DÉDIÉE
   à la visualisation (sans header global, sans subnav, sans
   footer ; voir CultesWatch.tsx).
   ============================================================ */

/* ── Helpers / constants ────────────────────────────────── */

const TYPE_LABELS: Record<TypeCulte, string> = {
  'culte-dimanche':    'Culte dominical',
  'culte-mercredi':    'Culte du mercredi',
  'reunion-priere':    'Réunion de prière',
  'etude-doctrinale':  'Étude doctrinale',
  'convention':        'Convention',
  'evenement-special': 'Événement spécial',
  'bapteme':           'Baptême',
  'sainte-cene':       'Sainte Cène',
  'q-et-r':            'Questions & Réponses',
};

const TYPE_LIST: TypeCulte[] = [
  'culte-dimanche',
  'culte-mercredi',
  'convention',
  'evenement-special',
  'bapteme',
  'sainte-cene',
  'q-et-r',
  'reunion-priere',
];

type SortOrder = 'desc' | 'asc';

interface MonthGroup {
  key: string;
  label: string;
  items: Sermon[];
}

function formatMonthLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const raw = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function monthKey(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const wd = d.toLocaleDateString('fr-FR', { weekday: 'short' });
  const wdCap = wd.charAt(0).toUpperCase() + wd.slice(1).replace('.', '');
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${wdCap} ${dd}.${mm}`;
}

function groupByMonth(items: Sermon[], order: SortOrder): MonthGroup[] {
  const map = new Map<string, MonthGroup>();
  for (const s of items) {
    const key = monthKey(s.date);
    if (!map.has(key)) {
      map.set(key, { key, label: formatMonthLabel(s.date), items: [] });
    }
    map.get(key)!.items.push(s);
  }
  const groups = [...map.values()].sort((a, b) =>
    order === 'desc' ? b.key.localeCompare(a.key) : a.key.localeCompare(b.key),
  );
  for (const g of groups) {
    g.items.sort((a, b) =>
      order === 'desc' ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date),
    );
  }
  return groups;
}

function countBy<K extends string>(items: Sermon[], pick: (s: Sermon) => K | undefined): Map<K, number> {
  const out = new Map<K, number>();
  for (const s of items) {
    const v = pick(s);
    if (v === undefined) continue;
    out.set(v, (out.get(v) ?? 0) + 1);
  }
  return out;
}

function toggleInSet<T>(set: Set<T>, item: T): Set<T> {
  const next = new Set(set);
  if (next.has(item)) next.delete(item); else next.add(item);
  return next;
}

/* ── Icônes ──────────────────────────────────────────────── */

interface IconProps { size?: number }

const IconCalendar = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IconUser = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconTag = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

const IconLayers = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

const IconSort = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="21" y1="10" x2="3" y2="10" />
    <line x1="21" y1="6"  x2="3" y2="6" />
    <line x1="21" y1="14" x2="9" y2="14" />
    <line x1="21" y1="18" x2="13" y2="18" />
  </svg>
);

interface FilterSectionMeta {
  key: string;
  title: string;
  icon: React.ReactNode;
}

const FILTER_SECTIONS: FilterSectionMeta[] = [
  { key: 'annee',       title: 'Année',       icon: <IconCalendar /> },
  { key: 'predicateur', title: 'Prédicateur', icon: <IconUser /> },
  { key: 'type',        title: 'Type',        icon: <IconTag /> },
  { key: 'serie',       title: 'Série',       icon: <IconLayers /> },
  { key: 'tri',         title: 'Tri',         icon: <IconSort /> },
];

/* ══════════════════════════════════════════════════════════
   COMPOSANT
   ══════════════════════════════════════════════════════════ */

type SidebarMode = 'full' | 'rail';

export default function Cultes() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: sermons } = useSermons();

  const [query, setQuery] = useState('');
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>('full');

  const [selectedYears, setSelectedYears] = useState<Set<string>>(new Set());
  const [selectedPredicateurs, setSelectedPredicateurs] = useState<Set<string>>(new Set());
  const [selectedTypes, setSelectedTypes] = useState<Set<TypeCulte>>(new Set());
  const [selectedSeries, setSelectedSeries] = useState<Set<string>>(new Set());
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const yearsCount = useMemo(() => countBy(sermons, (s) => s.date.slice(0, 4)), [sermons]);
  const predicateursCount = useMemo(() => countBy(sermons, (s) => s.predicateur), [sermons]);
  const typesCount = useMemo(() => countBy(sermons, (s) => s.typeCulte), [sermons]);
  // On ne compte que les sermons qui appartiennent vraiment à une série.
  // Les sermons indépendants (serie === '') ne créent PAS une option "vide"
  // dans le filtre — ils restent visibles dans la liste complète mais ne
  // peuvent pas être ciblés par le filtre série (ce qui est bien le sens
  // attendu : un sermon hors-série n'est dans aucune série).
  const seriesCount = useMemo(
    () => countBy(sermons.filter((s) => s.serie && s.serie.trim().length > 0), (s) => s.serie),
    [sermons],
  );

  const years = useMemo(
    () => [...yearsCount.keys()].sort((a, b) => b.localeCompare(a)),
    [yearsCount],
  );
  const predicateurs = useMemo(
    () => [...predicateursCount.keys()].sort(),
    [predicateursCount],
  );
  const series = useMemo(() => [...seriesCount.keys()].sort(), [seriesCount]);

  const filteredSermons = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sermons.filter((s) => {
      if (selectedYears.size > 0 && !selectedYears.has(s.date.slice(0, 4))) return false;
      if (selectedPredicateurs.size > 0 && !selectedPredicateurs.has(s.predicateur)) return false;
      if (selectedTypes.size > 0 && (!s.typeCulte || !selectedTypes.has(s.typeCulte))) return false;
      if (selectedSeries.size > 0 && !selectedSeries.has(s.serie)) return false;
      if (q.length > 0) {
        const haystack = [
          s.titre,
          s.serie,
          s.predicateur,
          s.description ?? '',
          ...s.passages.map((p) => `${p.reference} ${p.texte}`),
          ...s.citationsBranham.map((c) => `${c.source} ${c.texte}`),
        ].join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [sermons, query, selectedYears, selectedPredicateurs, selectedTypes, selectedSeries]);

  const groups = useMemo(
    () => groupByMonth(filteredSermons, sortOrder),
    [filteredSermons, sortOrder],
  );

  const hasActiveFilters =
    query.length > 0 ||
    selectedYears.size > 0 ||
    selectedPredicateurs.size > 0 ||
    selectedTypes.size > 0 ||
    selectedSeries.size > 0 ||
    sortOrder !== 'desc';

  /* Compteur de filtres actifs affiché sur le bouton "Filtrer" mobile
     (hors recherche : on compte les catégories de filtres explicitement
     sélectionnées). */
  const activeFilterCount =
    selectedYears.size +
    selectedPredicateurs.size +
    selectedTypes.size +
    selectedSeries.size +
    (sortOrder !== 'desc' ? 1 : 0);

  /* Sheet de filtres pour mobile (≤ 820px). La sidebar desktop reste
     l'expérience principale, le sheet en est juste le proxy tactile. */
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  const resetAll = useCallback(() => {
    setQuery('');
    setSelectedYears(new Set());
    setSelectedPredicateurs(new Set());
    setSelectedTypes(new Set());
    setSelectedSeries(new Set());
    setSortOrder('desc');
  }, []);

  const openSermon = useCallback((sermon: Sermon) => {
    navigate(`/eglise/cultes/watch/${sermon.id}`);
  }, [navigate]);

  /* Markup partagé entre la sidebar desktop et le FilterSheet mobile.
     Une seule source de vérité pour les groupes de filtres. */
  const filterBlocks = (
    <>
      <FilterGroup title="Année" icon={<IconCalendar />} defaultOpen>
        {years.map((yr) => (
          <FilterRow
            key={yr}
            label={yr}
            count={yearsCount.get(yr) ?? 0}
            checked={selectedYears.has(yr)}
            onToggle={() => setSelectedYears((prev) => toggleInSet(prev, yr))}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Prédicateur" icon={<IconUser />}>
        {predicateurs.map((p) => (
          <FilterRow
            key={p}
            label={p}
            count={predicateursCount.get(p) ?? 0}
            checked={selectedPredicateurs.has(p)}
            onToggle={() => setSelectedPredicateurs((prev) => toggleInSet(prev, p))}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Type" icon={<IconTag />}>
        {TYPE_LIST.filter((tp) => typesCount.has(tp)).map((tp) => (
          <FilterRow
            key={tp}
            label={TYPE_LABELS[tp]}
            count={typesCount.get(tp) ?? 0}
            checked={selectedTypes.has(tp)}
            onToggle={() => setSelectedTypes((prev) => toggleInSet(prev, tp))}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Série" icon={<IconLayers />}>
        {series.map((s) => (
          <FilterRow
            key={s}
            label={s}
            count={seriesCount.get(s) ?? 0}
            checked={selectedSeries.has(s)}
            onToggle={() => setSelectedSeries((prev) => toggleInSet(prev, s))}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Tri" icon={<IconSort />} defaultOpen>
        <FilterRow
          label="Plus récent au plus ancien"
          count={null}
          checked={sortOrder === 'desc'}
          onToggle={() => setSortOrder('desc')}
          radio
        />
        <FilterRow
          label="Plus ancien au plus récent"
          count={null}
          checked={sortOrder === 'asc'}
          onToggle={() => setSortOrder('asc')}
          radio
        />
      </FilterGroup>
    </>
  );

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

  const onRailIconClick = useCallback(() => setSidebarMode('full'), []);

  const sidebarIsRail = sidebarMode === 'rail';

  return (
    <main id="main-content" className={styles.page}>

      {/* HERO glass dark */}
      <section data-page-hero className={styles.hero} aria-label={t('eglise.cultes.eyebrow')}>
        <div className={styles.heroInner}>
          <div className={styles.heroEyebrow}>{t('eglise.cultes.eyebrow')}</div>
          <h1 className={styles.heroTitle}>
            {t('eglise.cultes.titreLine1')}<br />
            <em>{t('eglise.cultes.titreLine2')}</em>
          </h1>
          <div className={styles.heroRef}>{t('eglise.cultes.ref')}</div>
          <p className={styles.heroLede}>{t('eglise.cultes.lede')}</p>
          <blockquote className={styles.heroBran}>
            {t('eglise.cultes.branText')}
            <cite className={styles.heroBranCite}>{t('eglise.cultes.branCite')}</cite>
          </blockquote>
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
          aria-label="Découvrir les prédications"
        >
          <span className={styles.scrollHintLabel}>Découvrir la bibliothèque</span>
          <span className={styles.scrollHintArrow} aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </button>
      </section>

      {/* Bande de recherche */}
      <section className={styles.searchBand} aria-label="Rechercher dans la bibliothèque">
        <div className={styles.searchBandInner}>
          <p className={styles.searchCount}>
            {filteredSermons.length === sermons.length
              ? `${sermons.length} prédications · depuis ${
                  [...sermons].sort((a, b) => a.date.localeCompare(b.date))[0]?.date.slice(0, 4) ?? '2021'
                }`
              : `${filteredSermons.length} sur ${sermons.length} prédications`}
          </p>
          <div className={styles.searchRow}>
            <div className={styles.searchBar} role="search">
              <span className={styles.searchIcon} aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7" />
                  <line x1="21" y1="21" x2="16.5" y2="16.5" />
                </svg>
              </span>
              <input
                type="search"
                placeholder="Rechercher un titre, prédicateur, verset…"
                aria-label="Rechercher une prédication"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button
                  type="button"
                  className={styles.searchClear}
                  onClick={() => setQuery('')}
                  aria-label="Effacer la recherche"
                >
                  ×
                </button>
              )}
            </div>

            {/* Bouton "Filtrer" visible uniquement sur mobile (CSS).
                Ouvre une sheet bottom iOS-like avec tous les filtres. */}
            <button
              type="button"
              className={styles.mobileFilterBtn}
              onClick={() => setIsFilterSheetOpen(true)}
              aria-label="Ouvrir les filtres"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                   aria-hidden="true">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="7" y1="12" x2="17" y2="12" />
                <line x1="10" y1="18" x2="14" y2="18" />
              </svg>
              <span>Filtrer</span>
              {activeFilterCount > 0 && (
                <span className={styles.mobileFilterCount}>{activeFilterCount}</span>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Board : sidebar + grille */}
      <section className={[
        styles.board,
        sidebarIsRail ? styles.boardSidebarRail : '',
      ].join(' ')}>

        <aside
          className={[styles.sidebar, sidebarIsRail ? styles.sidebarRail : ''].join(' ')}
          aria-label="Filtres"
        >
          <div className={styles.sidebarInner}>

            <div className={styles.sidebarHead}>
              {!sidebarIsRail && <span className={styles.sidebarLbl}>Filtres</span>}
              <button
                type="button"
                className={styles.sidebarToggle}
                onClick={() => setSidebarMode((m) => (m === 'full' ? 'rail' : 'full'))}
                aria-label={sidebarIsRail ? 'Déplier les filtres' : 'Réduire les filtres'}
              >
                {sidebarIsRail ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="13 17 18 12 13 7" />
                    <polyline points="6 17 11 12 6 7" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="11 17 6 12 11 7" />
                    <polyline points="18 17 13 12 18 7" />
                  </svg>
                )}
              </button>
            </div>

            {sidebarIsRail ? (
              <div className={styles.sidebarRailIcons}>
                {FILTER_SECTIONS.map((section) => (
                  <button
                    key={section.key}
                    type="button"
                    className={styles.railIcon}
                    onClick={onRailIconClick}
                    aria-label={section.title}
                    title={section.title}
                  >
                    {section.icon}
                  </button>
                ))}
              </div>
            ) : (
              <>
                <div className={styles.sidebarScroll}>
                  {filterBlocks}
                </div>

                <div className={styles.sidebarFoot}>
                  <button
                    type="button"
                    className={styles.sidebarReset}
                    disabled={!hasActiveFilters}
                    onClick={resetAll}
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              </>
            )}
          </div>
        </aside>

        <div className={styles.center}>
          <div className={styles.content}>
            {groups.length === 0 ? (
              <EmptyResults onReset={resetAll} active={hasActiveFilters} />
            ) : (
              groups.map((group) => (
                <section key={group.key} className={styles.monthBlock} aria-label={group.label}>
                  <header className={styles.monthHeader}>
                    <h2 className={styles.monthTitle}>{group.label}</h2>
                    <span className={styles.monthCount}>
                      {group.items.length} prédication{group.items.length > 1 ? 's' : ''}
                    </span>
                    <span className={styles.monthRule} aria-hidden="true" />
                  </header>
                  <div className={styles.grid}>
                    {group.items.map((s) => (
                      <Capsule key={s.id} sermon={s} onOpen={openSermon} />
                    ))}
                  </div>
                </section>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── Sheet bottom modale : filtres sur mobile ── */}
      <FilterSheet
        open={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        title="Filtres"
        activeCount={activeFilterCount}
        onReset={hasActiveFilters ? resetAll : undefined}
        onApply={() => setIsFilterSheetOpen(false)}
        applyLabel={
          filteredSermons.length === sermons.length
            ? 'Voir tout'
            : `Voir ${filteredSermons.length} résultat${filteredSermons.length > 1 ? 's' : ''}`
        }
      >
        {/* Wrapper qui force la variante "fond clair" sur les FilterGroup
            (par défaut conçus pour la sidebar bleu nuit). */}
        <div className={styles.filterBlocksLight}>
          {filterBlocks}
        </div>
      </FilterSheet>
    </main>
  );
}

/* ══════════════════════════════════════════════════════════
   CAPSULE VIDÉO
   ══════════════════════════════════════════════════════════ */

interface CapsuleProps {
  sermon: Sermon;
  onOpen: (s: Sermon) => void;
}

function Capsule({ sermon, onOpen }: CapsuleProps) {
  const thumb = sermon.thumbnail ?? youtubeThumbnail(sermon.videoUrl);
  const typeLabel = sermon.typeCulte ? TYPE_LABELS[sermon.typeCulte] : null;
  const titleClean = sermon.titre.replace(/\.$/, '');

  const onActivate = () => onOpen(sermon);
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onActivate();
    }
  };

  return (
    <article
      className={styles.capsule}
      role="button"
      tabIndex={0}
      onClick={onActivate}
      onKeyDown={onKey}
      aria-label={`Ouvrir la prédication : ${sermon.titre}`}
    >
      <div className={styles.thumb}>
        {thumb && <img src={thumb} alt="" className={styles.thumbImg} loading="lazy" />}
        <div className={styles.thumbOverlay} aria-hidden="true" />
        {sermon.duree && (
          <span className={styles.duration} aria-hidden="true">{sermon.duree}</span>
        )}
        <button
          type="button"
          className={styles.playBtn}
          tabIndex={-1}
          aria-hidden="true"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
        {typeLabel && <span className={styles.typeBadge}>{typeLabel}</span>}
      </div>

      <div className={styles.capsuleBody}>
        <h3 className={styles.capsuleTitle}>{titleClean}</h3>
        <p className={styles.capsuleMeta}>
          <span className={styles.capsulePredicateur}>{sermon.predicateur}</span>
          <span className={styles.capsuleDot} aria-hidden="true">·</span>
          <span className={styles.capsuleDate}>{formatShortDate(sermon.date)}</span>
        </p>
        {sermon.serie && (
          <p className={styles.capsuleSerie}>
            {sermon.serie}
            {sermon.numeroSerie ? ` · n°${String(sermon.numeroSerie).padStart(2, '0')}` : ''}
          </p>
        )}
      </div>
    </article>
  );
}

/* ══════════════════════════════════════════════════════════
   FILTRE — composants sidebar
   ══════════════════════════════════════════════════════════ */

interface FilterGroupProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function FilterGroup({ title, icon, children, defaultOpen = false }: FilterGroupProps) {
  return (
    <details className={styles.filterGroup} open={defaultOpen}>
      <summary className={styles.filterGroupTitle}>
        <span className={styles.filterGroupTitleLeft}>
          {icon && <span className={styles.filterGroupIcon}>{icon}</span>}
          <span>{title}</span>
        </span>
        <span className={styles.filterChevron} aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </summary>
      <div className={styles.filterRows}>{children}</div>
    </details>
  );
}

interface FilterRowProps {
  label: string;
  count: number | null;
  checked: boolean;
  onToggle: () => void;
  radio?: boolean;
}

function FilterRow({ label, count, checked, onToggle, radio = false }: FilterRowProps) {
  return (
    <label className={styles.filterRow}>
      <input
        type={radio ? 'radio' : 'checkbox'}
        className={styles.filterCheckbox}
        checked={checked}
        onChange={onToggle}
        name={radio ? 'sort-order' : undefined}
      />
      <span className={styles.filterRowLabel}>{label}</span>
      {count !== null && <span className={styles.filterRowCount}>{count}</span>}
    </label>
  );
}

/* ══════════════════════════════════════════════════════════
   EMPTY STATE
   ══════════════════════════════════════════════════════════ */

function EmptyResults({ active, onReset }: { active: boolean; onReset: () => void }) {
  return (
    <div className={styles.emptyResults}>
      <div className={styles.emptyResultsIcon} aria-hidden="true">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.5" y2="16.5" />
        </svg>
      </div>
      <h3 className={styles.emptyResultsTitle}>Aucune prédication ne correspond.</h3>
      <p className={styles.emptyResultsDesc}>
        Ajustez vos filtres ou la recherche pour élargir les résultats.
      </p>
      {active && (
        <button type="button" className={styles.emptyResultsBtn} onClick={onReset}>
          Réinitialiser les filtres
        </button>
      )}
    </div>
  );
}
