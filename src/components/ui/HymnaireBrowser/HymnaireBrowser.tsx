import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCantiques, useSessionsAdoration } from '../../../hooks/useCantiques';
import type { CantiqueFamille } from '../../../types';
import { youtubeThumbnail } from '../../../utils/youtube';
/* On réutilise les classes CSS Modules de CantiquesWatch — elles sont
   hashées et restent uniques, donc l'import inter-fichier est sûr. */
import styles from '../../../routes/Eglise/CantiquesWatch.module.css';

/* ============================================================
   HymnaireBrowser
   ------------------------------------------------------------
   Composant réutilisable du contenu "hymnaire" :
   - Header (eyebrow + titre + hint, masquable)
   - Search bar
   - Chips année (special / adoration uniquement)
   - Grille de cartes 16:9 (special / adoration) OU table des
     matières du recueil (sélection vidéo + tri + jumper alpha
     + grille 2 cols)

   Rendu dans 2 contextes :
   1) Watch shell standalone (route /eglise/cantiques/watch/hymnaire/:famille)
   2) Embarqué dans /eglise/cantiques sous le hero

   Le composant gère lui-même la navigation au clic sur un item
   (vers /eglise/cantiques/watch/:slug ou .../session-:slug).
   ============================================================ */

interface HymnaireBrowserProps {
  famille: CantiqueFamille;
  /** Affiche le bloc header (eyebrow + titre + hint). Activé par défaut.
   *  Désactivable quand le parent a déjà son propre hero. */
  showHeader?: boolean;
}

interface BrowseItem {
  key: string;
  slug: string;
  title: string;
  meta: string;
  subMeta?: string;
  thumb: string | null;
  year?: string;
  numero?: number;
  isSession: boolean;
}

