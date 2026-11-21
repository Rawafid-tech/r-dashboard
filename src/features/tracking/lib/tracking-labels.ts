import type { PublicTracking, PublicTrackingStatus, PublicTrackingStep } from "@/features/tracking/types";

/** Translation key (namespace "tracking") for the status headline. */
export function statusLabelKey(status: PublicTrackingStatus): string {
  // FAILED and CANCELLED read the same to a customer: the shipment will not come.
  return status === "FAILED" ? "status.CANCELLED" : `status.${status}`;
}

/** Translation key for a step; a return pickup is picked up "from you", not from the sender. */
export function stepLabelKey(step: PublicTrackingStep, kind: PublicTracking["kind"]): string {
  if (step === "PICKED_UP" && kind === "RETURN_PICKUP") return "steps.PICKED_UP_FROM_YOU";
  return `steps.${step}`;
}

export type StatusTone = "success" | "warning" | "danger" | "progress";

export function statusTone(status: PublicTrackingStatus): StatusTone {
  switch (status) {
    case "DELIVERED":
      return "success";
    case "RETURNING":
    case "RETURNED":
      return "warning";
    case "LOST":
    case "FAILED":
    case "CANCELLED":
      return "danger";
    default:
      return "progress";
  }
}
