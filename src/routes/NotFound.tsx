import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main style={{ padding: '120px 32px', textAlign: 'center' }}>
      <p style={{ fontFamily: 'var(--f-body)', fontSize: 11, letterSpacing: '.26em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 24 }}>
        Page introuvable
      </p>
      <h1 style={{ fontFamily: 'var(--f-serif)', fontSize: 52, fontWeight: 500 }}>404</h1>
      <p style={{ marginTop: 24, marginBottom: 40, fontFamily: 'var(--f-serif)', fontSize: 20, color: 'var(--ink-2)' }}>
        Cette page n'existe pas ou a été déplacée.
      </p>
      <Link to="/" style={{ fontFamily: 'var(--f-body)', fontSize: 12, letterSpacing: '.16em', textTransform: 'uppercase', textDecoration: 'underline', color: 'var(--ink)' }}>
        Retour à l'accueil →
      </Link>
    </main>
  );
}
