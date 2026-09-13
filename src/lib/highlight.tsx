import type { ReactNode } from "react";

// Splits `text` on every case-insensitive occurrence of `query`, wrapping
// matches in an accent-colored span. Returns `text` unchanged when there's
// no query or no match, so the common (non-searching) case stays cheap.
// Shared by The Yard's article cards and Buried Bones' saved-link list.
export function highlightMatches(
  text: string,
  query: string,
  highlightClass: string
): ReactNode {
  if (!query) return text;
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  const firstIndex = lower.indexOf(q);
  if (firstIndex === -1) return text;

  const parts: ReactNode[] = [];
  let cursor = 0;
  let index = firstIndex;
  while (index !== -1) {
    if (index > cursor) parts.push(text.slice(cursor, index));
    parts.push(
      <span key={index} className={`rounded px-0.5 font-semibold ${highlightClass}`}>
        {text.slice(index, index + q.length)}
      </span>
    );
    cursor = index + q.length;
    index = lower.indexOf(q, cursor);
  }
  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts;
}
