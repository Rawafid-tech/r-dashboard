import {
  ACCEPTED_MEDIA_TYPES,
  MAX_MEDIA_SIZE_BYTES,
  MAX_MEDIA_SIZE_MB,
  type AcceptedMediaType,
} from "@/features/media/types";

export interface MediaValidationError {
  type: "size" | "format" | "empty";
  message: string;
}

/**
 * Validate media file before upload
 * @param file - The file to validate
 * @returns Error object if validation fails, null if valid
 */
export function validateMediaFile(
  file: File | null | undefined,
): MediaValidationError | null {
  if (!file) {
    return {
      type: "empty",
      message: "No file selected",
    };
  }

  // Check if file is empty
  if (file.size === 0) {
    return {
      type: "empty",
      message: "The uploaded file is empty",
    };
  }

  // Check file size (max 2 MB)
  if (file.size > MAX_MEDIA_SIZE_BYTES) {
    return {
      type: "size",
      message: `The file exceeds the maximum allowed size of ${MAX_MEDIA_SIZE_MB} MB`,
    };
  }

  // Check file type
  const isValidType = Object.keys(ACCEPTED_MEDIA_TYPES).includes(file.type);
  if (!isValidType) {
    return {
      type: "format",
      message: "Only PNG, JPEG and WebP images are allowed",
    };
  }

  return null;
}

/**
 * Format file size to human-readable string
 * @param bytes - Size in bytes
 * @returns Formatted string (e.g., "1.5 MB", "500 KB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const k = 1024;
  const decimals = 2;

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = bytes / Math.pow(k, i);

  return `${size.toFixed(decimals)} ${units[i]}`;
}

/**
 * Get accepted file types for input accept attribute
 * @returns Comma-separated string of accepted file extensions
 */
export function getAcceptedFileTypes(): string {
  return Object.values(ACCEPTED_MEDIA_TYPES).flat().join(",");
}

/**
 * Check if a content type is accepted
 * @param contentType - MIME type to check
 * @returns True if accepted, false otherwise
 */
export function isAcceptedMediaType(
  contentType: string,
): contentType is AcceptedMediaType {
  return Object.keys(ACCEPTED_MEDIA_TYPES).includes(contentType);
}

/**
 * Create preview URL for uploaded file
 * @param file - File to preview
 * @returns Object URL or null
 */
export function createFilePreview(file: File | null): string | null {
  if (!file) return null;
  return URL.createObjectURL(file);
}

/**
 * Revoke preview URL to prevent memory leaks
 * @param url - Object URL to revoke
 */
export function revokeFilePreview(url: string | null): void {
  if (url) {
    URL.revokeObjectURL(url);
  }
}
export { MAX_MEDIA_SIZE_MB };

