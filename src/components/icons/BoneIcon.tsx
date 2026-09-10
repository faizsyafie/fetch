// A simple dog-bone silhouette built from primitives rather than an emoji,
// so it can be recolored via `currentColor` — pass a text-color class (e.g.
// an accent preset's `.text`) wherever it's used instead of being stuck with
// whatever tone an emoji glyph renders in.
export function BoneIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <rect x="5" y="9.5" width="14" height="5" rx="2.5" />
      <circle cx="4.5" cy="8" r="3.3" />
      <circle cx="4.5" cy="16" r="3.3" />
      <circle cx="19.5" cy="8" r="3.3" />
      <circle cx="19.5" cy="16" r="3.3" />
    </svg>
  );
}
