import type {
  BulkBookingLineDraft,
  BulkPreviewLine,
  BulkPreviewLineRequest,
  BulkBookLineRequest,
} from "@/features/shipments/types";

const NO_SKIPPED: ReadonlySet<string> = new Set();

export const MAX_BULK_BOOKING_LINES = 50;

export function draftsToPreviewPayload(
  drafts: BulkBookingLineDraft[],
): BulkPreviewLineRequest[] {
  return drafts
    .filter((line) => !line.removed)
    .map((line) => {
      const request: BulkPreviewLineRequest = { orderId: line.orderId };
      if (line.connectionId) {
        request.connectionId = line.connectionId;
      }
      if (line.districtId) {
        request.districtId = line.districtId;
      }
      return request;
    });
}

/**
 * Orders whose current preview (for the same partner) says they cannot be
 * booked. Sending them would only come back REJECTED, so they are skipped.
 */
export function unbookableOrderIds(
  drafts: BulkBookingLineDraft[],
  previewByOrderId: ReadonlyMap<string, BulkPreviewLine>,
): ReadonlySet<string> {
  const skipped = new Set<string>();
  for (const line of drafts) {
    if (line.removed || !line.connectionId) continue;
    const preview = previewByOrderId.get(line.orderId);
    if (
      preview &&
      preview.connection?.id === line.connectionId &&
      !preview.bookable
    ) {
      skipped.add(line.orderId);
    }
  }
  return skipped;
}

export function draftsToBulkBookPayload(
  drafts: BulkBookingLineDraft[],
  skipped: ReadonlySet<string> = NO_SKIPPED,
): BulkBookLineRequest[] {
  return drafts
    .filter(
      (line) =>
        !line.removed && line.connectionId && !skipped.has(line.orderId),
    )
    .map((line) => ({
      orderId: line.orderId,
      connectionId: line.connectionId!,
      districtId: line.districtId ?? null,
    }));
}

export function stablePreviewKey(lines: BulkPreviewLineRequest[]): string {
  return JSON.stringify(lines);
}

export function canSubmitBulkBook(
  drafts: BulkBookingLineDraft[],
  skipped: ReadonlySet<string> = NO_SKIPPED,
): boolean {
  const active = drafts.filter((line) => !line.removed);
  if (active.length === 0 || active.length > MAX_BULK_BOOKING_LINES) {
    return false;
  }
  if (!active.every((line) => Boolean(line.connectionId))) return false;
  return active.some((line) => !skipped.has(line.orderId));
}
