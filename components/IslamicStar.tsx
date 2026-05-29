/**
 * Islamic 8-pointed star (Khātim / octagram) — two overlapping squares plus
 * an inner star and a center dot. Pure SVG, scales perfectly, uses
 * currentColor so the parent's text color drives the stroke.
 */
export default function IslamicStar({
  className = "h-6 w-6",
  strokeWidth = 3,
}: {
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {/* Outer octagram: two overlapping squares */}
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        <rect x="18" y="18" width="64" height="64" />
        <rect x="18" y="18" width="64" height="64" transform="rotate(45 50 50)" />
      </g>
      {/* Inner octagram */}
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth * 0.7}
        strokeLinejoin="round"
        opacity="0.85"
      >
        <rect x="32" y="32" width="36" height="36" transform="rotate(22.5 50 50)" />
        <rect x="32" y="32" width="36" height="36" transform="rotate(-22.5 50 50)" />
      </g>
      {/* Center dot */}
      <circle cx="50" cy="50" r="3" fill="currentColor" />
    </svg>
  );
}
