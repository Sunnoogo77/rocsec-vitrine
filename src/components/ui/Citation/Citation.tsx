import styles from './Citation.module.css';

interface CitationBiblProps {
  variant: 'bibl';
  texte: string;
  reference?: string;
  className?: string;
}

interface CitationBranProps {
  variant: 'bran';
  texte: string;
  source: string;
  className?: string;
}

interface CitationPullProps {
  variant: 'pull';
  texte: string;
  source?: string;
  className?: string;
}

type CitationProps = CitationBiblProps | CitationBranProps | CitationPullProps;

export function Citation(props: CitationProps) {
  if (props.variant === 'bibl') {
    return (
      <blockquote className={`${styles.bibl} ${props.className ?? ''}`}>
        <p>{props.texte}</p>
        {props.reference && (
          <cite className={styles.ref}>{props.reference}</cite>
        )}
      </blockquote>
    );
  }

  if (props.variant === 'bran') {
    return (
      <blockquote className={`${styles.bran} ${props.className ?? ''}`}>
        <p>{props.texte}</p>
        <cite className={styles.source}>{props.source}</cite>
      </blockquote>
    );
  }

  // variant === 'pull'
  return (
    <blockquote className={`${styles.pull} ${props.className ?? ''}`}>
      <p>{props.texte}</p>
      {props.source && <cite className={styles.pullSource}>{props.source}</cite>}
    </blockquote>
  );
}
