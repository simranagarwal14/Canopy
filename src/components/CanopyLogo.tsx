interface Props {
  size?: number;
  /** Show the "Canopy" wordmark next to the symbol. */
  wordmark?: boolean;
  /** Wordmark colour class (use a light one on the dark sidebar). */
  wordmarkClassName?: string;
  className?: string;
}

/** Canopy symbol: a little frog on a lily-pad leaf, with a lotus bud. */
export function CanopyLogo({ size = 64, wordmark = false, wordmarkClassName = "text-ink", className }: Props) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        role="img"
        aria-label="Canopy logo"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* lily pad with notch */}
        <path
          d="M32 40 L54.8 36.8 A23 23 0 1 1 50.84 26.8 Z"
          fill="#529471"
          stroke="#1E3A29"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <g stroke="#2D6A4F" strokeWidth="1.4" strokeLinecap="round" opacity="0.7">
          <path d="M32 40 L14 52" />
          <path d="M32 40 L12 38" />
          <path d="M32 40 L18 24" />
          <path d="M32 40 L32 60" />
          <path d="M32 40 L48 54" />
        </g>
        {/* frog */}
        <ellipse cx="30" cy="35" rx="10.5" ry="7.5" fill="#8fd18a" stroke="#1E3A29" strokeWidth="2.2" />
        <circle cx="24.5" cy="27.8" r="4.2" fill="#fffdf7" stroke="#1E3A29" strokeWidth="2.2" />
        <circle cx="35.5" cy="27.8" r="4.2" fill="#fffdf7" stroke="#1E3A29" strokeWidth="2.2" />
        <circle cx="25" cy="28.2" r="1.7" fill="#1E3A29" />
        <circle cx="35" cy="28.2" r="1.7" fill="#1E3A29" />
        <path d="M25 37 Q30 41 35 37" fill="none" stroke="#1E3A29" strokeWidth="2" strokeLinecap="round" />
        <circle cx="22" cy="34" r="1.6" fill="#e28f83" opacity="0.85" />
        <circle cx="38" cy="34" r="1.6" fill="#e28f83" opacity="0.85" />
        {/* lotus bud */}
        <g stroke="#1E3A29" strokeWidth="1.8" strokeLinejoin="round">
          <path d="M50 22 C46 17 47 11 50 8 C53 11 54 17 50 22 Z" fill="#e28f83" />
          <path d="M50 22 C44 21 42 16 43 13 C47 13 50 17 50 22 Z" fill="#f0b0a6" />
          <path d="M50 22 C56 21 58 16 57 13 C53 13 50 17 50 22 Z" fill="#f0b0a6" />
        </g>
      </svg>
      {wordmark && (
        <span className={`font-display text-2xl font-bold tracking-tight ${wordmarkClassName}`}>Canopy</span>
      )}
    </span>
  );
}
