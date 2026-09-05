import { Link } from 'react-router-dom';
import { Eyebrow } from '../../components/ui/Eyebrow/Eyebrow';
import { HairlineDivider } from '../../components/ui/HairlineDivider/HairlineDivider';
import { asset } from '../../utils/asset';
import type { GeneseBlock, GenesePage } from '../../types';
import styles from './PageGenese.module.css';

interface PageGeneseProps {
  page: GenesePage;
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function renderBlock(block: GeneseBlock, idx: number, prevWasFirst: boolean): JSX.Element | null {
  switch (block.kind) {
    case 'paragraph': {
      const cls = prevWasFirst
        ? `${styles.corps} ${styles.dropCap}`
        : styles.corps;
      return (
        <p key={idx} className={cls}>
          {block.content}
        </p>
      );
    }
    case 'heading': {
      const Tag = block.level === 3 ? 'h3' : 'h2';
      const cls = block.level === 3 ? styles.h3 : styles.h2;
      return (
        <Tag key={idx} className={cls}>
          {block.content}
        </Tag>
      );
    }
    case 'quote':
      return (
        <blockquote key={idx} className={styles.quote}>
          <p>« {block.content} »</p>
          {block.source && (
            <p className={styles.quoteSource}>— {block.source}</p>
          )}
        </blockquote>
      );
    case 'pull':
      return (
        <blockquote key={idx} className={styles.pull}>
          <p>« {block.content} »</p>
          {(block.source || block.reference) && (
            <p className={styles.pullSource}>
              {block.source && <>{block.source}</>}
              {block.source && block.reference && <> · </>}
              {block.reference && <>{block.reference}</>}
            </p>
          )}
        </blockquote>
      );
    case 'bibleRef':
      return (
        <div key={idx} className={styles.bibleRef}>
          <p className={styles.bibleRefRef}>{block.reference}</p>
          <blockquote className={styles.bibleRefText}>
            {block.text?.split('\n').map((line, i) => (
              <span key={i} className={styles.bibleRefLine}>
                {line}
              </span>
            ))}
          </blockquote>
        </div>
      );
    case 'image':
      return (
        <figure key={idx} className={styles.figure}>
          <img
            src={asset(block.src ?? '')}
            alt={block.alt ?? ''}
            className={styles.figureImg}
            loading="lazy"
          />
          {block.caption && (
            <figcaption className={styles.figureCaption}>{block.caption}</figcaption>
          )}
        </figure>
      );
    case 'list':
      if (!block.items || block.items.length === 0) return null;
      return (
        <ul key={idx} className={styles.temoignagesList} role="list">
          {block.items.map((item, i) => (
            <li key={i} className={styles.temoignageItem}>
              <span className={styles.temoignageAuteur}>{item.auteur}</span>
              <span className={styles.temoignageRecit}>{item.recit}</span>
            </li>
          ))}
        </ul>
      );
    case 'signature':
      return (
        <p key={idx} className={styles.signature}>
          — {block.content}
        </p>
      );
    default:
      return null;
  }
}

export default function PageGenese({ page }: PageGeneseProps) {
  // Le drop-cap n'est appliqué qu'au tout premier paragraphe corps de la page.
  let firstParagraphSeen = false;

  return (
    <main id="main-content">
      {/* HERO */}
      <header data-page-hero className={styles.hero} aria-label={page.titre}>
        <div className={styles.heroInner}>
          <Eyebrow>{page.eyebrow}</Eyebrow>
          <h1 className={styles.heroTitre}>
            {page.titreEm ? (
              <>
                {page.titre.replace(page.titreEm, '').trim()}{' '}
                <em>{page.titreEm}</em>
              </>
            ) : (
              page.titre
            )}
          </h1>
          {page.sousTitre && (
            <p className={styles.heroSubtitre}>{page.sousTitre}</p>
          )}
          <p className={styles.heroMeta}>
            ARCHIVES &nbsp;·&nbsp; PUBLIÉ LE {formatDate(page.publieLe).toUpperCase()}
          </p>
        </div>
      </header>

      <HairlineDivider weight="major" />

      {/* CORPS */}
      <article className={styles.article}>
        <div className={styles.articleInner}>
          {page.blocs.map((bloc, idx) => {
            const isFirstParagraph =
              !firstParagraphSeen && bloc.kind === 'paragraph';
            if (isFirstParagraph) firstParagraphSeen = true;
            return renderBlock(bloc, idx, isFirstParagraph);
          })}
        </div>
      </article>

      <HairlineDivider weight="soft" />

      {/* SORTIE */}
      <section className={styles.sortie} aria-label="Continuer dans la Genèse">
        <div className={styles.sortieInner}>
          <Link to="/genese" className={styles.sortieLink}>
            ← Retour au sommaire de la Genèse
          </Link>
        </div>
      </section>
    </main>
  );
}
