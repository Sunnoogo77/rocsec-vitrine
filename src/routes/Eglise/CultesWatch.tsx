import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { useSermons } from '../../hooks/useSermons';
import type { Sermon, TypeCulte } from '../../types';
import { youtubeThumbnail } from '../../utils/youtube';
import YouTubePlayer from '../../components/ui/YouTubePlayer/YouTubePlayer';
import FilterSheet from '../../components/ui/FilterSheet/FilterSheet';
import { asset } from '../../utils/asset';
import styles from './CultesWatch.module.css';

/* ============================================================
   CULTES WATCH — page dédiée à la visualisation
   ------------------------------------------------------------
   Route : /eglise/cultes/watch/:id (hors EgliseLayout, hors
   Header/Footer globaux, voir App.tsx -> Shell).
   Layout :
     - Topbar fixe (custom) avec « Retour à l'espace Église »
     - Sidebar gauche : MÊMES filtres que la bibliothèque
     - Centre : vidéo + infos + passages + plus de prédications
     - Sidebar droite : « À regarder ensuite »
   Mode FILTRÉ (dès qu'une recherche ou un filtre est actif) :
     - Le centre devient la grille des résultats filtrés
     - La vidéo passe en mini-player flottant draggable
     - Le YouTubePlayer N'est jamais démonté → lecture continue
   ============================================================ */

/* ── Constants ──────────────────────────────────────────── */

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

const PIP_WIDTH_DESKTOP  = 380;
const PIP_HEIGHT_DESKTOP = Math.round(PIP_WIDTH_DESKTOP * 9 / 16);
const PIP_WIDTH_MOBILE   = 280;
const PIP_HEIGHT_MOBILE  = Math.round(PIP_WIDTH_MOBILE * 9 / 16);
const PIP_MARGIN = 16;
const PIP_MOBILE_BREAKPOINT = 480;

/* Taille effective du PiP selon la viewport courante. Sur mobile, on
   réduit pour que la mini-vidéo ne mange pas l'écran ni ne soit
   positionnée hors-écran par le calcul JS. */
function getPipSize(): { width: number; height: number } {
  if (typeof window === 'undefined') {
    return { width: PIP_WIDTH_DESKTOP, height: PIP_HEIGHT_DESKTOP };
  }
  return window.innerWidth <= PIP_MOBILE_BREAKPOINT
    ? { width: PIP_WIDTH_MOBILE,  height: PIP_HEIGHT_MOBILE  }
    : { width: PIP_WIDTH_DESKTOP, height: PIP_HEIGHT_DESKTOP };
}

type SortOrder = 'desc' | 'asc';

