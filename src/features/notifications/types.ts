export const NOTIFICATION_TOPICS = [
  "SHIPMENT_PICKED_UP",
  "SHIPMENT_DELIVERED",
  "SHIPMENT_RETURNED",
  "SHIPMENT_RETURNING",
  "SHIPMENT_ISSUE",
  "SHIPMENT_LOST",
  "SHIPMENT_CANCELLED_BY_CARRIER",
  "SHIPMENT_BOOKING_FAILED",
  "SHIPMENT_RETURN_PICKED_UP",
  "SHIPMENT_RETURN_RECEIVED",
  "SHIPMENT_RETURN_FAILED",
  "SHIPMENT_EXCHANGE_SWAPPED",
  "SHIPMENT_EXCHANGE_COMPLETED",
  "SHIPMENT_EXCHANGE_FAILED",
] as const;

export type NotificationTopic = (typeof NOTIFICATION_TOPICS)[number];

export type NotificationLinkType = "SHIPMENT";

export interface NotificationLink {
  type: NotificationLinkType;
  id: string;
}

export interface NotificationParams {
  reason?: string;
  orderNumber?: string;
  trackingNumber?: string;
}

export interface Notification {
  id: string;
  topic: NotificationTopic;
  title: string;
  body: string;
  params: NotificationParams;
  link: NotificationLink;
  read: boolean;
  createdAt: string;
}

export interface NotificationsListParams {
  unread?: boolean;
  page?: number;
  size?: number;
}

export interface UnreadCountResponse {
  unread: number;
}

export interface MarkAllReadResponse {
  marked: number;
}

export interface NotificationPreferenceTopic {
  topic: NotificationTopic;
  inApp: boolean;
  email: boolean;
  inAppByDefault: boolean;
  emailByDefault: boolean;
}

export interface NotificationPreferencesResponse {
  topics: NotificationPreferenceTopic[];
}

export interface NotificationPreferenceUpdate {
  topic: NotificationTopic;
  inApp: boolean;
  email: boolean;
}

export interface UpdateNotificationPreferencesRequest {
  topics: NotificationPreferenceUpdate[];
}
