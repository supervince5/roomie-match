/** An open doorway: making room for someone new. */
export default function BrandMark() {
  return (
    <svg
      className="brand-mark"
      viewBox="0 0 52 56"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M37 8H9a5 5 0 0 0-5 5v34a5 5 0 0 0 5 5h20c11 0 19-8 19-19v-14"
        stroke="#8197a1"
        strokeWidth="1.35"
      />
      <path
        d="M39 8 47 5v11l-8 3V8Z"
        stroke="#8a6b98"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
      <circle cx="44.5" cy="12" r=".65" fill="#8a6b98" />
      <text
        x="25.5"
        y="39"
        fill="currentColor"
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontSize="28"
        letterSpacing="-1.25"
      >
        rm
      </text>
    </svg>
  );
}
