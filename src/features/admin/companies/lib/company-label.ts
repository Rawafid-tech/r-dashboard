export function formatCompanyAccountLabel(
  name: string,
  identifier: number,
): string {
  return `${name}-${identifier}`;
}

/** Account number only — use when the company name is already shown nearby. */
export function formatCompanyAccountNumber(identifier: number): string {
  return `#${identifier}`;
}
