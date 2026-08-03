export type MediaVisibility = "PUBLIC" | "PRIVATE";

export type MediaSortField = "CREATED_AT" | "FILENAME" | "SIZE_BYTES";

export interface MediaFile {
  id: string;
  url: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
  visibility: MediaVisibility;
  createdAt: string;
}

export interface MediaUploadRequest {
  file: File;
}

export interface MediaListParams {
  page?: number;
  size?: number;
  sort?: MediaSortField;
  direction?: "ASC" | "DESC";
}

export interface SetLogoRequest {
  mediaId: string;
}

export interface SetAvatarRequest {
  mediaId: string;
}

export const ACCEPTED_MEDIA_TYPES = {
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/webp": [".webp"],
} as const;

export const MAX_MEDIA_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
export const MAX_MEDIA_SIZE_MB = 2;

export type AcceptedMediaType = keyof typeof ACCEPTED_MEDIA_TYPES;
