import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './Nehemie.module.css';
import { useProjetNehemie } from '../hooks/useProjetNehemie';
import { projetNehemie as staticProjet } from '../data/nehemie';
import { Lightbox, type LightboxImage } from '../components/ui/Lightbox/Lightbox';
import { asset } from '../utils/asset';

/* Hero carousel — 4 visuels du futur sanctuaire qui défilent en
   crossfade. Image phare (sanctuary.jpg du public/) + 3 nouvelles
   images bundlées depuis src/assets/nehemie/. */
import heroEstrade from '../assets/nehemie/estrade.png';
import heroVueArriereAvant from '../assets/nehemie/vue-de-l-arriere-vers-l-avant.png';
import heroVueAvantArriere from '../assets/nehemie/vue-de-l-avant-vers-l-arriere.png';

const HERO_INTERVAL_MS = 10000;

/* ────────────────────────────────────────────────────────────────────
   ICÔNES — quatre piliers du projet Néhémie
   Inline SVG pour rester indépendant de toute dépendance externe.
   ──────────────────────────────────────────────────────────────────── */
const IconUsers = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
       strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconBricks = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <rect x="1.5"  y="4"  width="6.5" height="4" rx=".4" />
    <rect x="8.75" y="4"  width="6.5" height="4" rx=".4" />
    <rect x="16"   y="4"  width="6.5" height="4" rx=".4" />
    <rect x="5"    y="10" width="6.5" height="4" rx=".4" />
    <rect x="12.5" y="10" width="6.5" height="4" rx=".4" />
    <rect x="1.5"  y="16" width="6.5" height="4" rx=".4" />
    <rect x="8.75" y="16" width="6.5" height="4" rx=".4" />
    <rect x="16"   y="16" width="6.5" height="4" rx=".4" />
  </svg>
);

const IconHandHeart = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
       strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M11 14h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 16" />
    <path d="m7 20 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9" />
    <path d="m2 15 6 6" />
    <path d="M19.5 8.5c.7-.7 1.5-1.6 1.5-2.7A2.7 2.7 0 0 0 18.3 3c-.9 0-1.5.4-2.3 1.2-.8-.8-1.4-1.2-2.3-1.2A2.7 2.7 0 0 0 11 5.8c0 1.1.8 2 1.5 2.7L16 12l3.5-3.5z" />
  </svg>
);

const IconTrumpet = (
  <svg viewBox="0 0 24 24" fill="#d59a22" aria-hidden="true">
    {/* Embouchure */}
    <circle cx="2.4" cy="12" r="1.6" />
    <rect x="3.4" y="11.4" width="1.4" height="1.2" rx=".2" />
    {/* Tube horizontal */}
    <rect x="4.6" y="11" width="11.2" height="2.4" rx=".4" />
    {/* Trois pistons sur le tube */}
    <rect x="6.6"  y="7.8" width="1.6" height="6.2" rx=".3" />
    <rect x="9.6"  y="7.8" width="1.6" height="6.2" rx=".3" />
    <rect x="12.6" y="7.8" width="1.6" height="6.2" rx=".3" />
    {/* Pavillon évasé à droite */}
    <path d="M15.4 9.2 22.5 5.6V18.4l-7.1-3.6Z" />
    {/* Reflet brillant sur le pavillon */}
    <path d="M16.6 10.4l4-2v7.2l-4-2Z" fill="#edbd55" />
  </svg>
);

/* Icônes de la bande "Moyens de participation" */
const IconCash = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
       strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <circle cx="12" cy="12" r="2.5" />
    <path d="M5 9.5h.01M19 14.5h.01" />
  </svg>
);

const IconBank = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
       strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 21h18" />
    <path d="M3 10h18" />
    <path d="M5 6l7-3 7 3" />
    <path d="M4 10v11" />
    <path d="M20 10v11" />
    <path d="M8 14v3" />
    <path d="M12 14v3" />
    <path d="M16 14v3" />
  </svg>
);

