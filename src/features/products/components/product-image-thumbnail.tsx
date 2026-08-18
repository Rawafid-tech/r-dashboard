import { ImageIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/shared/lib/utils";

interface ProductImageThumbnailProps {
  imageUrl: string | null;
  name: string;
  className?: string;
}

export function ProductImageThumbnail({
  imageUrl,
  name,
  className,
}: ProductImageThumbnailProps) {
  const { t } = useTranslation("products");

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        loading="lazy"
        decoding="async"
        className={cn(
          "size-10 shrink-0 rounded-md object-cover ring-1 ring-border/60",
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-md bg-muted ring-1 ring-border/60",
        className,
      )}
      aria-hidden="true"
    >
      <ImageIcon className="size-4 text-muted-foreground" />
      <span className="sr-only">{t("table.noImage")}</span>
    </div>
  );
}
