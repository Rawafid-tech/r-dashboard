import { apiClient } from "@/shared/api/client";
import type { PaginatedResponse } from "@/shared/types/api";
import type {
  MediaFile,
  MediaListParams,
  SetAvatarRequest,
  SetLogoRequest,
} from "@/features/media/types";
import type { User } from "@/features/auth/types";

/**
 * Upload a media file (PNG, JPEG, WebP - max 2MB)
 * @param file - The file to upload
 * @returns MediaFile response with id and public URL
 */
export async function uploadMedia(file: File): Promise<MediaFile> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await apiClient.post<MediaFile>("/api/media", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
}

/**
 * Get paginated list of company's media files
 * @param params - Pagination and sorting parameters
 * @returns Paginated response of media files
 */
export async function getMediaList(
  params?: MediaListParams,
): Promise<PaginatedResponse<MediaFile>> {
  const { data } = await apiClient.get<PaginatedResponse<MediaFile>>(
    "/api/media",
    {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 20,
        sort: params?.sort ?? "CREATED_AT",
        direction: params?.direction ?? "DESC",
      },
    },
  );

  return data;
}

/**
 * Delete a media file by ID
 * @param mediaId - The ID of the media file to delete
 */
export async function deleteMedia(mediaId: string): Promise<void> {
  await apiClient.delete(`/api/media/${mediaId}`);
}

/**
 * Set company logo by media ID (OWNER only)
 * @param payload - Object containing mediaId
 * @returns Updated company data
 */
export async function setCompanyLogo(
  payload: SetLogoRequest,
): Promise<unknown> {
  const { data } = await apiClient.put("/api/company/logo", payload);
  return data;
}

/**
 * Clear company logo (OWNER only)
 */
export async function clearCompanyLogo(): Promise<void> {
  await apiClient.delete("/api/company/logo");
}

/**
 * Set user avatar by media ID
 * @param payload - Object containing mediaId
 * @returns Updated user data with avatarUrl
 */
export async function setUserAvatar(payload: SetAvatarRequest): Promise<User> {
  const { data } = await apiClient.put<User>("/api/auth/me/avatar", payload);
  return data;
}

/**
 * Clear user avatar
 */
export async function clearUserAvatar(): Promise<void> {
  await apiClient.delete("/api/auth/me/avatar");
}

/**
 * Get public URL for a media file
 * @param mediaId - The ID of the media file
 * @returns Full public URL (no auth required)
 */
export function getMediaPublicUrl(mediaId: string): string {
  return `${apiClient.defaults.baseURL}/api/public/media/${mediaId}`;
}