const IconOnline = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
       strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="4" width="20" height="14" rx="2" />
    <line x1="8" y1="22" x2="16" y2="22" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <path d="M12 14l-2.6-2.6a1.6 1.6 0 0 1 2.6-1.85 1.6 1.6 0 0 1 2.6 1.85L12 14z" fill="currentColor" />
  </svg>
);

/* ────────────────────────────────────────────────────────────────────
   IMAGES DE FOND — bande "Ensemble allons plus loin"
   2 visuels rotatifs choisis aléatoirement à chaque chargement.
   ──────────────────────────────────────────────────────────────────── */
const BAND_BG_URLS = [
  '/images/nehemie/nehemi-1.jpg',
  '/images/nehemie/nehemi-2.jpg',
];

/* ────────────────────────────────────────────────────────────────────
   AUTO-DISCOVERY DES IMAGES — galerie « Notre futur lieu de culte »
   Toute image (.png, .jpg, .jpeg, .webp) déposée dans
   src/assets/nehemie/ est automatiquement incluse dans la galerie.
   Pour ajouter une image : copiez-la dans le dossier — c'est tout.
   ──────────────────────────────────────────────────────────────────── */
const galerieModules = import.meta.glob<{ default: string }>(
  '../assets/nehemie/*.{png,jpg,jpeg,webp}',
  { eager: true },
);

