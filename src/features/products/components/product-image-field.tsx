import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { MediaPreview } from "@/features/media/components/media-preview";
import { MediaUploadZone } from "@/features/media/components/media-upload-zone";
import { useMediaUpload } from "@/features/media/hooks/use-media-upload";
import type { MediaValidationError } from "@/features/media/lib/media-validation";
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/shared/components/ui";

interface ProductImageFieldProps {
  formId: string;
  imageMediaId: string;
  imageUrl: string | null;
  productName: string;
  disabled?: boolean;
  onImageChange: (mediaId: string, url: string | null) => void;
}

export function ProductImageField({
  formId,
  imageMediaId,
  imageUrl,
  productName,
  disabled,
  onImageChange,
}: ProductImageFieldProps) {
  const { t } = useTranslation("products");
  const { t: tSettings } = useTranslation("settings");
  const [previewUrl, setPreviewUrl] = useState<string | null>(imageUrl);

  useEffect(() => {
    setPreviewUrl(imageUrl);
  }, [imageUrl]);

  const uploadMutation = useMediaUpload({
    onSuccess: (media) => {
      setPreviewUrl(media.url);
      onImageChange(media.id, media.url);
    },
    onError: () => {
      toast.error(tSettings("media.errors.uploadFailed"));
    },
  });

  const handleValidationError = useCallback(
    (error: MediaValidationError) => {
      toast.error(tSettings(`media.errors.${error}`));
    },
    [tSettings],
  );

  const handleRemove = () => {
    setPreviewUrl(null);
    onImageChange("", null);
  };

  const busy = disabled || uploadMutation.isPending;
  const hasImage = Boolean(imageMediaId && previewUrl);

  return (
    <Field>
      <FieldLabel htmlFor={`${formId}-image`}>{t("form.image")}</FieldLabel>
      <FieldDescription>{t("form.imageHint")}</FieldDescription>

      <div className="pt-2">
        {hasImage ? (
          <MediaPreview
            url={previewUrl}
            alt={productName || t("form.image")}
            onRemove={busy ? undefined : handleRemove}
            removeLabel={t("form.imageRemove")}
          />
        ) : (
          <MediaUploadZone
            onFileSelect={(file) => uploadMutation.mutate(file)}
            onValidationError={handleValidationError}
            disabled={busy}
          />
        )}

        {uploadMutation.isPending ? (
          <p
            className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"
            role="status"
          >
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            {t("form.imageUploading")}
          </p>
        ) : null}
      </div>
    </Field>
  );
}
