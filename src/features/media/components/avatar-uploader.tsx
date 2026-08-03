import { useState, useEffect } from "react";
import { User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { MediaUploadButton } from "@/features/media/components/media-upload-button";
import { MediaPreview } from "@/features/media/components/media-preview";
import { useMediaUpload } from "@/features/media/hooks/use-media-upload";
import {
  useSetUserAvatar,
  useClearUserAvatar,
} from "@/features/media/hooks/use-user-avatar";
import { cn } from "@/shared/lib/utils";

export interface AvatarUploaderProps {
  currentAvatarUrl?: string | null;
  onSuccess?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-16 w-16",
  md: "h-24 w-24",
  lg: "h-32 w-32",
};

export function AvatarUploader({
  currentAvatarUrl,
  onSuccess,
  className,
  size = "md",
}: AvatarUploaderProps) {
  const { t } = useTranslation("settings");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const uploadMutation = useMediaUpload({
    onSuccess: (data) => {
      setAvatarMutation.mutate({ mediaId: data.id });
    },
    onError: (error) => {
      toast.error(error.detail || t("media.errors.uploadFailed"));
      setSelectedFile(null);
    },
  });

  const setAvatarMutation = useSetUserAvatar({
    onSuccess: () => {
      toast.success(t("media.avatar.updated"));
      setSelectedFile(null);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.detail || t("media.errors.setAvatarFailed"));
    },
  });

  const clearAvatarMutation = useClearUserAvatar({
    onSuccess: () => {
      toast.success(t("media.avatar.removed"));
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.detail || t("media.errors.setAvatarFailed"));
    },
  });

  // Trigger upload as soon as a file is selected
  useEffect(() => {
    if (selectedFile && !uploadMutation.isPending) {
      uploadMutation.mutate(selectedFile);
    }
  }, [selectedFile]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRemove = () => {
    if (isLoading) return;
    if (currentAvatarUrl) {
      clearAvatarMutation.mutate();
    } else {
      setSelectedFile(null);
    }
  };

  const isLoading =
    uploadMutation.isPending ||
    setAvatarMutation.isPending ||
    clearAvatarMutation.isPending;

  const displayUrl = selectedFile ? undefined : currentAvatarUrl;

  return (
    <div className={cn("flex items-center gap-4", className)}>
      {/* Thumbnail */}
      <div
        className={cn(
          "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted ring-2 ring-border",
          sizeClasses[size],
        )}
      >
        {selectedFile || displayUrl ? (
          <MediaPreview
            file={selectedFile}
            url={displayUrl}
            alt={t("fields.avatar")}
            showRemoveButton={false}
            className="h-full w-full"
          />
        ) : (
          <User className="h-1/2 w-1/2 text-muted-foreground" aria-hidden="true" />
        )}

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
            <Loader2 className="h-6 w-6 animate-spin text-white" aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-2">
        <MediaUploadButton
          onFileSelect={setSelectedFile}
          onValidationError={(err) => toast.error(err.message)}
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          <span>{t("media.avatar.change")}</span>
        </MediaUploadButton>

        {(currentAvatarUrl || selectedFile) && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={isLoading}
            className="text-sm text-destructive hover:text-destructive/80 disabled:opacity-50"
          >
            {t("media.avatar.remove")}
          </button>
        )}
      </div>
    </div>
  );
}
