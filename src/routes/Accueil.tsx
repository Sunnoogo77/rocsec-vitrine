import DOMPurify from 'dompurify';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LivePill } from '../components/ui/LivePill/LivePill';
import { Button } from '../components/ui/Button/Button';
import { rendezVous } from '../data/rendez-vous';
import { projetNehemie as staticProjet } from '../data/nehemie';
import { useSermons } from '../hooks/useSermons';
import { useProjetNehemie } from '../hooks/useProjetNehemie';
import { useMotDuPasteur } from '../hooks/useMotDuPasteur';
import { AnnoncesCarousel } from '../components/AnnoncesCarousel/AnnoncesCarousel';
import { youtubeEmbedUrl, youtubeThumbnail } from '../utils/youtube';
import { asset } from '../utils/asset';
import type { RendezVous, JourCulte } from '../types';
import styles from './Accueil.module.css';

export default function Accueil() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const locale = i18n.language === 'en' ? 'en-US' : 'fr-FR';

  // Horaires de cultes — purement statiques (info fixe, ne change pas, pas
  // de raison de faire un appel API pour cela).
  const { data: sermons } = useSermons();
  // Projet Néhémie : skeleton statique (objectif, devise) + dynamique API
  // pour la collecte uniquement.
  const { data: apiProjet } = useProjetNehemie();
  const objectif = staticProjet.objectif;
  const devise = staticProjet.devise;
  const collecte = apiProjet?.collecte;

  // Mot du pasteur : null tant que l'admin n'a rien publié → placeholder inline.
  const { data: motDuPasteur } = useMotDuPasteur();

  const schedTime = (rv: RendezVous): string => {
    if (rv.jour === 'vendredi') return t('accueil.scheduleTime.des', { heure: rv.heureDebut });
    if (rv.jour === 'dimanche') return t('accueil.scheduleTime.dimanche', { debut: rv.heureDebut });
    return t('accueil.scheduleTime.interval', { debut: rv.heureDebut, fin: rv.heureFin });
  };

  const schedMain = (jour: JourCulte): string => {
    if (jour === 'mercredi') return t('accueil.scheduleLabels.mercrediMain');
    if (jour === 'dimanche') return t('accueil.scheduleLabels.dimancheMain');
    return t('accueil.scheduleLabels.vendrediMain');
  };

  const schedAddr = (jour: JourCulte): string =>
    jour === 'vendredi'
      ? t('accueil.scheduleLabels.addrVendredi')
      : t('accueil.scheduleLabels.addrBacchus');

  const formatMontant = (n: number): string => n.toLocaleString(locale);
  const [msgPlaying, setMsgPlaying] = useState(false);

  // `dernierSermon` peut être absent : la section "Dernier message" affichera
  // alors un placeholder inline, mais le reste de la page (hero, horaires,
  // mot du pasteur, projet Néhémie) doit rester visible.
  const dernierSermon = sermons[0] ?? null;

  const dernierEmbed = dernierSermon
    ? youtubeEmbedUrl(dernierSermon.videoUrl, { autoplay: true })
    : '';
  const dernierThumb = dernierSermon
    ? youtubeThumbnail(dernierSermon.videoUrl)
    : '';

  // Pourcentage et collecte ne sont calculés que si l'API a renvoyé une valeur.
  const pct = collecte !== undefined ? Math.round((collecte / objectif) * 100) : null;
  const dateSermon = dernierSermon
    ? new Date(dernierSermon.date).toLocaleDateString(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';
  const dateLabel = dateSermon
    ? dateSermon.charAt(0).toUpperCase() + dateSermon.slice(1)
    : '';

  return (
    <main id="main-content">

      {/* ── HERO ────────────────────────────────────────────────── */}
      <section className={styles.hero} aria-label="Présentation de l'assemblée">

        <div className={styles.heroBackdrop} aria-hidden="true" />

        <div className={styles.heroInner}>
          {/* Image du Christ — fixe, à gauche */}
          <div className={styles.heroJesus} aria-hidden="true">
            <img
              src={asset('/images/jesus.jpg')}
              alt={t('accessibility.portraitAlt')}
              className={styles.heroJesusImg}
              loading="eager"
            />
          </div>

          {/* Colonne texte — bloc positionné à droite, contenu centré */}
          <div className={styles.heroText}>
            <div className={styles.heroTextGroup}>
              <p className={styles.heroAssemblee}>{t('accueil.heroAssemblee')}</p>
              <h1 className={styles.heroTitle}>
                {t('accueil.heroTitleLine1')}<br/>{t('accueil.heroTitleLine2')}
              </h1>
              <div className={styles.heroCtas}>
                <LivePill onClick={() => navigate('/eglise')} />
                <button className={styles.heroGhostBtn} onClick={() => navigate('/eglise')}>
                  {t('actions.decouvrir')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROCHAINES RÉUNIONS ─────────────────────────────────── */}
      <section className={styles.schedule} aria-label={t('accueil.scheduleEyebrow')}>
        <div className={styles.schedInner}>
          <div className={styles.eyebrow}>{t('accueil.scheduleEyebrow')}</div>
          <h2 className={styles.hSerif}>
            {t('accueil.scheduleTitleLine1')}<br/><em>{t('accueil.scheduleTitleLine2')}</em>
          </h2>

          <div className={styles.schedGrid}>
            {rendezVous.map((rv) => (
              <div key={rv.id} className={styles.schedItem}>
                <div className={styles.schedDay}>
                  {t(`accueil.scheduleDays.${rv.jour}`)}
                  {rv.jour === 'vendredi' && (
                    <span className={styles.schedStar}> *</span>
                  )}
                </div>
                <div className={styles.schedTime}>{schedTime(rv)}</div>
                <div className={styles.schedLabel}>
                  {schedMain(rv.jour)}
                  <br/>
                  {rv.jour === 'vendredi'
                    ? <em>{schedAddr(rv.jour)}</em>
                    : schedAddr(rv.jour)
                  }
                </div>
              </div>
            ))}
          </div>

          <div className={styles.schedFoot}>
            <span className={styles.schedPin}>
              <span aria-hidden="true">📍</span>
              {' '}<strong>{t('accueil.scheduleFootPin')}</strong>{' '}
              {t('accueil.scheduleFootAddr')}
            </span>
            <span className={styles.schedMapLink}>{t('accueil.scheduleFootMap')}</span>
          </div>
        </div>
      </section>

      {/* ── DERNIER MESSAGE ─────────────────────────────────────── */}
      <section className={styles.lastMsg} aria-label={t('accueil.lastMsgEyebrow')}>
        <div className={`${styles.lastMsgInner} ${msgPlaying ? styles.lastMsgInnerExpanded : ''}`}>
          <div className={styles.eyebrow}>{t('accueil.lastMsgEyebrow')}</div>
          {!dernierSermon ? (
            <p style={{ textAlign: 'center', color: 'var(--ink-3)', padding: '32px 16px', fontStyle: 'italic' }}>
              Aucune prédication publiée pour le moment. Le dernier message apparaîtra
              ici dès qu'il sera publié dans l'admin.
            </p>
          ) : (
          <div className={`${styles.lastMsgGrid} ${msgPlaying ? styles.lastMsgGridExpanded : ''}`}>

            {/* Lecteur vidéo : miniature + play, ou iframe quand on clique */}
            <div
              className={`${styles.lastMsgVideo} ${msgPlaying ? styles.lastMsgVideoExpanded : ''}`}
              role={msgPlaying ? undefined : 'img'}
              aria-label={`Replay — ${dernierSermon.titre}`}
            >
              {msgPlaying && dernierEmbed ? (
                <iframe
                  className={styles.lastMsgIframe}
                  src={dernierEmbed}
                  title={`Replay — ${dernierSermon.titre}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <>
                  {dernierThumb && (
                    <img
                      src={dernierThumb}
                      alt={`Aperçu — ${dernierSermon.titre}`}
                      className={styles.lastMsgThumb}
                      loading="lazy"
                    />
                  )}
                  <div className={styles.lastMsgPlay}>
                    <button
                      className={styles.lastMsgPlayBtn}
                      onClick={() => dernierEmbed && setMsgPlaying(true)}
                      aria-label={t('accueil.lastMsgPlay')}
                      disabled={!dernierEmbed}
                    >
                      <span className={styles.lastMsgPlayTriangle} aria-hidden="true" />
                    </button>
                  </div>

                  <div className={styles.lastMsgMeta}>
                    <span className={styles.lastMsgMetaLine}>
                      <span className={styles.lastMsgDot} aria-hidden="true" />
                      {t('accueil.lastMsgYouTube')}
                    </span>
                    {dernierSermon.duree && (
                      <span className={styles.lastMsgDuration}>{dernierSermon.duree}</span>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Texte — visible avant ET pendant la lecture, mais restylé */}
            <div className={`${styles.lastMsgCopy} ${msgPlaying ? styles.lastMsgCopyExpanded : ''}`}>
              <div className={styles.lastMsgRef}>
                {dateLabel} · {t('accueil.lastMsgCulteSuffix')}
              </div>

              <h3 className={styles.lastMsgTitle}>
                {msgPlaying
                  ? dernierSermon.titre.replace(/\.$/, '')
                  : `« ${dernierSermon.titre.replace(/\.$/, '')} »`}
              </h3>

              {msgPlaying ? (
                <p className={styles.lastMsgPredicateur}>{dernierSermon.predicateur}</p>
              ) : (
                <>
                  <p className={styles.lastMsgSerie}>
                    {dernierSermon.serie && (
                      <>
                        {dernierSermon.serie}
                        {dernierSermon.numeroSerie ? ` #${dernierSermon.numeroSerie}` : ''}
                        {' · '}
                      </>
                    )}
                    {dernierSermon.titre.replace(/\.$/, '').toUpperCase()}
                  </p>

                  {dernierSermon.description && (
                    <p className={styles.lastMsgDesc}>{dernierSermon.description}</p>
                  )}
                </>
              )}

              <div className={styles.lastMsgActions}>
                <Button variant="blue" as="a" href="/eglise/cultes">
                  {t('actions.ecouterMessage')}
                </Button>
                <Button variant="secondary" as="a" href="/eglise/cultes">
                  {t('actions.tousMessages')}
                </Button>
              </div>
            </div>
          </div>
          )}
        </div>
      </section>

      {/* ── LE MOT DU PASTEUR ───────────────────────────────────── */}
      <section className={styles.histoire} aria-label="Le mot du pasteur">
        <div className={styles.histoireInner}>

          {/* Portrait du pasteur */}
          <div className={styles.histoireImg}>
            <img
              src={asset('/pastor-ndaye.jpeg')}
              alt="Rev. Robert Ndaye M., pasteur de Roc Séculaire Tabernacle"
              className={styles.histoireImgEl}
              loading="lazy"
            />
          </div>

          {/* Mot du pasteur — HTML riche fourni par l'admin (rich text editor). */}
          <div className={styles.histoireCopy}>
            <div className={styles.eyebrow}>{t('accueil.motDuPasteur.eyebrow')}</div>
            <h2 className={styles.histoireTitre}>
              {t('accueil.motDuPasteur.titre')}
            </h2>
            {motDuPasteur ? (
              <>
                <div
                  className={styles.histoireBody}
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(motDuPasteur.texte_html) }}
                />
                {motDuPasteur.signature && (
                  <p className={styles.histoireSignature}>— {motDuPasteur.signature}</p>
                )}
                <Link to="/genese" className={styles.histoireLink}>
                  {t('accueil.motDuPasteur.cta')}
                </Link>
              </>
            ) : (
              // Fallback discret quand l'admin n'a rien publié : pas de placeholder
              // "indisponible". On bascule vers une accroche éditoriale courte qui
              // renvoie à l'historique de l'église (page Genèse).
              <>
                <p className={styles.histoireP}>
                  Roc Séculaire Tabernacle est une assemblée chrétienne francophone,
                  née d'un appel à se rassembler autour de la Parole de Dieu et de
                  la prière. Découvrez l'histoire de notre communauté, ses origines
                  et son cheminement.
                </p>
                <Link to="/genese" className={styles.histoireLink}>
                  Lire l'histoire de l'église
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── NÉHÉMIE BANNER ──────────────────────────────────────── */}
      <section className={styles.nehemieBanner} aria-label={t('accueil.nehemieBanner.eyebrow')}>

        {/* Image promesse — sanctuaire */}
        <div className={styles.nehemieBannerImg}>
          <img
            src={asset('/images/sanctuaire.jpeg')}
            alt={t('accueil.nehemieBanner.imgAlt')}
            className={styles.nehemieBannerImgEl}
            loading="eager"
          />
        </div>

        {/* Contenu */}
        <div className={styles.nehemieBannerCopy}>
          <div className={`${styles.eyebrow} ${styles.eyebrowNote}`}>
            {t('accueil.nehemieBanner.eyebrow')}
          </div>
          <h3 className={styles.nehemieBannerTitre}>
            {t('accueil.nehemieBanner.titreLine1')}<br/>{t('accueil.nehemieBanner.titreLine2')}
          </h3>
          <p className={styles.nehemieBannerDesc}>
            {t('accueil.nehemieBanner.desc')}
          </p>

          {/* Jauge de collecte — données dynamiques. Affiche un placeholder
              inline si l'API n'a pas répondu (collecte indisponible). */}
          <div className={styles.progress}>
            <div className={styles.progressNums}>
              <span className={styles.progressRaised}>
                {collecte !== undefined ? (
                  <>
                    <b>{formatMontant(collecte)} {devise}</b>{' '}
                    {t('accueil.nehemieBanner.raisedSuffix')}
                  </>
                ) : (
                  <b style={{ fontStyle: 'italic', opacity: 0.65 }}>
                    Collecte indisponible — serveur hors-ligne
                  </b>
                )}
              </span>
              <span className={styles.progressGoal}>
                {t('accueil.nehemieBanner.goalPrefix')} {formatMontant(objectif)} {devise}
              </span>
            </div>
            <div
              className={styles.progressBar}
              role="progressbar"
              aria-valuenow={pct ?? 0}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={pct !== null ? `${pct} % ${t('nehemie.objectifAtteint')}` : 'Pourcentage indisponible'}
            >
              <div className={styles.progressBarFill} style={{ width: `${pct ?? 0}%` }} />
            </div>
            <div className={styles.progressPct}>
              {pct !== null ? (
                <>
                  <strong>{pct} %</strong>
                  <span> {t('accueil.nehemieBanner.percentSuffix')}</span>
                </>
              ) : (
                <span style={{ fontStyle: 'italic', opacity: 0.65 }}>—</span>
              )}
            </div>
          </div>

          <div className={styles.nehemieBannerCtas}>
            <Button variant="blue" as="a" href="/nehemie">
              {t('actions.contribuer')}
            </Button>
            <Button variant="secondary" as="a" href="/nehemie">
              {t('actions.enSavoirPlus')}
            </Button>
          </div>
        </div>
      </section>

      {/* ── ANNONCES — bande horizontale (à venir + passées récentes) ── */}
      <AnnoncesCarousel />

    </main>
  );
}
