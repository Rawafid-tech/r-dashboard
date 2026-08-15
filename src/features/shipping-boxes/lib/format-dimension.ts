/** Display helper — trims trailing `.00` only; never use for API payloads. */
export function formatDimension(value: number): string {
  const fixed = value.toFixed(2);
  if (fixed.endsWith(".00")) {
    return fixed.slice(0, -3);
  }
  return fixed;
}

/** Round user input to at most two decimal places before submit. */
export function roundDimensionInput(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) return trimmed;

  const rounded = Math.round(parsed * 100) / 100;
  return String(rounded);
}
