import { useCallback, useState, type DragEvent } from "react";
import { Upload, FileImage } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/shared/lib/utils";
import { MAX_MEDIA_SIZE_MB } from "@/features/media/types";
import {
  validateMediaFile,
  type MediaValidationError,
} from "@/features/media/lib/media-validation";

export interface MediaUploadZoneProps {
  onFileSelect: (file: File) => void;
  onValidationError?: (error: MediaValidationError) => void;
  disabled?: boolean;
  className?: string;
}

export function MediaUploadZone({
  onFileSelect,
  onValidationError,
  disabled = false,
  className,
}: MediaUploadZoneProps) {
  const { t } = useTranslation("settings");
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      const validationError = validateMediaFile(file);
      if (validationError) {
        onValidationError?.(validationError);
        return;
      }
      onFileSelect(file);
    },
    [onFileSelect, onValidationError],
  );

  const handleDragEnter = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) setIsDragging(true);
    },
    [disabled],
  );

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (disabled) return;
      const file = Array.from(e.dataTransfer.files)[0];
      if (file) handleFile(file);
    },
    [disabled, handleFile],
  );

  const handleClick = useCallback(() => {
    if (disabled) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png,image/jpeg,image/webp";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) handleFile(file);
    };
    input.click();
  }, [disabled, handleFile]);

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={t("media.dropzone.ariaLabel")}
      aria-disabled={disabled}
      onClick={handleClick}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      className={cn(
        "relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isDragging
          ? "border-primary bg-primary/5"
          : "border-border hover:border-muted-foreground/50 hover:bg-muted/40",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        {isDragging ? (
          <FileImage className="h-12 w-12 text-primary" aria-hidden="true" />
        ) : (
          <Upload className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
        )}

        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">
            {isDragging
              ? t("media.dropzone.active")
              : t("media.dropzone.idle")}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("media.dropzone.hint", { max: MAX_MEDIA_SIZE_MB })}
          </p>
        </div>
      </div>
    </div>
  );
}
