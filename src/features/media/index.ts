// Types
export type {
  MediaFile,
  MediaVisibility,
  MediaSortField,
  MediaUploadRequest,
  MediaListParams,
  SetLogoRequest,
  SetAvatarRequest,
  AcceptedMediaType,
} from "./types";

export {
  ACCEPTED_MEDIA_TYPES,
  MAX_MEDIA_SIZE_BYTES,
  MAX_MEDIA_SIZE_MB,
} from "./types";

// API
export {
  uploadMedia,
  getMediaList,
  deleteMedia,
  setCompanyLogo,
  clearCompanyLogo,
  setUserAvatar,
  clearUserAvatar,
  getMediaPublicUrl,
} from "./api/media.api";

// Validation Utilities
export {
  validateMediaFile,
  formatFileSize,
  getAcceptedFileTypes,
  isAcceptedMediaType,
  createFilePreview,
  revokeFilePreview,
} from "./lib/media-validation";

export type { MediaValidationError } from "./lib/media-validation";

// Hooks
export { useMediaUpload } from "./hooks/use-media-upload";
export { useMediaList, MEDIA_QUERY_KEYS } from "./hooks/use-media-list";
export { useMediaDelete } from "./hooks/use-media-delete";
export {
  useSetCompanyLogo,
  useClearCompanyLogo,
} from "./hooks/use-company-logo";
export {
  useSetUserAvatar,
  useClearUserAvatar,
} from "./hooks/use-user-avatar";

// Components
export { MediaUploadButton } from "./components/media-upload-button";
export { MediaPreview } from "./components/media-preview";
export { MediaUploadZone } from "./components/media-upload-zone";
export { AvatarUploader } from "./components/avatar-uploader";
export { LogoUploader } from "./components/logo-uploader";
export { MediaGallery } from "./components/media-gallery";
