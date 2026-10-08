export type RegionActiveFilter = "all" | "active" | "retired";

export function readRegionActiveFilter(
  value: string | null,
): RegionActiveFilter {
  if (value === "active" || value === "retired") return value;
  return "all";
}

export function activeFilterToParam(
  filter: RegionActiveFilter,
): boolean | undefined {
  if (filter === "active") return true;
  if (filter === "retired") return false;
  return undefined;
}

export function readUnmappedFilter(value: string | null): boolean {
  return value === "true";
}
