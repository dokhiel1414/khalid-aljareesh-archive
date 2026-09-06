/**
 * Islamic geometric ornament kit — pure SVG/CSS, zero client JS.
 * Used by Hero, SectionHeader and home sections for a dignified,
 * heritage-flavored visual rhythm that matches the ink/gold identity.
 */

/** Eight-point star (khatam) glyph. Inherits color via currentColor. */
export function StarOrnament({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M12 0l2.6 6.2L21 3l-3.2 6.4L24 12l-6.2 2.6L21 21l-6.4-3.2L12 24l-2.6-6.2L3 21l3.2-6.4L0 12l6.2-2.6L3 3l6.4 3.2z" />
    </svg>
  );
}

/** Hairline — star — hairline divider in gold. */
export function OrnamentDivider({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`} aria-hidden>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent via-gold/40 to-gold/70" />
      <StarOrnament className="h-4 w-4 shrink-0 text-gold" />
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/40 to-gold/70" />
    </div>
  );
}
