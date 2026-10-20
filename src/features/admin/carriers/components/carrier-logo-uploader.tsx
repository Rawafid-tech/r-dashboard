import { useEffect, useState } from "react";
import { Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {
  useDeleteAdminCarrierLogo,
  useUploadAdminCarrierLogo,
} from "@/features/admin/carriers/hooks/use-admin-carrier-logo";
import { CarrierMark } from "@/features/shipping-partners/components/carrier-mark";
import { MediaUploadButton } from "@/features/media/components/media-upload-button";
import {
  createFilePreview,
  revokeFilePreview,
} from "@/features/media/lib/media-validation";
import { resolvePublicMediaUrl } from "@/features/media/lib/resolve-public-media-url";
import { cn } from "@/shared/lib/utils";

export interface CarrierLogoUploaderProps {
  code: string;
  name: string;
  logoUrl?: string | null;
  disabled?: boolean;
  /** Vertical logo + actions for tight card layouts (admin carrier row). */
  stacked?: boolean;
  className?: string;
}

export function CarrierLogoUploader({
  code,
  name,
  logoUrl,
  disabled = false,
  stacked = false,
  className,
}: CarrierLogoUploaderProps) {
  const { t } = useTranslation("admin");
  const [previewObjectUrl, setPreviewObjectUrl] = useState<string | null>(null);

  const uploadMutation = useUploadAdminCarrierLogo();
  const deleteMutation = useDeleteAdminCarrierLogo();

  const isLoading = uploadMutation.isPending || deleteMutation.isPending;
  const isDisabled = disabled || isLoading;

  useEffect(() => {
    return () => {
      if (previewObjectUrl) revokeFilePreview(previewObjectUrl);
    };
  }, [previewObjectUrl]);

  const handleFileSelect = (file: File) => {
    const objectUrl = createFilePreview(file);
    if (previewObjectUrl) revokeFilePreview(previewObjectUrl);
    setPreviewObjectUrl(objectUrl);
    uploadMutation.mutate(
      { code, file },
      {
        onSettled: () => {
          setPreviewObjectUrl((current) => {
            if (current) revokeFilePreview(current);
            return null;
          });
        },
      },
    );
  };

  const handleRemove = () => {
    if (isDisabled) return;
    deleteMutation.mutate(code);
  };

  const displayLogoUrl = previewObjectUrl
    ? previewObjectUrl
    : resolvePublicMediaUrl(logoUrl);

  const hasLogo = Boolean(displayLogoUrl);

  const markSize = stacked ? "size-12 text-sm" : "size-14 text-sm";

  return (
    <div
      className={cn(
        stacked
          ? "flex w-12 shrink-0 flex-col items-center gap-2"
          : "flex items-start gap-3",
        className,
      )}
      aria-busy={isLoading || undefined}
    >
      <div className="relative shrink-0">
        {previewObjectUrl ? (
          <img
            src={previewObjectUrl}
            alt=""
            width={48}
            height={48}
            className={cn(
              "rounded-lg border border-border/70 bg-card object-contain p-1",
              stacked ? "size-12" : "size-14",
            )}
          />
        ) : (
          <CarrierMark
            code={code}
            name={name}
            logoUrl={logoUrl}
            className={markSize}
          />
        )}
        {isLoading ? (
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center rounded-lg bg-black/50",
              stacked ? "size-12" : "size-14",
            )}
          >
            <Loader2
              className="size-5 animate-spin text-white"
              aria-hidden="true"
            />
          </div>
        ) : null}
      </div>

      {!disabled ? (
        <div
          className={cn(
            "flex w-full flex-col",
            stacked ? "items-center gap-1.5" : "gap-1.5",
          )}
        >
          {stacked ? (
            <MediaUploadButton
              onFileSelect={handleFileSelect}
              onValidationError={(err) => toast.error(err.message)}
              disabled={isDisabled}
              variant="outline"
              size="icon"
              className="size-8 shrink-0"
            >
              <Upload className="size-3.5" aria-hidden="true" />
              <span className="sr-only">{t("carriers.logo.upload")}</span>
            </MediaUploadButton>
          ) : (
            <MediaUploadButton
              onFileSelect={handleFileSelect}
              onValidationError={(err) => toast.error(err.message)}
              disabled={isDisabled}
              variant="outline"
              size="sm"
            >
              <span>{t("carriers.logo.upload")}</span>
            </MediaUploadButton>
          )}
          {hasLogo || logoUrl ? (
            stacked ? (
              <button
                type="button"
                onClick={handleRemove}
                disabled={isDisabled}
                aria-label={t("carriers.logo.remove")}
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-destructive hover:bg-destructive/10 disabled:opacity-50"
              >
                <Trash2 className="size-3.5" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRemove}
                disabled={isDisabled}
                className="text-start text-sm text-destructive hover:text-destructive/80 disabled:opacity-50"
              >
                {t("carriers.logo.remove")}
              </button>
            )
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
