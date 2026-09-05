import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTemoignages } from '../../hooks/useTemoignages';
import { asset } from '../../utils/asset';
import { TemoignageModal } from '../../components/TemoignageModal/TemoignageModal';
import { TemoignageReadModal } from '../../components/TemoignageReadModal/TemoignageReadModal';
import type { Temoignage } from '../../types';
import styles from './Temoignages.module.css';

/**
 * Card unitaire d'un témoignage — variante par `type` (citation/illustre/recit).
 * Cliquable : déclenche l'ouverture du modal de lecture détaillé.
 */
function TemoignageCard({ t, onOpen }: { t: Temoignage; onOpen: (t: Temoignage) => void }) {
  const handleClick = () => onOpen(t);
  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen(t);
    }
  };
  const commonProps = {
    role: 'button' as const,
    tabIndex: 0,
    onClick: handleClick,
    onKeyDown: handleKey,
    'aria-label': `Lire le témoignage de ${t.cite}`,
  };
  if (t.type === 'citation') {
    return (
      <article className={`${styles.card} ${styles.cardQuote}`} {...commonProps}>
        <div className={styles.cardGlyph} aria-hidden="true">{'“'}</div>
        <q>{t.quoteText}</q>
        <cite>{t.cite}</cite>
      </article>
    );
  }
  if (t.type === 'illustre') {
    return (
      <article className={`${styles.card} ${styles.cardIllu}`} {...commonProps}>
        {t.image && (
          <div className={styles.cardImg}>
            <img src={asset(t.image)} alt="" loading="lazy" />
          </div>
        )}
        <div className={styles.cardBody}>
          {t.eyebrow && <div className={styles.cardEyebrow}>{t.eyebrow}</div>}
          {t.titre && <h3>{t.titre}</h3>}
          {t.corps && <p>{t.corps}</p>}
          <cite>{t.cite}</cite>
        </div>
      </article>
    );
  }
  return (
    <article className={`${styles.card} ${styles.cardStory}`} {...commonProps}>
      {t.eyebrow && <div className={styles.cardEyebrow}>{t.eyebrow}</div>}
      {t.titre && <h3>{t.titre}</h3>}
      {t.corps && <p>{t.corps}</p>}
      <cite>{t.cite}</cite>
    </article>
  );
}

