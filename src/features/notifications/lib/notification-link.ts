import type { NotificationLink } from "@/features/notifications/types";

export function resolveNotificationHref(link: NotificationLink): string | null {
  if (link.type === "SHIPMENT" && link.id) {
    return `/shipments/${encodeURIComponent(link.id)}`;
  }
  return null;
}
