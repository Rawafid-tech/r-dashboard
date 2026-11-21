/** `GET /api/public/track/{code}` (docs/2026-11-21-public-tracking-page.md §2). Anonymous. */

export type PublicTrackingStatus =
  | "BOOKING"
  | "BOOKED"
  | "IN_TRANSIT"
  | "RETURNING"
  | "DELIVERED"
  | "RETURNED"
  | "LOST"
  | "FAILED"
  | "CANCELLED";

export type PublicTrackingStep = "BOOKED" | "PICKED_UP" | "DELIVERED" | "SWAPPED" | "RETURNED";

export interface PublicTracking {
  status: PublicTrackingStatus;
  kind: "DELIVERY" | "RETURN_PICKUP" | "EXCHANGE";
  /** In display order; `at` null = not reached yet. */
  steps: { step: PublicTrackingStep; at: string | null }[];
  /** May be null while BOOKING. */
  trackingNumber: string | null;
  carrier: { nameEn: string; nameAr: string; logoUrl: string | null } | null;
  company: { name: string; logoUrl: string | null } | null;
  hasIssue: boolean;
  attempts: number;
  /** When Rawafid last heard a change; null before the carrier's first report. */
  lastUpdateAt: string | null;
}
