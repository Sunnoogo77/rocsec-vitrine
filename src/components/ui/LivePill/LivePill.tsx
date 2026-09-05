import { useTranslation } from 'react-i18next';
import styles from './LivePill.module.css';

interface LivePillProps {
  onClick?: () => void;
  className?: string;
}

export function LivePill({ onClick, className = '' }: LivePillProps) {
  const { t } = useTranslation();

  return (
    <button
      className={`${styles.pill} ${className}`}
      onClick={onClick}
      aria-live="polite"
      aria-label={t('nav.liveLabel')}
    >
      <span className={styles.dot} aria-hidden="true" />
      {t('nav.live')}
    </button>
  );
}
