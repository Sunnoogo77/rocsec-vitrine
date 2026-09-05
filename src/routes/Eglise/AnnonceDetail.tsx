import { useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { useAnnonces } from '../../hooks/useAnnonces';
import { asset } from '../../utils/asset';
import { youtubeEmbedUrl } from '../../utils/youtube';
import type { AnnonceType } from '../../types';
import styles from './AnnonceDetail.module.css';

const TYPE_DISPLAY: Record<AnnonceType, string> = {
  reunion:        'Réunion',
  voyage:         'Voyage',
  sortie:         'Sortie',
  exceptionnelle: 'Exceptionnelle',
};

function formatLongDate(dateStr: string): string {
  const d = new Date(dateStr);
  const raw = d.toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

/** Extrait la première phrase (jusqu'au . ! ? ou ~140 caractères). */
function premierePhrase(text: string): string {
  const m = text.match(/^.*?[.!?»](\s|$)/);
  const phrase = m ? m[0].trim() : text;
  if (phrase.length > 160) return phrase.slice(0, 157).trimEnd() + '…';
  return phrase;
}

export default function AnnonceDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: annonces, status } = useAnnonces();
  const annonce = annonces.find((a) => a.id === id);
  const [origineOpen, setOrigineOpen] = useState(false);

  if (!annonce) {
    // Le fetch est peut-être encore en cours ; on attend qu'il aboutisse avant
    // de rediriger pour éviter un flash 404 sur un id valide.
    if (status === 'loading') return null;
    return <Navigate to="/eglise/annonces" replace />;
  }

  const dateLabel =
    annonce.dateDisplay ??
    (annonce.dateFin
      ? `Du ${formatLongDate(annonce.date)} au ${formatLongDate(annonce.dateFin)}`
      : formatLongDate(annonce.date));

  const typeLabel =
    annonce.sousTypeLabel ??
    `${TYPE_DISPLAY[annonce.type]}${annonce.sousType ? ` · ${annonce.sousType}` : ''}`;

  const statutLabel =
    annonce.statut === 'aujourd-hui' ? "Aujourd'hui" :
    annonce.statut === 'passee'      ? 'Passée'      : 'À venir';

  const statutFlagCls =
    annonce.statut === 'aujourd-hui' ? styles.flagToday :
    annonce.statut === 'passee'      ? styles.flagPast  :
    styles.flagSoon;

  const isPast = annonce.statut === 'passee';
  const hasReport = isPast && annonce.contentBlocks && annonce.contentBlocks.length > 0;

  return (
    <article className={styles.detail}>

      {/* ── Bandeau supérieur ──────────────────────────────────── */}
      <header data-page-hero className={styles.head}>
        <Link to="/eglise/annonces" className={styles.backLink}>
          ← Retour aux annonces
        </Link>

        <div className={styles.headInner}>
          <span className={`${styles.statusFlag} ${statutFlagCls}`}>{statutLabel}</span>
          <span className={styles.headType}>{typeLabel}</span>

          <h1 className={styles.title}>
            {annonce.titre}
            {annonce.titreEm && <><br /><em>{annonce.titreEm}</em></>}
          </h1>

          {/* Pas de compte-rendu → description complète, centrée (mise en page
              « arbre »). Compte-rendu présent → annonce d'origine repliée
              (1re phrase + …), dépliable au clic, pour garder le focus sur
              « Ce qui s'est passé ». */}
          {hasReport ? (
            <div className={styles.origineWrap}>
              <span className={styles.origineLabel}>L'annonce d'origine</span>
              <p className={styles.origineText}>
                {origineOpen ? annonce.description : premierePhrase(annonce.description)}
              </p>
              <button
                type="button"
                className={styles.origineToggle}
                onClick={() => setOrigineOpen((v) => !v)}
                aria-expanded={origineOpen}
              >
                {origineOpen ? 'Replier' : 'Lire l’annonce complète'}
              </button>
            </div>
          ) : (
            <p className={styles.lede}>{annonce.description}</p>
          )}

          <dl className={styles.meta}>
            <div>
              <dt>Quand</dt>
              <dd>{dateLabel}</dd>
            </div>
            <div>
              <dt>Où</dt>
              <dd>{annonce.lieu}</dd>
            </div>
            <div>
              <dt>Type</dt>
              <dd>{typeLabel}</dd>
            </div>
          </dl>
        </div>
      </header>

      {/* ── Affiche officielle (toutes annonces) ───────────────── */}
      {annonce.affiche && (
        <section className={styles.posterSection} aria-label="Affiche officielle">
          <div className={styles.posterFrame}>
            <img src={asset(annonce.affiche)} alt={`Affiche — ${annonce.titre}`} />
          </div>

          <div className={styles.posterActions}>
            <a
              href={annonce.affiche}
              download
              className={styles.btnPrimary}
            >
              ↓ Télécharger l'affiche
            </a>
            <a
              href={annonce.affiche}
              target="_blank"
              rel="noreferrer"
              className={styles.btnLine}
            >
              Ouvrir en grand
            </a>
          </div>
        </section>
      )}

      {/* ── Compte-rendu (annonces passées uniquement) ────────── */}
      {hasReport && (
        <section className={styles.report} aria-label="Compte-rendu">
          <div className={styles.reportHead}>
            <span className={styles.reportEyebrow}>Compte-rendu</span>
            <h2 className={styles.reportTitle}>Ce qui s'est passé</h2>
          </div>

          <div className={styles.reportBody}>
            {annonce.contentBlocks!.map((block, i) => {
              if (block.kind === 'paragraph') {
                return <p key={i} className={styles.reportPara}>{block.text}</p>;
              }
              if (block.kind === 'video') {
                const embed = youtubeEmbedUrl(block.url);
                if (!embed) return null;
                return (
                  <figure key={i} className={`${styles.reportFig} ${styles.imgWide}`}>
                    <div className={styles.reportVideo}>
                      <iframe
                        src={embed}
                        title={block.caption || 'Vidéo'}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        loading="lazy"
                      />
                    </div>
                    {block.caption && (
                      <figcaption className={styles.reportVideoCaption}>{block.caption}</figcaption>
                    )}
                  </figure>
                );
              }
              const sizeCls =
                block.size === 'small'  ? styles.imgSmall  :
                block.size === 'wide'   ? styles.imgWide   :
                                          styles.imgMedium;
              return (
                <figure key={i} className={`${styles.reportFig} ${sizeCls}`}>
                  <img src={asset(block.src)} alt={block.alt ?? ''} loading="lazy" />
                </figure>
              );
            })}
          </div>
        </section>
      )}

      {/* ── À venir et pas de compte-rendu : message d'attente ── */}
      {!isPast && !annonce.affiche && (
        <section className={styles.waiting}>
          <p>L'affiche et le programme détaillé seront publiés prochainement.</p>
        </section>
      )}

    </article>
  );
}
