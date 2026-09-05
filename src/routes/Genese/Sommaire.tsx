import { Link } from 'react-router-dom';
import { Eyebrow } from '../../components/ui/Eyebrow/Eyebrow';
import { HairlineDivider } from '../../components/ui/HairlineDivider/HairlineDivider';
import { PILIERS_GENESE, EVENEMENTS_GENESE } from '../../data/genese';
import { asset } from '../../utils/asset';
import type { GenesePage } from '../../types';
import styles from './Sommaire.module.css';

function pilierImage(p: GenesePage): string | undefined {
  // Première image rencontrée dans les blocs
  const img = p.blocs.find((b) => b.kind === 'image');
  return img?.src;
}

function pilierLede(p: GenesePage): string {
  if (p.sousTitre) return p.sousTitre;
  const firstP = p.blocs.find((b) => b.kind === 'paragraph');
  if (!firstP?.content) return '';
  // Premier paragraphe tronqué — l'intégralité est dans la sous-page.
  const trimmed = firstP.content.trim();
  return trimmed.length > 220 ? trimmed.slice(0, 200).trim() + '…' : trimmed;
}

export default function Sommaire() {
  return (
    <main id="main-content">
      {/* HERO */}
      <header data-page-hero className={styles.hero} aria-label="Genèse de l'Église">
        <div className={styles.heroInner}>
          <Eyebrow>Mémoire · Archives 2005-2006</Eyebrow>
          <h1 className={styles.heroTitre}>
            Genèse de <em>l'Église.</em>
          </h1>
          <p className={styles.heroSubtitre}>
            Roc Séculaire Tabernacle — depuis le 24 janvier 1999.
          </p>
          <p className={styles.heroDesc}>
            Sept piliers et deux événements marquants, retranscrits intégralement depuis les archives
            du blog historique de l'assemblée. Le récit fondateur tel que le pasteur l'a publié.
          </p>
        </div>
      </header>

      <HairlineDivider weight="major" />

      {/* SOMMAIRE — 7 PILIERS */}
      <section className={styles.sectionPiliers} aria-labelledby="piliers-titre">
        <div className={styles.sectionInner}>
          <p className={styles.sectionEyebrow}>SEPT PILIERS</p>
          <h2 id="piliers-titre" className={styles.sectionTitre}>
            Lire la genèse de l'assemblée.
          </h2>

          <ol className={styles.piliersList}>
            {PILIERS_GENESE.map((p, idx) => {
              const img = pilierImage(p);
              const num = String(idx + 1).padStart(2, '0');
              return (
                <li key={p.id} className={styles.pilierItem}>
                  <Link to={`/genese/${p.slug}`} className={styles.pilierLink}>
                    <div className={styles.pilierFigure}>
                      {img ? (
                        <img src={asset(img)} alt="" className={styles.pilierImg} loading="lazy" />
                      ) : (
                        <div className={styles.pilierImgFallback} aria-hidden="true">
                          <span>{num}</span>
                        </div>
                      )}
                    </div>
                    <div className={styles.pilierBody}>
                      <p className={styles.pilierNum}>§ {idx + 1}</p>
                      <h3 className={styles.pilierTitre}>
                        {p.titreEm ? (
                          <>
                            {p.titre.replace(p.titreEm, '').trim()}{' '}
                            <em>{p.titreEm}</em>
                          </>
                        ) : (
                          p.titre
                        )}
                      </h3>
                      <p className={styles.pilierLede}>{pilierLede(p)}</p>
                      <span className={styles.pilierCta}>Lire le récit →</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <HairlineDivider weight="soft" />

      {/* ÉVÉNEMENTS MARQUANTS */}
      <section className={styles.sectionEvenements} aria-labelledby="evenements-titre">
        <div className={styles.sectionInner}>
          <p className={styles.sectionEyebrow}>ÉVÉNEMENTS MARQUANTS</p>
          <h2 id="evenements-titre" className={styles.sectionTitre}>
            Deux moments saillants.
          </h2>

          <div className={styles.evenementsGrid}>
            {EVENEMENTS_GENESE.map((e) => {
              const img = pilierImage(e);
              return (
                <Link key={e.id} to={`/genese/${e.slug}`} className={styles.evenementCard}>
                  {img && (
                    <div className={styles.evenementFigure}>
                      <img src={asset(img)} alt="" className={styles.evenementImg} loading="lazy" />
                    </div>
                  )}
                  <div className={styles.evenementBody}>
                    <p className={styles.evenementDate}>
                      {new Date(e.publieLe + 'T12:00:00')
                        .toLocaleDateString('fr-FR', { year: 'numeric' })}
                    </p>
                    <h3 className={styles.evenementTitre}>
                      {e.titreEm ? (
                        <>
                          {e.titre.replace(e.titreEm, '').trim()}{' '}
                          <em>{e.titreEm}</em>
                        </>
                      ) : (
                        e.titre
                      )}
                    </h3>
                    <p className={styles.evenementLede}>{e.sousTitre}</p>
                    <span className={styles.evenementCta}>Lire →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
