import type { CSSProperties } from 'react';
import styles from './Eyebrow.module.css';

interface EyebrowProps {
  children: React.ReactNode;
  className?: string;
  color?: 'default' | 'note';
  style?: CSSProperties;
}

export function Eyebrow({ children, className = '', color = 'default', style }: EyebrowProps) {
  return (
    <span
      className={`${styles.eyebrow} ${color === 'note' ? styles.note : ''} ${className}`}
      style={style}
    >
      {children}
    </span>
  );
}
