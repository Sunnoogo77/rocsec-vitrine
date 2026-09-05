/**
 * Bande horizontale d'annonces pour la page d'accueil.
 *
 * Sélection : les annonces à venir + celles passées il y a moins de 14 jours.
 * Visuel de chaque carte, par ordre de priorité :
 *   1. affiche officielle
 *   2. aperçu (thumbnail) d'une vidéo YouTube du compte-rendu
 *   3. première image du compte-rendu
 *   4. fallback texte (titre sur fond dégradé)
 * Clic → fiche annonce. Scroll horizontal snap iOS, nudge au chargement.
 */

import { Link } from 'react-router-dom';
import { useAnnonces } from '../../hooks/useAnnonces';
import { asset } from '../../utils/asset';
import { youtubeThumbnail } from '../../utils/youtube';
import type { Annonce } from '../../types';
import styles from './AnnoncesCarousel.module.css';

const FENETRE_PASSEE_MS = 14 * 24 * 60 * 60 * 1000;

/** Détermine le visuel d'aperçu d'une annonce (affiche > vidéo > image). */
function apercu(a: Annonce): { type: 'image' | 'video'; src: string } | null {
  if (a.affiche) return { type: 'image', src: asset(a.affiche) };
  const blocks = a.contentBlocks ?? [];
  const video = blocks.find((b) => b.kind === 'video') as
    | { kind: 'video'; url: string }
    | undefined;
  if (video) {
    const thumb = youtubeThumbnail(video.url);
    if (thumb) return { type: 'video', src: thumb };
  }
  const image = blocks.find((b) => b.kind === 'image') as
    | { kind: 'image'; src: string }
    | undefined;
  if (image) return { type: 'image', src: asset(image.src) };
  if (a.image) return { type: 'image', src: asset(a.image) };
  return null;
}

export function AnnoncesCarousel() {
  const { data: annonces } = useAnnonces();

  const now = Date.now();
  const visibles = annonces.filter((a) => {
    if (a.statut === 'a-venir' || a.statut === 'aujourd-hui') return true;
    // Passée : seulement si elle date de moins de 2 semaines.
    if (a.statut === 'passee' && a.date) {
      const t = new Date(a.date).getTime();
      return !Number.isNaN(t) && now - t <= FENETRE_PASSEE_MS;
    }
    return false;
  });

  if (visibles.length === 0) return null;

  return (
    <section className={styles.section} aria-label="Annonces de l'assemblée">
      <div className={styles.inner}>
        <div className={styles.header}>
          <div className={styles.eyebrow}>L'assemblée</div>
          <h2 className={styles.title}>
            Annonces <em>& événements</em>
          </h2>
          <Link to="/eglise/annonces" className={styles.allLink}>
            Toutes les annonces →
          </Link>
        </div>

        <div className={styles.track}>
          {visibles.map((a) => {
            const vis = apercu(a);
            const statutLabel =
              a.statut === 'aujourd-hui' ? "Aujourd'hui" :
              a.statut === 'passee'      ? 'Passée'      : 'À venir';
            return (
              <Link
                key={a.id}
                to={`/eglise/annonces/${a.id}`}
                className={styles.card}
                aria-label={`Annonce : ${a.titre}`}
              >
                <div className={styles.media}>
                  {vis ? (
                    <>
                      <img src={vis.src} alt="" loading="lazy" />
                      {vis.type === 'video' && (
                        <span className={styles.playBadge} aria-hidden="true">▶</span>
                      )}
                    </>
                  ) : (
                    <div className={styles.mediaFallback}>
                      <span>{a.titre}</span>
                    </div>
                  )}
                  <span
                    className={[
                      styles.statut,
                      a.statut === 'aujourd-hui' ? styles.statutToday :
                      a.statut === 'passee'      ? styles.statutPast  :
                      styles.statutSoon,
                    ].join(' ')}
                  >
                    {statutLabel}
                  </span>
                </div>
                <div className={styles.body}>
                  {(a.sousTypeLabel || a.dl) && (
                    <span className={styles.cardType}>
                      {a.sousTypeLabel ?? a.dl}
                    </span>
                  )}
                  <h3 className={styles.cardTitle}>{a.titre}</h3>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
