import styles from './HairlineDivider.module.css';

interface HairlineDividerProps {
  weight?: 'soft' | 'major';
  className?: string;
}

export function HairlineDivider({ weight = 'soft', className = '' }: HairlineDividerProps) {
  return <hr className={`${styles.divider} ${styles[weight]} ${className}`} />;
}
