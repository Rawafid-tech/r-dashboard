import type {
  BulkBookingLineDraft,
  BulkPreviewLineRequest,
  BulkBookLineRequest,
} from "@/features/shipments/types";

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

export function draftsToBulkBookPayload(
  drafts: BulkBookingLineDraft[],
): BulkBookLineRequest[] {
  return drafts
    .filter((line) => !line.removed && line.connectionId)
    .map((line) => ({
      orderId: line.orderId,
      connectionId: line.connectionId!,
      districtId: line.districtId ?? null,
    }));
}

export function stablePreviewKey(lines: BulkPreviewLineRequest[]): string {
  return JSON.stringify(lines);
}

export function canSubmitBulkBook(drafts: BulkBookingLineDraft[]): boolean {
  const active = drafts.filter((line) => !line.removed);
  if (active.length === 0 || active.length > MAX_BULK_BOOKING_LINES) {
    return false;
  }
  return active.every((line) => Boolean(line.connectionId));
}
