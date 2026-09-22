// Trims a raw error/detail string down to something safe to show inline in
// the UI. Some libraries (Playwright among them) append a multi-line
// "========== logs ==========" diagnostic dump to their error's `.message`
// — useful detail, but it belongs in the Debug Log, never inline next to a
// saved link. Strips everything after the first line, then caps the length
// as a second line of defense against anything else unexpectedly long.
export function shortenErrorDetail(message: string, maxLength = 160): string {
  const firstLine = message.split("\n")[0]?.trim() || message.trim();
  return firstLine.length > maxLength
    ? `${firstLine.slice(0, maxLength - 1)}…`
    : firstLine;
}
