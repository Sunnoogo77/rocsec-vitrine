// Logo ovale RST — placeholder SVG en attendant le logo-rst.png officiel.
// Remplacer par <img src="/images/logo-rst.png" alt="..." /> quand disponible.
export function RstLogo() {
  return (
    <svg
      viewBox="0 0 140 88"
      width="70"
      height="44"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <ellipse
        cx="70"
        cy="44"
        rx="66"
        ry="40"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <text
        x="70"
        y="40"
        textAnchor="middle"
        fontFamily="Cinzel, serif"
        fontWeight="600"
        fontSize="28"
        fill="currentColor"
        letterSpacing="4"
      >
        RST
      </text>
      <text
        x="70"
        y="62"
        textAnchor="middle"
        fontFamily="Cormorant Garamond, serif"
        fontStyle="italic"
        fontSize="9"
        fill="var(--note)"
        letterSpacing="0.5"
      >
        Roc Séculaire Tabernacle
      </text>
    </svg>
  );
}
