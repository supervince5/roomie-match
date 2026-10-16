/** A ceramic matcha bowl with two rising stems: a small shared ritual. */
export default function BrandMark() {
  return <svg className="brand-mark" viewBox="0 0 56 56" fill="none" aria-hidden="true">
    <path d="M24 17c-5-6 5-7 1-13M33 18c5-5-3-7 1-11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M7 28c1 13 8 21 21 21s20-8 21-21" fill="var(--surface, #fffef8)" stroke="currentColor" strokeWidth="1.6" />
    <ellipse cx="28" cy="28" rx="21" ry="7" fill="var(--matcha-soft, #e6ecd8)" stroke="currentColor" strokeWidth="1.6" />
    <path d="M14 28c7-4 21-4 28 0M23 49v3h10v-3" stroke="var(--matcha, #65774d)" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M42 13c-1-5 3-8 7-8 1 5-2 8-7 8Z" fill="var(--sakura-pink, #ffb1b1)" />
  </svg>;
}
