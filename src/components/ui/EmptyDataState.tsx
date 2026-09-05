/**
 * Placeholder minimal affiché quand une page consomme une entité non encore
 * chargée (mode API strict, backend hors-ligne).
 *
 * En mode legacy (statique pur), ce composant n'est jamais rendu.
 */

import styles from './EmptyDataState.module.css';

interface EmptyDataStateProps {
  titre?: string;
  message?: string;
}

export default function EmptyDataState({
  titre = 'Contenu indisponible',
  message = "L'API n'a pas répondu. Vérifiez que le serveur d'administration est démarré, puis rechargez la page.",
}: EmptyDataStateProps) {
  return (
    <main id="main-content" className={styles.wrapper}>
      <div className={styles.card}>
        <p className={styles.eyebrow}>Vitrine en attente</p>
        <h1 className={styles.titre}>{titre}</h1>
        <p className={styles.message}>{message}</p>
      </div>
    </main>
  );
}