function humaniseSlug(filename: string): string {
  return filename
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const galerieImages: LightboxImage[] = Object.entries(galerieModules)
  .map(([path, mod]) => {
    const filename = path.split('/').pop() ?? '';
    return {
      src: mod.default,
      alt: humaniseSlug(filename),
      caption: humaniseSlug(filename),
    };
  })
  .sort((a, b) => (a.caption ?? '').localeCompare(b.caption ?? ''));

export default function Nehemie() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'en' ? 'en-US' : 'fr-FR';
  const fmt = (n: number) => n.toLocaleString(locale);

  // Skeleton static (objectif, devise, photos, batisseurs, montants, modesDon).
  // Dynamique (API uniquement) : `collecte` + `miseAJour`.
  const { data: apiProjet } = useProjetNehemie();
  const objectif = staticProjet.objectif;
  const collecte = apiProjet?.collecte;

  const pct = collecte !== undefined ? Math.round((collecte / objectif) * 100) : null;
  const restant = collecte !== undefined ? objectif - collecte : null;
  const whyItems = t('nehemie.whyItems', { returnObjects: true }) as string[];
  const buildItems = t('nehemie.buildItems', { returnObjects: true }) as string[];
  const participationItems = t('nehemie.participationItems', { returnObjects: true }) as string[];

  // Lightbox state
  const [lbIndex, setLbIndex] = useState<number | null>(null);
  const openLightbox = (i: number) => setLbIndex(i);
  const closeLightbox = () => setLbIndex(null);

  // Image de fond de la bande "Ensemble allons plus loin" — choisie
  // une seule fois au montage (= rotation à chaque rafraîchissement).
  const [bandBg] = useState(
    () => BAND_BG_URLS[Math.floor(Math.random() * BAND_BG_URLS.length)],
  );

  /* Hero carousel : 4 visuels qui défilent en crossfade. La première
     image (sanctuary.jpg) garde son chargement eager pour le LCP, les
     autres en lazy. Auto-rotation toutes les 6s, mise en pause si
     l'utilisateur préfère reduced motion. */
  const heroSlides = [
    { src: asset('/images/sanctuary.jpg'), alt: 'Roc Séculaire Tabernacle — sanctuaire' },
    { src: heroEstrade,                    alt: 'Estrade du sanctuaire' },
    { src: heroVueAvantArriere,            alt: "Vue de l'estrade vers la salle" },
    { src: heroVueArriereAvant,            alt: "Vue de l'arrière de la salle vers l'estrade" },
  ];
  const [heroSlide, setHeroSlide] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return; // pas d'auto-rotation pour les users en reduced motion
    }
    const id = window.setInterval(() => {
      setHeroSlide((i) => (i + 1) % heroSlides.length);
    }, HERO_INTERVAL_MS);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main id="main-content">

      {/* ══════════════════════════════════════════════════════════
          §1 — HERO  20 % bleu naval | 80 % image paysage
          ══════════════════════════════════════════════════════════ */}
      <section className={styles.hero} aria-label={t('nav.nehemie')}>

        {/* Couche 0 — fond : panel sombre étroit + carrousel image */}
        <div className={styles.heroDark} aria-hidden="true" />
        <div className={styles.heroImg}>
          {/* Carrousel : 4 images empilées en crossfade. La zone est
              clippée (overflow:hidden) pour que les slides ne débordent
              pas, mais la quote box et les dots restent libres au-dessus. */}
          <div
            className={styles.heroCarousel}
            role="group"
            aria-roledescription="carrousel"
            aria-label="Visuels du sanctuaire"
          >
            {heroSlides.map((slide, i) => (
              <img
                key={slide.src}
                src={slide.src}
                alt={slide.alt}
                className={[
                  styles.heroImgEl,
                  styles.heroCarouselSlide,
                  i === heroSlide ? styles.heroCarouselSlideActive : '',
                ].join(' ')}
                loading={i === 0 ? 'eager' : 'lazy'}
                aria-hidden={i !== heroSlide}
              />
            ))}
          </div>

          <blockquote className={styles.heroQuoteBox}>
            <span className={styles.heroQuoteGlyph} aria-hidden="true">"</span>
            <p>{t('nehemie.heroQuote')}</p>
            <cite>{t('nehemie.heroQuoteRef')}</cite>
          </blockquote>

          {/* Dots pour navigation manuelle */}
          <div className={styles.heroDots} role="tablist" aria-label="Choisir un visuel">
            {heroSlides.map((slide, i) => (
              <button
                key={slide.src}
                type="button"
                role="tab"
                aria-selected={i === heroSlide}
                aria-label={`Visuel ${i + 1} sur ${heroSlides.length} : ${slide.alt}`}
                className={[
                  styles.heroDot,
                  i === heroSlide ? styles.heroDotActive : '',
                ].join(' ')}
                onClick={() => setHeroSlide(i)}
              />
            ))}
          </div>
        </div>

        {/* Couche 1 — texte qui chevauche le panel et l'image */}
        <div className={styles.heroContent}>
          <span className={styles.heroEyebrow}>{t('nehemie.heroEyebrow')}</span>
          <h1 className={styles.heroTitle}>
            {t('nehemie.heroTitleLine1')}<br />
            <em>{t('nehemie.heroTitleLine2')}</em>
          </h1>
          <p className={styles.heroSub}>{t('nehemie.heroSub')}</p>
          <a href="#avancement" className={styles.heroCta}>
            {t('actions.decouvrirProjet')}
          </a>
        </div>

      </section>

      {/* ══════════════════════════════════════════════════════════
          §2 — AVANCEMENT · PARTICIPEZ · IMAGE
          ══════════════════════════════════════════════════════════ */}
      <section id="avancement" className={styles.content} aria-label={t('nehemie.contentEyebrow')}>
        <div className={styles.contentInner}>
          <div className={styles.contentIntro}>
            <p className={styles.colEyebrow}>{t('nehemie.contentEyebrow')}</p>
            <h2 className={styles.contentTitle}>{t('nehemie.contentTitle')}</h2>
          </div>

          <div className={styles.projectBoard}>
            <div className={styles.objectivePanel}>
              <p className={styles.boardEyebrow}>{t('nehemie.avancementEyebrow')}</p>
              <h3 className={styles.objectiveTitle}>{t('nehemie.objectiveTitle')}</h3>
            </div>

            <div className={styles.progressPanel}>
              <div className={styles.stats}>
                <div className={styles.stat}>
                  <p className={styles.statLabel}>{t('nehemie.objectif')}</p>
                  <p className={styles.statNum}>{fmt(objectif)}&thinsp;€</p>
                </div>
                <div className={`${styles.stat} ${styles.statHighlight}`}>
                  <p className={styles.statLabel}>{t('nehemie.collecte')}</p>
                  {collecte !== undefined ? (
                    <>
                      <p className={styles.statNum}>{fmt(collecte)}&thinsp;€</p>
                      <p className={styles.statPct}>({pct}&thinsp;%)</p>
                    </>
                  ) : (
                    <p
                      className={styles.statNum}
                      style={{ fontStyle: 'italic', opacity: 0.6, fontSize: '0.7em' }}
                    >
                      Indisponible — serveur hors-ligne
                    </p>
                  )}
                </div>
                <div className={styles.stat}>
                  <p className={styles.statLabel}>{t('nehemie.restant')}</p>
                  {restant !== null ? (
                    <p className={styles.statNum}>{fmt(restant)}&thinsp;€</p>
                  ) : (
                    <p
                      className={styles.statNum}
                      style={{ fontStyle: 'italic', opacity: 0.6, fontSize: '0.7em' }}
                    >
                      —
                    </p>
                  )}
                </div>
              </div>

              <div
                className={styles.progressBar}
                role="progressbar"
                aria-valuenow={pct ?? 0}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={
                  pct !== null
                    ? `${pct} % ${t('nehemie.objectifAtteint')}`
                    : 'Avancement indisponible'
                }
              >
                <div className={styles.progressFill} style={{ width: `${pct ?? 0}%` }}>
                  <span className={styles.progressLabel}>
                    {pct !== null ? `${pct} %` : '—'}
                  </span>
                </div>
              </div>

              <p className={styles.progressNote}>{t('nehemie.progressNote')}</p>
            </div>
          </div>

          <div className={styles.projectInfoGrid}>
            <article className={styles.infoCard}>
              <span className={styles.infoIcon} aria-hidden="true">{IconUsers}</span>
              <h3>{t('nehemie.whyTitle')}</h3>
              <ul>
                {whyItems.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </article>
            <article className={styles.infoCard}>
              <span className={styles.infoIcon} aria-hidden="true">{IconBricks}</span>
              <h3>{t('nehemie.buildTitle')}</h3>
              <ul>
                {buildItems.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </article>
            <article className={styles.infoCard}>
              <span className={styles.infoIcon} aria-hidden="true">{IconHandHeart}</span>
              <h3>{t('nehemie.participationTitle')}</h3>
              <ul>
                {participationItems.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </article>
            <article className={`${styles.infoCard} ${styles.infoCardCall}`}>
              <span className={styles.infoIcon} aria-hidden="true">{IconTrumpet}</span>
              <h3>{t('nehemie.appealTitle')}</h3>
              <p>{t('nehemie.appealText')}</p>
              <strong>{t('nehemie.appealVerse')}</strong>
              <small>{t('nehemie.appealRef')}</small>
            </article>
          </div>

        </div>{/* fin .contentInner — la bande déborde en pleine largeur */}

        {/* ══════════════════════════════════════════════════════════
            BANDE "Ensemble, allons plus loin" — pleine largeur,
            image de fond rotative, voile sombre, 3 colonnes
            ══════════════════════════════════════════════════════════ */}
        <div
          className={styles.participationBand}
          style={{ backgroundImage: `url(${asset(bandBg)})` }}
        >
          <div className={styles.participationOverlay} aria-hidden="true" />
          <div className={styles.participationInner}>

            <div className={styles.bandBlock}>
              <h3>{t('nehemie.goFurtherTitle')}</h3>
              <p>{t('nehemie.goFurtherText')}</p>
              <strong className={styles.bandVerse}>{t('nehemie.goFurtherVerse')}</strong>
              <span className={styles.bandRef}>{t('nehemie.goFurtherRef')}</span>
            </div>

            <div className={styles.bandBlock}>
              <h3>{t('nehemie.followTitle')}</h3>
              <p>{t('nehemie.followText')}</p>
            </div>

            <div className={styles.bandBlock}>
              <h3>{t('nehemie.waysTitle')}</h3>
              <ul className={styles.payList}>
                <li className={styles.payItem}>
                  <span className={styles.payIcon}>{IconCash}</span>
                  <span className={styles.payLabel}>{t('nehemie.payCashLbl')}</span>
                </li>
                <li className={styles.payItem}>
                  <span className={styles.payIcon}>{IconBank}</span>
                  <span className={styles.payLabel}>{t('nehemie.payBankLbl')}</span>
                </li>
                <li className={styles.payItem}>
                  <span className={styles.payIcon}>{IconOnline}</span>
                  <span className={styles.payLabel}>{t('nehemie.payOnlineLbl')}</span>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* Bouton "Faire un don" centré sous la bande */}
        <div className={styles.donCtaWrap}>
          <a href={`mailto:${t('nehemie.contactEmail')}`} className={styles.donBtn}>
            {t('nehemie.donCta')}
          </a>
        </div>

        <div className={styles.contentInner}>{/* reprise du conteneur étroit */}

          <div className={styles.futurePanel}>
            <div className={styles.futureCopy}>
              <p className={styles.colEyebrow}>{t('nehemie.futurEyebrow')}</p>
              <h3 className={styles.futureTitle}>{t('nehemie.futurTitre')}</h3>
            <p className={styles.futureCaption}>{t('nehemie.futurCaption')}</p>
              <div className={styles.futureContact}>
                <a href={`mailto:${t('nehemie.contactEmail')}`}>{t('nehemie.contactEmail')}</a>
                <a href={`tel:${String(t('nehemie.contactPhone')).replace(/\s/g, '')}`}>
                  {t('nehemie.contactPhone')}
                </a>
              </div>
            </div>

            {/* Galerie : 3 vignettes visibles maximum (1 grande + 2 verticales).
                Si plus d'images existent, la 3e affiche un voile « +N » qui ouvre
                le lightbox — toutes les images sont accessibles à la navigation. */}
            <div className={styles.gallery}>
              {galerieImages.slice(0, 3).map((img, i) => {
                const isLastVisible = i === 2;
                const hasMore = galerieImages.length > 3;
                const remaining = galerieImages.length - 3;
                return (
                  <figure
                    key={img.src}
                    className={i === 0 ? styles.galleryMain : styles.gallerySide}
                  >
                    <button
                      type="button"
                      className={styles.galleryBtn}
                      onClick={() => openLightbox(i)}
                      aria-label={
                        isLastVisible && hasMore
                          ? `Voir toutes les images (${galerieImages.length} au total)`
                          : `Agrandir l'image ${i + 1} sur ${galerieImages.length}`
                      }
                    >
                      <img
                        src={img.src}
                        alt={img.alt ?? t('nehemie.futurEyebrow')}
                        className={styles.galleryImg}
                        loading={i === 0 ? 'eager' : 'lazy'}
                      />
                      {isLastVisible && hasMore && (
                        <span
                          className={styles.galleryMore}
                          aria-hidden="true"
                        >
                          <span className={styles.galleryMoreNum}>
                            +{remaining}
                          </span>
                          <span className={styles.galleryMoreLbl}>
                            voir tout
                          </span>
                        </span>
                      )}
                    </button>
                  </figure>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {lbIndex !== null && (
        <Lightbox
          images={galerieImages}
          index={lbIndex}
          onClose={closeLightbox}
          onNavigate={openLightbox}
        />
      )}
    </main>
  );
}
