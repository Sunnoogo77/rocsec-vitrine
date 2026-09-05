import { useMemo, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSermons } from '../../hooks/useSermons';
import { useCantiques } from '../../hooks/useCantiques';
import { useTemoignages } from '../../hooks/useTemoignages';
import { useImagesSemaine } from '../../hooks/useImagesSemaine';
import { useAnnonces } from '../../hooks/useAnnonces';
import { youtubeEmbedUrl, youtubeThumbnail } from '../../utils/youtube';
import { asset } from '../../utils/asset';
import styles from './CetteSemaine.module.css';

/** Fenêtre glissante de 8 jours (marge sur la semaine en cours). */
const FENETRE_SEMAINE_MS = 8 * 24 * 60 * 60 * 1000;

/** Placeholder inline pour les sections qui dépendent du backend. */
const PLACEHOLDER_STYLE: CSSProperties = {
  textAlign: 'center',
  fontStyle: 'italic',
  color: 'var(--ink-3, #6b7280)',
  padding: '24px 16px',
  background: 'rgba(0,0,0,0.02)',
  borderRadius: '12px',
  margin: '12px 0',
  fontSize: '0.9em',
};

/* ── helpers date ───────────────────────────────────────────── */
function getWeekNumber(d: Date): number {
  const date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const w1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date.getTime() - w1.getTime()) / 86400000 - 3 + ((w1.getDay() + 6) % 7)) / 7);
}

function formatAnnonceDate(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  const abbr = d.toLocaleDateString('fr-FR', { weekday: 'short' }).replace(/\./g, '').toUpperCase();
  const mois = d.toLocaleDateString('fr-FR', { month: 'long' }).toUpperCase();
  return `${abbr} ${d.getDate()} ${mois} ${d.getFullYear()}`;
}

