import { type MouseEvent } from 'react';
import styles from './Button.module.css';

type ButtonVariant = 'video' | 'blue' | 'secondary' | 'line' | 'more';

interface BaseProps {
  variant: ButtonVariant;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

interface ButtonAsButton extends BaseProps {
  as?: 'button';
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  href?: never;
}

interface ButtonAsAnchor extends BaseProps {
  as: 'a';
  href: string;
  onClick?: never;
}

type ButtonProps = ButtonAsButton | ButtonAsAnchor;

export function Button(props: ButtonProps) {
  const { variant, children, className = '', disabled } = props;

  const cls = [
    styles.btn,
    styles[variant],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (props.as === 'a') {
    return (
      <a href={props.href} className={cls}>
        {children}
      </a>
    );
  }

  return (
    <button className={cls} onClick={props.onClick} disabled={disabled}>
      {children}
    </button>
  );
}
