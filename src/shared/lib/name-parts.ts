/**
 * Joins place names, skipping blanks and a name equal to one already shown
 * (e.g. a carrier that files a governorate as its own zone and district).
 * Names are compared after trimming only, so distinct spellings stay apart.
 */
export function joinDistinctNames(
  parts: ReadonlyArray<string | null | undefined>,
  separator: string,
): string {
  const seen = new Set<string>();
  const shown: string[] = [];
  for (const part of parts) {
    const name = part?.trim();
    if (!name || seen.has(name)) continue;
    seen.add(name);
    shown.push(name);
  }
  return shown.join(separator);
}