export default function CetteSemaine() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'en' ? 'en-US' : 'fr-FR';

  // Sources dynamiques — mode API strict. Chaque section affiche son propre
  // placeholder si la donnée correspondante manque. Pas de VlogSemaine
  // monolithique : la vitrine compose elle-même la semaine à partir du dernier
  // sermon publié (fenêtre 8j), du cantique vedette et du témoignage le plus
  // récent. Cohérent avec l'Accueil qui fait pareil pour "Dernier message".
  const { data: sermons } = useSermons();
  const { data: cantiques } = useCantiques();
  const { data: temoignages } = useTemoignages();
  const { data: imagesSemaine } = useImagesSemaine();
  const { data: annonces } = useAnnonces();

  // Dernier sermon des 8 derniers jours (sermons sont triés DESC par date côté API).
  const dernierSermon = useMemo(() => {
    if (sermons.length === 0) return null;
    const limite = Date.now() - FENETRE_SEMAINE_MS;
    return sermons.find((s) => new Date(s.date).getTime() >= limite) ?? null;
  }, [sermons]);

  // Cantique vedette (case "Cantique vedette" cochée côté admin).
  const cantiqueVedette = useMemo(
    () => cantiques.find((c) => c.estVedette === true) ?? null,
    [cantiques],
  );

  // Témoignage le plus récent (l'API renvoie déjà trié par publie_le DESC).
  const temoignageRecent = useMemo(
    () => temoignages[0] ?? null,
    [temoignages],
  );

  const [heroPlaying, setHeroPlaying] = useState(false);

  // Tout dérive maintenant du sermon, pas du vlog.
  const heroEmbed = dernierSermon?.videoUrl
    ? youtubeEmbedUrl(dernierSermon.videoUrl, { autoplay: true })
    : '';
  const heroThumb = dernierSermon?.videoUrl
    ? youtubeThumbnail(dernierSermon.videoUrl)
    : '';

  const dateSermon = dernierSermon ? new Date(dernierSermon.date) : new Date();
  const jourUp   = dernierSermon ? dateSermon.toLocaleDateString(locale, { weekday: 'long' }).toUpperCase() : '—';
  const dd       = dernierSermon ? String(dateSermon.getDate()).padStart(2, '0') : '—';
  const mm       = dernierSermon ? String(dateSermon.getMonth() + 1).padStart(2, '0') : '—';
  const dateCode = dernierSermon ? `${dd}.${mm}.${dateSermon.getFullYear()}` : '—';

  const jourCap  = dernierSermon ? dateSermon.toLocaleDateString(locale, { weekday: 'long' }) : '';
  const jourCapF = jourCap ? jourCap.charAt(0).toUpperCase() + jourCap.slice(1) : '';
  const dateSans = dernierSermon ? dateSermon.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' }) : '';

  const semaineNum = dernierSermon ? getWeekNumber(dateSermon) : getWeekNumber(new Date());

  // Verset/citation principale du sermon (premier passage biblique s'il existe).
  const passagePrincipal = dernierSermon?.passages?.[0] ?? null;

  return (
    <main id="main-content">

      {/* ══════════════════════════════════════════════════════════
          HERO — vidéo gauche · infos sermon droite
          ══════════════════════════════════════════════════════════ */}
      <section data-page-hero className={styles.hero} aria-label="Culte de cette semaine">
        <div className={`${styles.heroInner} ${heroPlaying ? styles.heroInnerExpanded : ''}`}>

        {/* Gauche : vidéo / vignette OU placeholder si pas de sermon récent */}
        <div className={`${styles.heroMedia} ${heroPlaying ? styles.heroMediaExpanded : ''}`}>
          {!dernierSermon ? (
            <div style={{
              ...PLACEHOLDER_STYLE,
              margin: 0,
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.04)',
              color: 'rgba(255,255,255,0.6)',
              border: '1px dashed rgba(255,255,255,0.2)',
            }}>
              Aucun culte publié dans les 8 derniers jours.
            </div>
          ) : heroPlaying && heroEmbed ? (
            <iframe
              className={styles.heroIframe}
              src={heroEmbed}
              title={`Replay — ${dernierSermon.titre}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <>
              {heroThumb && (
                <img
                  src={heroThumb}
                  alt={`Aperçu — ${dernierSermon.titre}`}
                  className={styles.heroThumb}
                  loading="lazy"
                />
              )}
              <button
                className={styles.heroPlay}
                onClick={() => heroEmbed && setHeroPlaying(true)}
                aria-label={t('eglise.cetteSemaine.playReplay')}
                disabled={!heroEmbed}
              >
                <span className={styles.heroPlayIcon} aria-hidden="true">▶</span>
              </button>
              <div className={styles.heroBadgeReplay} aria-label={t('eglise.cetteSemaine.playReplay')}>
                {t('eglise.cetteSemaine.badgeReplay')}
              </div>
            </>
          )}
        </div>

        {/* Droite : informations sermon ou placeholder */}
        <div className={styles.heroContent}>
          {!dernierSermon ? (
            <div style={PLACEHOLDER_STYLE}>
              Aucun culte publié dans les 8 derniers jours. Le dernier message
              apparaîtra ici dès qu'un sermon récent sera publié dans l'admin.
            </div>
          ) : (
            <>
              <p className={styles.heroMeta}>
                {t('eglise.cetteSemaine.majLbl').toUpperCase()} &nbsp;·&nbsp; {jourUp} {dateCode}
              </p>
              <h1 className={styles.heroTitre}>
                {dernierSermon.titre}
                {dernierSermon.titleEm && <> <em>{dernierSermon.titleEm}</em></>}
              </h1>
              <p className={styles.heroDateHeure}>
                {jourCapF} &nbsp;·&nbsp; {dateSans} &nbsp;·&nbsp; {dernierSermon.heure}
              </p>
              <p className={styles.heroPredicateur}>{dernierSermon.predicateur}</p>
              {passagePrincipal && (
                <blockquote className={styles.heroVerset}>
                  <p className={styles.heroVersetTexte}>{passagePrincipal.texte}</p>
                  <cite className={styles.heroVersetRef}>{passagePrincipal.reference}</cite>
                </blockquote>
              )}
            </>
          )}
        </div>
        </div>{/* fin heroInner */}
      </section>

      {/* "Fil du message" retiré — pas pertinent côté vitrine. */}

      {/* ══════════════════════════════════════════════════════════
          GALERIE — grille asymétrique 6 photos
          ══════════════════════════════════════════════════════════ */}
      <section className={styles.galerie} aria-label={t('eglise.cetteSemaine.galerieTitre')}>
        <div className={styles.galerieInner}>
          <div className={styles.galerieHeader}>
            <h2 className={styles.galerieTitre}>{t('eglise.cetteSemaine.galerieTitre')}</h2>
            <p className={styles.galerieMeta}>
              {t('eglise.cetteSemaine.galerieMeta', { n: semaineNum, count: imagesSemaine.length }).toUpperCase()}
            </p>
          </div>
          {imagesSemaine.length === 0 ? (
            <div style={PLACEHOLDER_STYLE}>
              Aucune photo de la semaine n'est encore publiée — en attente du
              serveur. Côté admin : ajoutez 6 images dans <em>Cette semaine</em>.
            </div>
          ) : (
            <div className={styles.galerieGrid} role="list" aria-label={t('eglise.cetteSemaine.galerieTitre')}>
              {imagesSemaine.map((img) => {
                const isPlaceholder = img.src.includes('placeholder');
                return (
                  <div key={img.id} className={styles.galerieItem} role="listitem">
                    {isPlaceholder ? (
                      <div className={styles.galeriePlaceholder} aria-label={img.caption}>
                        <span className={styles.galeriePlaceholderLabel} aria-hidden="true">
                          {t('eglise.cetteSemaine.galeriePlaceholder').toUpperCase()}
                        </span>
                      </div>
                    ) : (
                      <img
                        src={asset(img.src)}
                        alt={img.caption}
                        className={styles.galerieImg}
                        loading="lazy"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
          <p className={styles.galerieNote} aria-hidden="true">
            {t('eglise.cetteSemaine.galerieNote', { count: imagesSemaine.length })}
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          CANTIQUE SPÉCIAL + TÉMOIGNAGE
          ══════════════════════════════════════════════════════════ */}
      <section className={styles.duo} aria-label={`${t('eglise.cetteSemaine.cantiqueLabel')} · ${t('eglise.cetteSemaine.temoignageLabel')}`}>
        <div className={styles.duoInner}>

          {/* Cantique — cantique vedette (case cochée côté admin) */}
          <div className={styles.duoCantique}>
            <p className={styles.duoLabel}>{t('eglise.cetteSemaine.cantiqueLabel').toUpperCase()}</p>
            {!cantiqueVedette ? (
              <div style={PLACEHOLDER_STYLE}>
                Aucun cantique vedette publié pour le moment. Cochez « Cantique vedette »
                sur un cantique côté admin pour qu'il apparaisse ici.
              </div>
            ) : (
              <>
                <h2 className={styles.duoCantiqueTitre}>{cantiqueVedette.titre}</h2>
                <div className={styles.duoPlayer} aria-label={t('eglise.cetteSemaine.playCantique')}>
                  {(() => {
                    const embed = youtubeEmbedUrl(cantiqueVedette.videoUrl);
                    return embed ? (
                      <iframe
                        className={styles.duoIframe}
                        src={embed}
                        title={`${t('eglise.cetteSemaine.cantiqueLabel')} — ${cantiqueVedette.titre}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        loading="lazy"
                      />
                    ) : (
                      <button className={styles.duoPlayerBtn} aria-label={t('eglise.cetteSemaine.playCantique')}>
                        <span className={styles.duoPlayerIcon} aria-hidden="true">▶</span>
                      </button>
                    );
                  })()}
                </div>
                <p className={styles.duoCantiqueSoliste}>{cantiqueVedette.solisteOuChoeur}</p>
              </>
            )}
          </div>

          {/* Témoignage — le plus récent publié.
              Si une image existe, on l'affiche comme vignette à côté du texte. */}
          <div className={styles.duoTemoignage}>
            <p className={styles.duoLabel}>{t('eglise.cetteSemaine.temoignageLabel').toUpperCase()}</p>
            {!temoignageRecent ? (
              <div style={PLACEHOLDER_STYLE}>
                Aucun témoignage publié pour le moment.
              </div>
            ) : (
              <>
                {temoignageRecent.image && (
                  <div
                    style={{
                      width: '100%',
                      aspectRatio: '16 / 9',
                      borderRadius: 'var(--r-md, 16px)',
                      overflow: 'hidden',
                      marginBottom: 14,
                      background: 'var(--bg-tint, #eef1f7)',
                    }}
                  >
                    <img
                      src={temoignageRecent.image}
                      alt=""
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </div>
                )}
                <span className={styles.duoGuillemet} aria-hidden="true">❝</span>
                <p className={styles.duoTemoignageTexte}>
                  {temoignageRecent.quoteText
                    || temoignageRecent.corps
                    || temoignageRecent.titre
                    || ''}
                </p>
                <p className={styles.duoTemoignageAuteur}>
                  — {temoignageRecent.cite.toUpperCase()}
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          ANNONCES
          ══════════════════════════════════════════════════════════ */}
      <section className={styles.annonces} aria-label={t('eglise.cetteSemaine.annoncesTitre')}>
        <div className={styles.annoncesInner}>
          <div className={styles.annoncesHeader}>
            <div>
              <h2 className={styles.annoncesTitre}>{t('eglise.cetteSemaine.annoncesTitre')}</h2>
              <p className={styles.annoncesSubtitre}><em>{t('eglise.cetteSemaine.annoncesSub')}</em></p>
            </div>
            <Link to="/eglise/annonces" className={styles.annoncesLienAll}>
              {t('eglise.cetteSemaine.voirToutes').toUpperCase()}
            </Link>
          </div>
          <div className={styles.annoncesRule} aria-hidden="true" />
          {annonces.length === 0 ? (
            <div style={PLACEHOLDER_STYLE}>
              Aucune annonce publiée pour le moment — en attente du serveur.
            </div>
          ) : (
            <div className={styles.annoncesGrid}>
              {annonces.slice(0, 3).map((a, i) => (
                <article
                  key={a.id}
                  className={`${styles.annonceCol} ${i < 2 ? styles.annonceColBorder : ''}`}
                  aria-label={a.titre}
                >
                  <p className={styles.annonceDate}>
                    {a.dateDisplay ?? formatAnnonceDate(a.date)}
                  </p>
                  <h3 className={styles.annonceTitre}>{a.titre}</h3>
                  <p className={styles.annonceDesc}>{a.description}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

    </main>
  );
}
