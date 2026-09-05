// Silhouette SVG de la Tour Eiffel — utilisée dans le hero Accueil
// PRD §4.2 : "silhouette SVG de la Tour Eiffel discrète (opacité ~0.18) à gauche"
interface EiffelSilhouetteProps {
  className?: string;
}

export function EiffelSilhouette({ className }: EiffelSilhouetteProps) {
  return (
    <svg
      viewBox="0 0 200 560"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {/* Antenne */}
      <rect x="97" y="0" width="6" height="40" fill="currentColor" />
      <rect x="94" y="36" width="12" height="6" fill="currentColor" />

      {/* Corps supérieur — fuseau fin */}
      <path d="M94 42 L106 42 L124 150 L76 150 Z" fill="currentColor" />

      {/* 1er étage — plateforme */}
      <rect x="70" y="148" width="60" height="10" fill="currentColor" />

      {/* Arc décoratif 1er étage */}
      <path d="M70 158 Q100 170 130 158 L130 162 Q100 175 70 162 Z" fill="currentColor" />

      {/* Corps médian — trapèze élargi */}
      <path d="M76 168 L124 168 L152 290 L48 290 Z" fill="currentColor" />

      {/* 2e étage — plateforme large */}
      <rect x="42" y="288" width="116" height="12" fill="currentColor" />

      {/* Arc décoratif 2e étage */}
      <path d="M42 300 Q100 316 158 300 L158 305 Q100 322 42 305 Z" fill="currentColor" />

      {/* Corps inférieur — 4 pieds en arc */}
      {/* Pied gauche extérieur */}
      <path d="M48 310 Q26 400 18 560 L40 560 Q46 400 62 310 Z" fill="currentColor" />
      {/* Pied gauche intérieur */}
      <path d="M62 310 Q68 400 72 560 L85 560 Q82 400 88 310 Z" fill="currentColor" />
      {/* Pied droit intérieur */}
      <path d="M112 310 Q118 400 115 560 L128 560 Q132 400 138 310 Z" fill="currentColor" />
      {/* Pied droit extérieur */}
      <path d="M138 310 Q154 400 160 560 L182 560 Q174 400 152 310 Z" fill="currentColor" />

      {/* Entretoise horizontale entre les pieds (1er niveau) */}
      <rect x="40" y="400" width="42" height="8" fill="currentColor" />
      <rect x="118" y="400" width="42" height="8" fill="currentColor" />

      {/* Arc central entre les 4 pieds */}
      <path d="M62 340 Q100 360 138 340 L138 350 Q100 372 62 350 Z" fill="currentColor" />
      <path d="M42 430 Q100 455 158 430 L158 440 Q100 466 42 440 Z" fill="currentColor" />
    </svg>
  );
}