/* ── Helpers ────────────────────────────────────────────── */

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const wd = d.toLocaleDateString('fr-FR', { weekday: 'short' });
  const wdCap = wd.charAt(0).toUpperCase() + wd.slice(1).replace('.', '');
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${wdCap} ${dd}.${mm}`;
}

function formatLongDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const raw = d.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return raw.charAt(0).toUpperCase() + raw.slice(1);
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

/* ── Icônes (inline pour ne pas multiplier les fichiers) ── */

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

/* ══════════════════════════════════════════════════════════
   COMPOSANT
   ══════════════════════════════════════════════════════════ */

export default function CultesWatch() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: sermons, status } = useSermons();

  const sermon = useMemo(
    () => sermons.find((s) => s.id === id),
    [id, sermons],
  );

  /* Pendant le fetch initial on attend, sinon on redirige. */
  if (!sermon) {
    if (status === 'loading') return null;
    return <Navigate to="/eglise/cultes" replace />;
  }

  return <CultesWatchInner sermon={sermon} sermons={sermons} onBack={() => navigate('/eglise/cultes')} />;
}

interface InnerProps {
  sermon: Sermon;
  sermons: Sermon[];
  onBack: () => void;
}

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

type SidebarMode = 'full' | 'rail';

function CultesWatchInner({ sermon, sermons, onBack }: InnerProps) {
  const navigate = useNavigate();

  /* État UI */
  const [query, setQuery] = useState('');
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>('full');
  const [suggestionsOpen, setSuggestionsOpen] = useState(true);
  const [selectedYears, setSelectedYears] = useState<Set<string>>(new Set());
  const [selectedPredicateurs, setSelectedPredicateurs] = useState<Set<string>>(new Set());
  const [selectedTypes, setSelectedTypes] = useState<Set<TypeCulte>>(new Set());
  const [selectedSeries, setSelectedSeries] = useState<Set<string>>(new Set());
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  /* PiP draggable : position en pixels (fixed). null = position
     par défaut bottom-right calculée au render. */
  const [pipPos, setPipPos] = useState<{ top: number; left: number } | null>(null);
  const dragOffset = useRef<{ dx: number; dy: number } | null>(null);

  /* Détection scroll-out-of-view : observe le slot du player ; quand il
     sort du viewport (l'utilisateur scrolle vers le bas pour voir les
     infos / les autres prédications), on déclenche le mode PiP même si
     aucun filtre n'est posé. */
  const slotRef = useRef<HTMLDivElement>(null);
  const [scrolledOut, setScrolledOut] = useState(false);
  useEffect(() => {
    if (!slotRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setScrolledOut(!entry.isIntersecting || entry.intersectionRatio < 0.3);
      },
      {
        threshold: [0, 0.3, 1],
        rootMargin: '-80px 0px 0px 0px',
      },
    );
    observer.observe(slotRef.current);
    return () => observer.disconnect();
  }, [sermon.id]);

  /* Indices comptés sur le dataset complet — sert aux badges des filtres. */
  const yearsCount = useMemo(() => countBy(sermons, (s) => s.date.slice(0, 4)), [sermons]);
  const predicateursCount = useMemo(() => countBy(sermons, (s) => s.predicateur), [sermons]);
  const typesCount = useMemo(() => countBy(sermons, (s) => s.typeCulte), [sermons]);
  const seriesCount = useMemo(() => countBy(sermons, (s) => s.serie), [sermons]);

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

  const sortedFiltered = useMemo(() => {
    return [...filteredSermons].sort((a, b) =>
      sortOrder === 'desc' ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date),
    );
  }, [filteredSermons, sortOrder]);

  const hasActiveFilters =
    query.length > 0 ||
    selectedYears.size > 0 ||
    selectedPredicateurs.size > 0 ||
    selectedTypes.size > 0 ||
    selectedSeries.size > 0 ||
    sortOrder !== 'desc';

  const isFiltered = hasActiveFilters;

  /* Compteur de filtres actifs (hors recherche), affiché sur le bouton
     "Filtrer" mobile. La recherche a sa propre UI dans la topbar. */
  const activeFilterCount =
    selectedYears.size +
    selectedPredicateurs.size +
    selectedTypes.size +
    selectedSeries.size +
    (sortOrder !== 'desc' ? 1 : 0);

  /* Sheet bottom modale : remplace la sidebar latérale sur mobile.
     La prédication continue de jouer en arrière-plan pendant que
     l'user manipule ses filtres. */
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  const resetAll = useCallback(() => {
    setQuery('');
    setSelectedYears(new Set());
    setSelectedPredicateurs(new Set());
    setSelectedTypes(new Set());
    setSelectedSeries(new Set());
    setSortOrder('desc');
  }, []);

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

  /* Suggestions et "plus de prédications" — toujours basés sur la
     totalité des sermons (sauf celui en cours), triés par date desc. */
  const relatedSermons = useMemo(() => {
    return [...sermons]
      .sort((a, b) => b.date.localeCompare(a.date))
      .filter((s) => s.id !== sermon.id);
  }, [sermon.id, sermons]);

  /* Autoplay « À regarder ensuite » : passe au premier sermon des
     suggestions à la fin de la lecture. */
  const onVideoEnded = useCallback(() => {
    const next = relatedSermons[0];
    if (next) navigate(`/eglise/cultes/watch/${next.id}`);
  }, [relatedSermons, navigate]);

  const switchSermon = useCallback((s: Sermon) => {
    navigate(`/eglise/cultes/watch/${s.id}`);
  }, [navigate]);

  /* Au mount/changement de sermon, scroll de la zone centrale en haut. */
  const centerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    centerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [sermon.id]);

  /* PiP draggable — handlers sur la mini-bar. */
  const onPipDragStart = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    /* Capture la position courante du PiP (pour cas par défaut, on le
       calcule depuis bottom/right). */
    const { width, height } = getPipSize();
    let startTop: number;
    let startLeft: number;
    if (pipPos) {
      startTop  = pipPos.top;
      startLeft = pipPos.left;
    } else {
      startTop  = window.innerHeight - height - PIP_MARGIN;
      startLeft = window.innerWidth  - width  - PIP_MARGIN;
    }
    dragOffset.current = {
      dx: e.clientX - startLeft,
      dy: e.clientY - startTop,
    };
    /* Pendant le drag : empêche la sélection de texte. */
    document.body.style.userSelect = 'none';
  }, [pipPos]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragOffset.current) return;
      const top  = e.clientY - dragOffset.current.dy;
      const left = e.clientX - dragOffset.current.dx;
      const { width, height } = getPipSize();
      const maxTop  = window.innerHeight - height;
      const maxLeft = window.innerWidth  - width;
      setPipPos({
        top:  Math.max(0, Math.min(maxTop, top)),
        left: Math.max(0, Math.min(maxLeft, left)),
      });
    };
    const onUp = () => {
      if (!dragOffset.current) return;
      dragOffset.current = null;
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  /* Mode PiP global : déclenché par le mode filtré OU par le scroll
     du player hors viewport (l'utilisateur explore les infos en bas). */
  const isPip = isFiltered || scrolledOut;

  /* Style inline du wrap PiP : fixed avec position.
     ATTENTION : on doit explicitement annuler les top/left/inset hérités
     du CSS de base (.playerWrap a position:absolute; inset:0) sinon le
     wrapper s'ancre en haut-gauche au lieu d'utiliser bottom/right. */
  const pipSize = isPip ? getPipSize() : null;
  const pipStyle: React.CSSProperties = isPip && pipSize
    ? (pipPos
        ? {
            position: 'fixed',
            top: pipPos.top,
            left: pipPos.left,
            right: 'auto',
            bottom: 'auto',
            width: pipSize.width,
            height: pipSize.height,
          }
        : {
            position: 'fixed',
            top: 'auto',
            left: 'auto',
            bottom: PIP_MARGIN,
            right: PIP_MARGIN,
            width: pipSize.width,
            height: pipSize.height,
          })
    : {};

  const titleClean = sermon.titre.replace(/\.$/, '');

  const sidebarIsRail = sidebarMode === 'rail';

  /* Layout dynamique : permet à la grille des capsules de respirer
     (jusqu'à 4 colonnes) quand sidebar et suggestions sont rétractés. */
  const bodyClass = [
    styles.body,
    sidebarIsRail ? styles.bodySidebarRail : '',
    !suggestionsOpen ? styles.bodySuggestionsClosed : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={styles.watchPage}>

      {/* ══════════════════════════════════════════════════════════
          TOPBAR fixe — pas de Header global ici
          ══════════════════════════════════════════════════════════ */}
      <header className={styles.topbar} role="banner">
        <button
          type="button"
          className={styles.backBtn}
          onClick={onBack}
          aria-label="Retour à l'espace Église"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Retour à l'espace Église</span>
        </button>

        <div className={styles.topbarBrand}>
          <img src={asset('/logo-rst.png')} alt="Roc Séculaire Tabernacle"
               className={styles.topbarLogo} width={36} height={23} />
          <span className={styles.topbarBrandLbl}>Bibliothèque des prédications</span>
        </div>

        {/* Recherche en topbar pour rester accessible même quand le
            sidebar est réduit ou en scroll. */}
        <div className={styles.topbarSearch} role="search">
          <span className={styles.searchIcon} aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.5" y2="16.5" />
            </svg>
          </span>
          <input
            type="search"
            placeholder="Rechercher une prédication…"
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

        {/* Bouton "Filtrer" — visible uniquement sur mobile (CSS).
            Ouvre une sheet bottom. La prédication continue de jouer
            en arrière-plan pendant que l'user manipule ses filtres. */}
        <button
          type="button"
          className={styles.topbarFilterBtn}
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
          {activeFilterCount > 0 && (
            <span className={styles.topbarFilterCount}>{activeFilterCount}</span>
          )}
        </button>
      </header>

      {/* ══════════════════════════════════════════════════════════
          BODY — sidebar | center | suggestions
          ══════════════════════════════════════════════════════════ */}
      <div className={bodyClass}>

        {/* ── Sidebar filtres (fixe, scroll interne) ─────────── */}
        <aside
          className={[styles.sidebar, sidebarIsRail ? styles.sidebarRail : ''].join(' ')}
          aria-label="Filtres"
        >
          <div className={styles.sidebarHead}>
            {!sidebarIsRail && <span className={styles.sidebarLbl}>Filtres</span>}
            <button
              type="button"
              className={styles.sidebarToggle}
              onClick={() => setSidebarMode((m) => (m === 'full' ? 'rail' : 'full'))}
              aria-label={sidebarIsRail ? 'Déplier les filtres' : 'Réduire les filtres'}
              title={sidebarIsRail ? 'Déplier les filtres' : 'Réduire les filtres'}
            >
              {sidebarIsRail ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="13 17 18 12 13 7" />
                  <polyline points="6 17 11 12 6 7" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
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
                  onClick={() => setSidebarMode('full')}
                  aria-label={section.title}
                  title={section.title}
                >
                  {section.icon}
                </button>
              ))}
            </div>
          ) : (
            <div className={styles.sidebarScroll}>{filterBlocks}</div>
          )}

          {/* Footer du sidebar : action Réinitialiser, séparée du
              header pour éviter la confusion avec le bouton réduire. */}
          {!sidebarIsRail && (
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
          )}
        </aside>

        {/* ── Centre : contient toujours le slot du player + soit
              les infos du sermon, soit la grille filtrée ─────────── */}
        <section className={styles.center} ref={centerRef}>

          {/* Slot du player : reste TOUJOURS dans le DOM pour préserver
              la lecture. Le slot ne se contracte (height:0) qu'en mode
              FILTRÉ pour libérer la place à la grille. En mode PiP scroll,
              le slot reste visible (16:9) — il sera sous la fenêtre puisque
              l'utilisateur a scrollé en bas, mais quand il remontera l'IO
              détectera et le wrapper reviendra dedans. */}
          <div
            ref={slotRef}
            className={[
              styles.playerSlot,
              isFiltered ? styles.playerSlotHidden : '',
            ].join(' ')}
          >
            <div
              className={[
                styles.playerWrap,
                isPip ? styles.playerWrapPip : '',
              ].join(' ')}
              style={pipStyle}
            >
              <YouTubePlayer
                videoUrl={sermon.videoUrl}
                videoKey={sermon.id}
                autoplay
                onEnded={onVideoEnded}
              />

              {/* Mini-bar visible en mode PiP (filtré OU scroll out). */}
              {isPip && (
                <div
                  className={styles.miniBar}
                  onMouseDown={onPipDragStart}
                  role="toolbar"
                  aria-label="Mini-lecteur — glisser pour déplacer"
                >
                  <span className={styles.miniHandle} aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="6" cy="6" r="1.4" />
                      <circle cx="12" cy="6" r="1.4" />
                      <circle cx="18" cy="6" r="1.4" />
                      <circle cx="6" cy="12" r="1.4" />
                      <circle cx="12" cy="12" r="1.4" />
                      <circle cx="18" cy="12" r="1.4" />
                    </svg>
                  </span>
                  <span className={styles.miniTitle}>{titleClean}</span>
                  <button
                    type="button"
                    className={styles.miniBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      /* Si filtré : on quitte d'abord la recherche pour
                         ramener le slot, puis on scroll vers lui.
                         Si juste scrolled-out : on remonte au slot. */
                      if (isFiltered) resetAll();
                      window.setTimeout(() => {
                        slotRef.current?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'start',
                        });
                      }, 80);
                    }}
                    aria-label="Réafficher le lecteur en place"
                    title="Réafficher le lecteur"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 3 21 3 21 9" />
                      <polyline points="9 21 3 21 3 15" />
                      <line x1="21" y1="3" x2="14" y2="10" />
                      <line x1="3" y1="21" x2="10" y2="14" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mode normal : infos + passages + plus de prédications */}
          {!isFiltered && (
            <>
              <div className={styles.info}>
                <p className={styles.infoSerie}>
                  {sermon.serie}
                  {sermon.numeroSerie ? ` · n°${String(sermon.numeroSerie).padStart(2, '0')}` : ''}
                </p>
                <h1 className={styles.infoTitle}>{titleClean}</h1>
                <p className={styles.infoMeta}>
                  {sermon.predicateur} · {formatLongDate(sermon.date)}
                  {sermon.duree ? ` · ${sermon.duree}` : ''}
                </p>
                {sermon.description && (
                  <p className={styles.infoDesc}>{sermon.description}</p>
                )}
              </div>

              {sermon.passages.length > 0 && (
                <section className={styles.passages} aria-label="Passages bibliques">
                  <h2 className={styles.sectionTitle}>Passages bibliques</h2>
                  {sermon.passages.map((p, i) => (
                    <div key={i} className={styles.passage}>
                      <div className={styles.passageRef}>{p.reference}</div>
                      <blockquote className={styles.passageText}>{p.texte}</blockquote>
                    </div>
                  ))}
                </section>
              )}

              {sermon.citationsBranham.length > 0 && (
                <section className={styles.citations} aria-label="Citations Branham">
                  <h2 className={styles.sectionTitle}>Citations Branham</h2>
                  {sermon.citationsBranham.map((c, i) => (
                    <div key={i} className={styles.citation}>
                      <div className={styles.citationSource}>{c.source}</div>
                      <blockquote className={styles.citationText}>{c.texte}</blockquote>
                    </div>
                  ))}
                </section>
              )}

              {relatedSermons.length > 0 && (
                <section className={styles.more} aria-label="Plus de prédications">
                  <h2 className={styles.sectionTitle}>Plus de prédications</h2>
                  <div className={styles.moreGrid}>
                    {relatedSermons.slice(0, 9).map((s) => (
                      <Capsule key={s.id} sermon={s} onOpen={switchSermon} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          {/* Mode filtré : grille des résultats */}
          {isFiltered && (
            <section className={styles.filteredGrid} aria-label="Résultats">
              <header className={styles.filteredHead}>
                <h2 className={styles.sectionTitle}>
                  {sortedFiltered.length} résultat{sortedFiltered.length > 1 ? 's' : ''}
                </h2>
                <button
                  type="button"
                  className={styles.filteredReset}
                  onClick={resetAll}
                >
                  Effacer la recherche
                </button>
              </header>
              {sortedFiltered.length === 0 ? (
                <p className={styles.empty}>Aucune prédication ne correspond.</p>
              ) : (
                <div className={styles.moreGrid}>
                  {sortedFiltered.map((s) => (
                    <Capsule key={s.id} sermon={s} onOpen={switchSermon} />
                  ))}
                </div>
              )}
            </section>
          )}
        </section>

        {/* ── Sidebar suggestions (cachée en mode filtré pour laisser
              place à la grille, ou rétractée par l'utilisateur) ──── */}
        {!isFiltered && suggestionsOpen && (
          <aside className={styles.suggestions} aria-label="À regarder ensuite">
            <div className={styles.suggestionsHead}>
              <span className={styles.suggestionsLbl}>À regarder ensuite</span>
              <button
                type="button"
                className={styles.suggestionsToggle}
                onClick={() => setSuggestionsOpen(false)}
                aria-label="Ranger les suggestions"
                title="Ranger"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="13 17 18 12 13 7" />
                  <polyline points="6 17 11 12 6 7" />
                </svg>
              </button>
            </div>
            <div className={styles.suggestionsList}>
              {relatedSermons.slice(0, 12).map((s) => (
                <SuggestionRow key={s.id} sermon={s} onClick={switchSermon} />
              ))}
            </div>
          </aside>
        )}

        {/* Onglet vertical pour rouvrir les suggestions quand fermées */}
        {!isFiltered && !suggestionsOpen && (
          <button
            type="button"
            className={styles.suggestionsReopen}
            onClick={() => setSuggestionsOpen(true)}
            aria-label="Afficher les suggestions"
            title="Afficher les suggestions"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="11 17 6 12 11 7" />
              <polyline points="18 17 13 12 18 7" />
            </svg>
          </button>
        )}

      </div>

      {/* ── Sheet bottom modale : filtres sur mobile ──
            Le YouTubePlayer reste monté pendant l'ouverture, donc la
            prédication continue d'être jouée en arrière-plan. */}
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
        <div className={styles.filterBlocksLight}>
          {filterBlocks}
        </div>
      </FilterSheet>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   CAPSULE
   ══════════════════════════════════════════════════════════ */

interface CapsuleProps {
  sermon: Sermon;
  onOpen: (s: Sermon) => void;
}

function Capsule({ sermon, onOpen }: CapsuleProps) {
  const thumb = sermon.thumbnail ?? youtubeThumbnail(sermon.videoUrl);
  const typeLabel = sermon.typeCulte ? TYPE_LABELS[sermon.typeCulte] : null;
  const titleClean = sermon.titre.replace(/\.$/, '');

  return (
    <article
      className={styles.capsule}
      role="button"
      tabIndex={0}
      onClick={() => onOpen(sermon)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(sermon);
        }
      }}
      aria-label={`Lire la prédication : ${sermon.titre}`}
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
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
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
      </div>
    </article>
  );
}

/* ══════════════════════════════════════════════════════════
   SUGGESTION ROW
   ══════════════════════════════════════════════════════════ */

function SuggestionRow({ sermon, onClick }: { sermon: Sermon; onClick: (s: Sermon) => void }) {
  const thumb = sermon.thumbnail ?? youtubeThumbnail(sermon.videoUrl);
  const titleClean = sermon.titre.replace(/\.$/, '');
  return (
    <button
      type="button"
      className={styles.suggRow}
      onClick={() => onClick(sermon)}
      aria-label={`Regarder : ${sermon.titre}`}
    >
      <div className={styles.suggThumb}>
        {thumb && <img src={thumb} alt="" loading="lazy" />}
        {sermon.duree && (
          <span className={styles.suggDuration}>{sermon.duree}</span>
        )}
      </div>
      <div className={styles.suggBody}>
        <h4 className={styles.suggTitle}>{titleClean}</h4>
        <p className={styles.suggMeta}>
          {sermon.predicateur} · {formatShortDate(sermon.date)}
        </p>
      </div>
    </button>
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
