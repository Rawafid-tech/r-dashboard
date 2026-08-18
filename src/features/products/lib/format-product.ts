/** Display helper — trims trailing zeros; never use for API payloads. */
export function formatPrice(value: number): string {
  const fixed = value.toFixed(2);
  if (fixed.endsWith(".00")) {
    return fixed.slice(0, -3);
  }
  return fixed;
}

export function formatWeight(value: number): string {
  const fixed = value.toFixed(3);
  if (fixed.endsWith(".000")) {
    return fixed.slice(0, -4);
  }
  if (fixed.endsWith("0") && fixed.includes(".")) {
    return fixed.replace(/0+$/, "").replace(/\.$/, "");
  }
  return fixed;
}
