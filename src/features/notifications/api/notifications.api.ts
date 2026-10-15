import { apiClient } from "@/shared/api/client";
import type { PaginatedResponse } from "@/shared/types/api";
import type {
  MarkAllReadResponse,
  Notification,
  NotificationPreferencesResponse,
  NotificationsListParams,
  UnreadCountResponse,
  UpdateNotificationPreferencesRequest,
} from "@/features/notifications/types";

export async function getNotifications(
  params: NotificationsListParams = {},
  signal?: AbortSignal,
): Promise<PaginatedResponse<Notification>> {
  const { data } = await apiClient.get<PaginatedResponse<Notification>>(
    "/api/notifications",
    {
      params: {
        unread: params.unread,
        page: params.page,
        size: params.size,
      },
      signal,
    },
  );
  return data;
}

export async function getUnreadNotificationCount(
  signal?: AbortSignal,
): Promise<UnreadCountResponse> {
  const { data } = await apiClient.get<UnreadCountResponse>(
    "/api/notifications/unread-count",
    { signal },
  );
  return data;
}

export async function markNotificationRead(id: string): Promise<Notification> {
  const { data } = await apiClient.post<Notification>(
    `/api/notifications/${encodeURIComponent(id)}/read`,
  );
  return data;
}

export async function markAllNotificationsRead(): Promise<MarkAllReadResponse> {
  const { data } = await apiClient.post<MarkAllReadResponse>(
    "/api/notifications/read-all",
  );
  return data;
}

export async function getNotificationPreferences(
  signal?: AbortSignal,
): Promise<NotificationPreferencesResponse> {
  const { data } = await apiClient.get<NotificationPreferencesResponse>(
    "/api/notification-preferences",
    { signal },
  );
  return data;
}

export async function updateNotificationPreferences(
  payload: UpdateNotificationPreferencesRequest,
): Promise<NotificationPreferencesResponse> {
  const { data } = await apiClient.put<NotificationPreferencesResponse>(
    "/api/notification-preferences",
    payload,
  );
  return data;
}