function formatLongDate(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  const raw = d.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export default function HymnaireBrowser({
  famille,
  showHeader = true,
}: HymnaireBrowserProps) {
  const navigate = useNavigate();
  const { data: cantiques } = useCantiques();
  const { data: sessionsAdoration } = useSessionsAdoration();
  const [q, setQ] = useState('');
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  useEffect(() => {
    setQ('');
    setSelectedYear(null);
  }, [famille]);

  const items: BrowseItem[] = useMemo(() => {
    if (famille === 'adoration') {
      // L'onglet « Service de chant » agrège DEUX sources :
      //  1) les SessionAdoration (modèle dédié, legacy/riche)
      //  2) les Cantique(famille=adoration) saisis via le formulaire cantique
      // — sinon un service de chant créé en admin n'apparaîtrait nulle part.
      const sessionItems: BrowseItem[] = sessionsAdoration.map((s) => ({
        key: s.id,
        slug: s.slug,
        title: s.titre,
        meta: s.interpretes.join(' · '),
        subMeta: `${formatLongDate(s.date)}${s.evenement ? ` · ${s.evenement}` : ''}`,
        thumb: youtubeThumbnail(s.videoUrl),
        year: s.date.slice(0, 4),
        isSession: true,
      }));
      const cantiqueItems: BrowseItem[] = cantiques
        .filter((c) => c.famille === 'adoration')
        .map((c) => {
          const occ = c.occurrences?.[0];
          const dateStr = c.evenement?.date ?? c.recordedAt ?? occ?.dateEvenement;
          return {
            key: c.id,
            slug: c.slug ?? c.id,
            title: c.titre.replace(/\.$/, ''),
            meta: occ?.interpretes.join(' · ') ?? c.solisteOuChoeur,
            subMeta: c.evenement?.nom
              ? `${c.evenement.nom}${c.recordedAt ? ` · ${c.recordedAt}` : ''}`
              : (dateStr ? formatLongDate(dateStr) : undefined),
            thumb: youtubeThumbnail(occ?.videoUrl ?? c.videoUrl),
            year: dateStr?.slice(0, 4),
            isSession: false,
          };
        });
      return [...cantiqueItems, ...sessionItems].sort((a, b) =>
        (b.year ?? '').localeCompare(a.year ?? ''),
      );
    }
    const list = cantiques.filter((c) => c.famille === famille);
    if (famille === 'recueil') {
      list.sort((a, b) => (a.numeroRecueil ?? 0) - (b.numeroRecueil ?? 0));
      return list.map((c) => {
        const occ = c.occurrences?.[0];
        return {
          key: c.id,
          slug: c.slug ?? c.id,
          title: c.titre.replace(/\.$/, ''),
          meta: c.numeroRecueil
            ? `n° ${String(c.numeroRecueil).padStart(3, '0')}`
            : c.solisteOuChoeur,
          subMeta: c.numeroRecueil ? c.solisteOuChoeur : undefined,
          thumb: youtubeThumbnail(occ?.videoUrl ?? c.videoUrl),
          numero: c.numeroRecueil ?? undefined,
          isSession: false,
        };
      });
    }
    list.sort((a, b) => {
      const dateA = a.occurrences?.[0]?.dateEvenement ?? '';
      const dateB = b.occurrences?.[0]?.dateEvenement ?? '';
      return dateB.localeCompare(dateA);
    });
    return list.map((c) => {
      const occ = c.occurrences?.[0];
      // Préfixe le titre par un badge inline « Medley » si applicable —
      // simple marqueur visuel, le cantique reste dans les Spéciaux.
      const titleBase = c.titre.replace(/\.$/, '');
      const title = c.estMedley ? `🎼 ${titleBase}` : titleBase;
      // Sous-meta : date effective de l'événement si rattachement, sinon
      // date de l'occurrence ou contexte.
      const subMeta = c.evenement?.nom
        ? `${c.evenement.nom}${c.recordedAt ? ` · ${c.recordedAt}` : ''}`
        : (occ?.dateEvenement ? formatLongDate(occ.dateEvenement) : occ?.contexte);
      return {
        key: c.id,
        slug: c.slug ?? c.id,
        title,
        meta: occ?.interpretes.join(' · ') ?? c.solisteOuChoeur,
        subMeta,
        thumb: youtubeThumbnail(occ?.videoUrl ?? c.videoUrl),
        year: occ?.dateEvenement?.slice(0, 4)
          ?? c.evenement?.date?.slice(0, 4)
          ?? c.recordedAt?.slice(0, 4),
        isSession: false,
      };
    });
  }, [famille, cantiques, sessionsAdoration]);

  const availableYears = useMemo(() => {
    if (famille === 'recueil') return [];
    const set = new Set<string>();
    items.forEach((it) => { if (it.year) set.add(it.year); });
    return [...set].sort((a, b) => b.localeCompare(a));
  }, [items, famille]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter((it) => {
      if (selectedYear && it.year !== selectedYear) return false;
      if (!needle) return true;
      const hay = `${it.title} ${it.meta} ${it.subMeta ?? ''}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [items, q, selectedYear]);

  const goTo = (it: BrowseItem) => {
    navigate(
      it.isSession
        ? `/eglise/cantiques/watch/session-${it.slug}`
        : `/eglise/cantiques/watch/${it.slug}`,
    );
  };

  const eyebrow =
    famille === 'recueil' ? 'Recueil' :
    famille === 'special' ? 'Cantiques spéciaux' :
                            'Service de chant';
  const title =
    famille === 'recueil' ? 'Le recueil de l\'assemblée' :
    famille === 'special' ? 'Cantiques spéciaux' :
                            'Services de chant';
  const hint =
    famille === 'recueil'
      ? 'Tous les cantiques du recueil. Choisis-en un pour découvrir les vidéos dans lesquelles il a été interprété.'
      : famille === 'special'
      ? 'Solos, duos et interprétations spéciales captés au sanctuaire ou en studio.'
      : 'Sessions complètes d\'adoration & louange — vidéo intégrale et index des cantiques contenus.';
  const placeholder =
    famille === 'recueil'  ? 'Rechercher par numéro, titre, soliste…' :
    famille === 'special'  ? 'Rechercher par titre, interprète, contexte…' :
                             'Rechercher une session par titre, événement, date…';

  return (
    <div className={styles.browseInner}>
      {showHeader && (
        <header className={styles.browseHead}>
          <p className={styles.browseEyebrow}>{eyebrow}</p>
          <h2 className={styles.browseTitle}>{title}</h2>
          <p className={styles.browseHint}>{hint}</p>
        </header>
      )}

      <div className={styles.browseSearchBar}>
        <svg
          className={styles.browseSearchIcon}
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          className={styles.browseSearchInput}
          aria-label="Rechercher"
        />
        {q && (
          <button
            type="button"
            className={styles.browseSearchClear}
            onClick={() => setQ('')}
            aria-label="Effacer la recherche"
          >
            ×
          </button>
        )}
      </div>

      {availableYears.length > 0 && (
        <div className={styles.browseFilters} role="group" aria-label="Filtrer par année">
          <span className={styles.browseFiltersLbl}>Année</span>
          <div className={styles.browseChips}>
            <button
              type="button"
              className={[
                styles.browseChip,
                !selectedYear ? styles.browseChipActive : '',
              ].join(' ')}
              onClick={() => setSelectedYear(null)}
              aria-pressed={!selectedYear}
            >
              Toutes
            </button>
            {availableYears.map((y) => (
              <button
                key={y}
                type="button"
                className={[
                  styles.browseChip,
                  selectedYear === y ? styles.browseChipActive : '',
                ].join(' ')}
                onClick={() => setSelectedYear(y === selectedYear ? null : y)}
                aria-pressed={selectedYear === y}
              >
                {y}
              </button>
            ))}
          </div>
        </div>
      )}

      <p className={styles.browseCount}>
        {filtered.length} {filtered.length > 1 ? 'résultats' : 'résultat'}
        {q && ` pour « ${q} »`}
        {selectedYear && ` · ${selectedYear}`}
      </p>

      {filtered.length > 0 ? (
        famille === 'recueil' ? (
          <RecueilLayout items={filtered} onSelect={goTo} />
        ) : (
          <div className={styles.browseGrid}>
            {filtered.map((it) => (
              <button
                key={it.key}
                type="button"
                className={styles.browseCard}
                onClick={() => goTo(it)}
              >
                <div className={styles.browseThumb}>
                  {it.thumb ? (
                    <img src={it.thumb} alt="" loading="lazy" />
                  ) : (
                    <div className={styles.browseThumbEmpty}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                           stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18V5l12-2v13" />
                        <circle cx="6" cy="18" r="3" />
                        <circle cx="18" cy="16" r="3" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className={styles.browseCardBody}>
                  <p className={styles.browseCardTitle}>{it.title}</p>
                  <p className={styles.browseCardMeta}>{it.meta}</p>
                  {it.subMeta && (
                    <p className={styles.browseCardSubMeta}>{it.subMeta}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )
      ) : (
        <div className={styles.browseEmpty}>
          <p>Aucun résultat ne correspond à ta recherche.</p>
          {(q || selectedYear) && (
            <button
              type="button"
              className={styles.browseEmptyReset}
              onClick={() => { setQ(''); setSelectedYear(null); }}
            >
              Effacer les filtres
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   RECUEIL LAYOUT — table des matières hymnaire 2 colonnes
   (sélection vidéo + tri Numéro/A-Z + jumper alphabétique)
   ══════════════════════════════════════════════════════════ */

type RecueilSort = 'numero' | 'alpha';

function RecueilLayout({
  items,
  onSelect,
}: {
  items: BrowseItem[];
  onSelect: (it: BrowseItem) => void;
}) {
  const [sort, setSort] = useState<RecueilSort>('numero');

  const featured = useMemo(
    () => items.filter((it) => it.thumb).slice(0, 6),
    [items],
  );

  const sorted = useMemo(() => {
    if (sort === 'alpha') {
      return [...items].sort((a, b) =>
        a.title.localeCompare(b.title, 'fr', { sensitivity: 'base' }),
      );
    }
    return items;
  }, [items, sort]);

  const alphaGroups = useMemo(() => {
    if (sort !== 'alpha') return null;
    const map = new Map<string, BrowseItem[]>();
    sorted.forEach((it) => {
      const letter = (it.title.charAt(0) || '?').toUpperCase();
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter)!.push(it);
    });
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b, 'fr'));
  }, [sorted, sort]);

  return (
    <div className={styles.recueilLayout}>
      {featured.length > 0 && (
        <section className={styles.recueilFeatured} aria-label="Cantiques avec vidéo">
          <h3 className={styles.recueilSectionLbl}>Avec vidéo disponible</h3>
          <div className={styles.recueilFeaturedGrid}>
            {featured.map((it) => (
              <button
                key={it.key}
                type="button"
                className={styles.recueilFeaturedCard}
                onClick={() => onSelect(it)}
              >
                <div className={styles.recueilFeaturedThumb}>
                  <img src={it.thumb!} alt="" loading="lazy" />
                  {it.numero && (
                    <span className={styles.recueilFeaturedNum}>
                      n° {String(it.numero).padStart(3, '0')}
                    </span>
                  )}
                </div>
                <p className={styles.recueilFeaturedTitle}>{it.title}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      <div className={styles.recueilToolbar}>
        <div className={styles.recueilSortGroup} role="group" aria-label="Trier le recueil">
          <span className={styles.recueilSortLbl}>Tri</span>
          <div className={styles.recueilSortBtns}>
            <button
              type="button"
              className={[
                styles.recueilSortBtn,
                sort === 'numero' ? styles.recueilSortBtnActive : '',
              ].join(' ')}
              onClick={() => setSort('numero')}
              aria-pressed={sort === 'numero'}
            >
              Numéro
            </button>
            <button
              type="button"
              className={[
                styles.recueilSortBtn,
                sort === 'alpha' ? styles.recueilSortBtnActive : '',
              ].join(' ')}
              onClick={() => setSort('alpha')}
              aria-pressed={sort === 'alpha'}
            >
              A → Z
            </button>
          </div>
        </div>

        {sort === 'alpha' && alphaGroups && alphaGroups.length > 0 && (
          <nav className={styles.recueilLetters} aria-label="Aller à une lettre">
            {alphaGroups.map(([letter]) => (
              <a
                key={letter}
                href={`#recueil-letter-${letter}`}
                className={styles.recueilLetter}
              >
                {letter}
              </a>
            ))}
          </nav>
        )}
      </div>

      {sort === 'numero' ? (
        <ol className={styles.recueilGrid} aria-label="Cantiques par numéro">
          {sorted.map((it) => (
            <RecueilRow key={it.key} item={it} onClick={() => onSelect(it)} />
          ))}
        </ol>
      ) : (
        <div className={styles.recueilAlphaGroups}>
          {alphaGroups!.map(([letter, group]) => (
            <section
              key={letter}
              id={`recueil-letter-${letter}`}
              className={styles.recueilAlphaSection}
            >
              <h3 className={styles.recueilAlphaHead}>{letter}</h3>
              <ol className={styles.recueilGrid}>
                {group.map((it) => (
                  <RecueilRow key={it.key} item={it} onClick={() => onSelect(it)} />
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function RecueilRow({ item, onClick }: { item: BrowseItem; onClick: () => void }) {
  return (
    <li>
      <button type="button" className={styles.recueilRow} onClick={onClick}>
        <span className={styles.recueilNum}>
          {item.numero ? String(item.numero).padStart(3, '0') : '—'}
        </span>
        <span className={styles.recueilBody}>
          <span className={styles.recueilTitle}>{item.title}</span>
          {item.subMeta && (
            <span className={styles.recueilSoliste}>{item.subMeta}</span>
          )}
        </span>
        {item.thumb && (
          <span
            className={styles.recueilVideoBadge}
            title="Vidéo disponible"
            aria-label="Vidéo disponible"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        )}
        <svg
          className={styles.recueilArrow}
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </li>
  );
}
