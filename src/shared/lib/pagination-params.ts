/**
 * URL search params use 1-based page numbers for readability (`?page=2`).
 * The API uses 0-based page indexes (`page=1`).
 */
export function readPageIndex(pageParam: string | null): number {
  const parsed = Number(pageParam ?? "1");

  if (!Number.isFinite(parsed) || parsed < 1) {
    return 0;
  }

  return Math.floor(parsed) - 1;
}

export function writePageIndex(pageIndex: number): string | null {
  if (!Number.isFinite(pageIndex) || pageIndex <= 0) {
    return null;
  }

  return String(Math.floor(pageIndex) + 1);
}

export function shouldResetPageIndex(
  pageIndex: number,
  totalPages: number,
  totalElements: number,
  contentLength: number,
): boolean {
  if (totalPages <= 0) {
    return false;
  }

  if (pageIndex >= totalPages) {
    return true;
  }

  return totalElements > 0 && contentLength === 0 && pageIndex > 0;
}