export default function Temoignages() {
  const { t } = useTranslation();
  const { data: temoignages } = useTemoignages();
  const detail = temoignages.find((tem) => tem.detail)?.detail;
  const [modalOpen, setModalOpen] = useState(false);
  const [readModal, setReadModal] = useState<Temoignage | null>(null);

  // Tri stable : on remonte les témoignages illustrés (avec image) pour les
  // emplacements éditoriaux 4-col×2 de la mosaïque (i1, i2), qui demandent
  // une image. Les autres conservent leur ordre chronologique d'origine.
  const ordonnes = useMemo(() => {
    const avecImage = temoignages.filter((x) => Boolean(x.image));
    const sansImage = temoignages.filter((x) => !x.image);
    // On répartit : 2 premières positions illustrées (i1, i2 dans la mosaïque)
    // pour ceux qui ont une image ; sinon on garde l'ordre naturel.
    if (avecImage.length === 0) return temoignages;
    // Construction : on insère les illustrés en positions 1 et 5 (indices i1, i2),
    // les autres remplissent. Si plus de 2 illustrés disponibles, les surplus
    // viennent en fin de mosaïque (priorité éditoriale).
    const out: Temoignage[] = [];
    const slotsIllustres = [1, 5];
    let illuIdx = 0;
    let restIdx = 0;
    for (let i = 0; i < temoignages.length; i++) {
      if (slotsIllustres.includes(i) && illuIdx < avecImage.length) {
        out.push(avecImage[illuIdx++]);
      } else {
        out.push(sansImage[restIdx++] ?? avecImage[illuIdx++]);
      }
    }
    return out;
  }, [temoignages]);

  // La mosaïque éditoriale prend les 8 premiers (les plus récents publiés,
  // avec priorité aux illustrés en positions i1/i2). Au-delà : scroller iOS.
  const hasMosaic = ordonnes.length >= 8;
  const extras = ordonnes.slice(8);
  const fewItems = !hasMosaic && ordonnes.length > 0;

  return (
    <div>

      {/* ── HERO ───────────────────────────────────────────────── */}
      <section data-page-hero className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.eyebrow}>{t('eglise.temoignages.eyebrow')}</div>
          <h1 className={styles.heroTitle}>
            {t('eglise.temoignages.titreLine1')}<br /><em>{t('eglise.temoignages.titreLine2')}</em>
          </h1>
          <p className={styles.heroLede}>{t('eglise.temoignages.lede')}</p>
        </div>
      </section>

      {/* ── ACTIONS ────────────────────────────────────────────── */}
      <section className={styles.actions}>
        <button
          type="button"
          className={`${styles.btnLine} ${styles.temShare}`}
          onClick={() => setModalOpen(true)}
        >
          + Partager mon témoignage
        </button>
        <span className={styles.temCounter}>94 témoignages · depuis 1999</span>
      </section>

      <TemoignageModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <TemoignageReadModal temoignage={readModal} onClose={() => setReadModal(null)} />

      {/* ── REPLI : moins de 8 témoignages → on affiche tout en scroller ── */}
      {fewItems && (
        <section className={styles.scrollerSection} aria-label="Témoignages partagés">
          <header className={styles.scrollerHeader}>
            <div className={styles.eyebrow}>Témoignages partagés</div>
            <h2 className={styles.scrollerTitle}>
              {ordonnes.length === 1
                ? 'Un témoignage'
                : `${ordonnes.length} témoignages`}
              {' · '}
              <em>partagés par l'assemblée</em>
            </h2>
          </header>
          <div className={styles.scrollerTrack}>
            {ordonnes.map((tem) => (
              <div key={tem.id} className={styles.scrollerItem}>
                <TemoignageCard t={tem} onOpen={setReadModal} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── État vide ─────────────────────────────────────────── */}
      {ordonnes.length === 0 && (
        <section className={styles.empty}>
          Aucun témoignage n'est encore publié.<br />
          <em>Le premier témoignage validé apparaîtra ici.</em>
        </section>
      )}

      {/* ── MOSAÏQUE ÉDITORIALE (≥ 8 témoignages publiés) ───────── */}
      {hasMosaic && (
      <section className={styles.mosaic}>

        {/* q1 — 2 col */}
        {(() => {
          const t = ordonnes[0];
          return (
            <article
              className={`${styles.tem} ${styles.temQuote} ${styles.temQ1} ${styles.temClickable}`}
              role="button" tabIndex={0}
              onClick={() => setReadModal(t)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setReadModal(t); } }}
              aria-label={`Lire le témoignage de ${t.cite}`}
            >
              <div className={styles.temGlyph} aria-hidden="true">{'“'}</div>
              <q>{t.quoteText}</q>
              <cite>{t.cite}</cite>
            </article>
          );
        })()}

        {/* i1 — 4 col × 2 lignes */}
        {(() => {
          const t = ordonnes[1];
          return (
            <article
              className={`${styles.tem} ${styles.temIllu} ${styles.temI1} ${styles.temClickable}`}
              role="button" tabIndex={0}
              onClick={() => setReadModal(t)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setReadModal(t); } }}
              aria-label={`Lire le témoignage de ${t.cite}`}
            >
              <div className={styles.temImg}>
                {t.image && <img src={asset(t.image)} alt="" />}
              </div>
              <div className={styles.temContent}>
                <div className={styles.temEyebrow}>{t.eyebrow}</div>
                <h3>{t.titre}</h3>
                <p>{t.corps}</p>
                <cite>{t.cite}</cite>
              </div>
            </article>
          );
        })()}

        {/* q2 — 2 col, accent rouge */}
        {(() => {
          const t = ordonnes[2];
          return (
            <article
              className={`${styles.tem} ${styles.temQuote} ${styles.temQ2} ${styles.accentBlue} ${styles.temClickable}`}
              role="button" tabIndex={0}
              onClick={() => setReadModal(t)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setReadModal(t); } }}
              aria-label={`Lire le témoignage de ${t.cite}`}
            >
              <div className={styles.temGlyph} aria-hidden="true">{'“'}</div>
              <q>{t.quoteText}</q>
              <cite>{t.cite}</cite>
            </article>
          );
        })()}

        {/* s1 — 3 col */}
        {(() => {
          const t = ordonnes[3];
          return (
            <article
              className={`${styles.tem} ${styles.temStory} ${styles.temS1} ${styles.temClickable}`}
              role="button" tabIndex={0}
              onClick={() => setReadModal(t)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setReadModal(t); } }}
              aria-label={`Lire le témoignage de ${t.cite}`}
            >
              <div className={styles.temEyebrow}>{t.eyebrow}</div>
              <h3>{t.titre}</h3>
              <p>{t.corps}</p>
              <cite>{t.cite}</cite>
            </article>
          );
        })()}

        {/* q3 — 3 col */}
        {(() => {
          const t = ordonnes[4];
          return (
            <article
              className={`${styles.tem} ${styles.temQuote} ${styles.temQ3} ${styles.temClickable}`}
              role="button" tabIndex={0}
              onClick={() => setReadModal(t)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setReadModal(t); } }}
              aria-label={`Lire le témoignage de ${t.cite}`}
            >
              <div className={styles.temGlyph} aria-hidden="true">{'“'}</div>
              <q>{t.quoteText}</q>
              <cite>{t.cite}</cite>
            </article>
          );
        })()}

        {/* i2 — 4 col × 2 lignes */}
        {(() => {
          const t = ordonnes[5];
          return (
            <article
              className={`${styles.tem} ${styles.temIllu} ${styles.temI2} ${styles.temClickable}`}
              role="button" tabIndex={0}
              onClick={() => setReadModal(t)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setReadModal(t); } }}
              aria-label={`Lire le témoignage de ${t.cite}`}
            >
              <div className={styles.temImg}>
                {t.image && <img src={asset(t.image)} alt="" />}
              </div>
              <div className={styles.temContent}>
                <div className={styles.temEyebrow}>{t.eyebrow}</div>
                <h3>{t.titre}</h3>
                <p>{t.corps}</p>
                <cite>{t.cite}</cite>
              </div>
            </article>
          );
        })()}

        {/* s2 — 2 col */}
        {(() => {
          const t = ordonnes[6];
          return (
            <article
              className={`${styles.tem} ${styles.temStory} ${styles.temS2} ${styles.temClickable}`}
              role="button" tabIndex={0}
              onClick={() => setReadModal(t)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setReadModal(t); } }}
              aria-label={`Lire le témoignage de ${t.cite}`}
            >
              <div className={styles.temEyebrow}>{t.eyebrow}</div>
              <h3>{t.titre}</h3>
              <p>{t.corps}</p>
              <cite>{t.cite}</cite>
            </article>
          );
        })()}

        {/* q4 — 2 col */}
        {(() => {
          const t = ordonnes[7];
          return (
            <article
              className={`${styles.tem} ${styles.temQuote} ${styles.temQ4} ${styles.temClickable}`}
              role="button" tabIndex={0}
              onClick={() => setReadModal(t)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setReadModal(t); } }}
              aria-label={`Lire le témoignage de ${t.cite}`}
            >
              <div className={styles.temGlyph} aria-hidden="true">{'“'}</div>
              <q>{t.quoteText}</q>
              <cite>{t.cite}</cite>
            </article>
          );
        })()}

      </section>
      )}

      {/* ── PLUS DE TÉMOIGNAGES (au-delà de la mosaïque) ─────────
          Scroller horizontal iOS-style (snap, scroll smooth, swipe natif).
          S'affiche dès qu'on a un 9e témoignage publié. */}
      {extras.length > 0 && (
        <section className={styles.scrollerSection} aria-label="Plus de témoignages">
          <header className={styles.scrollerHeader}>
            <div className={styles.eyebrow}>Plus de témoignages</div>
            <h2 className={styles.scrollerTitle}>
              Et <em>{extras.length} récit{extras.length > 1 ? 's' : ''}</em> de plus,
              partagés par l'assemblée.
            </h2>
          </header>
          <div className={styles.scrollerTrack}>
            {extras.map((tem) => (
              <div key={tem.id} className={styles.scrollerItem}>
                <TemoignageCard t={tem} onOpen={setReadModal} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── DETAIL ─────────────────────────────────────────────── */}
      {detail && (
        <section id="tem-detail" className={styles.detail}>

          <div className={styles.detailMeta}>
            <a href="#" className={styles.backLink}>← Retour aux témoignages</a>
            <span className={styles.detailTag}>{detail.tag}</span>
          </div>

          <h2 className={styles.detailTitle}>
            Lorem ipsum<br /><em>dolor sit amet.</em>
          </h2>

          <div className={styles.detailBy}>{detail.byline}</div>

          <article className={styles.detailBody}>
            {detail.paragraphs.map((para, i) => {
              if (para.kind === 'lede') {
                return <p key={i} className={styles.temLede}>{para.text}</p>;
              }
              if (para.kind === 'pull') {
                return <blockquote key={i} className={styles.temQPull}>{para.text}</blockquote>;
              }
              return <p key={i}>{para.text}</p>;
            })}

            <div className={styles.detailFoot}>
              <span className={styles.footLbl}>Verset cité dans ce récit</span>
              <span className={styles.footRef}>
                {detail.versetRef} — {detail.versetText}
              </span>
            </div>
          </article>

        </section>
      )}

    </div>
  );
}
