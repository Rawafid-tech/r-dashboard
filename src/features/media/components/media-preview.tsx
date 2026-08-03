import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  createFilePreview,
  revokeFilePreview,
} from "@/features/media/lib/media-validation";

export interface MediaPreviewProps {
  file?: File | null;
  url?: string | null;
  alt?: string;
  onRemove?: () => void;
  className?: string;
  removeLabel?: string;
  showRemoveButton?: boolean;
}

/**
 * Component for previewing media files or URLs
 * Handles cleanup of object URLs to prevent memory leaks
 */
export function MediaPreview({
  file,
  url,
  alt = "Preview",
  onRemove,
  className = "",
  removeLabel = "Remove",
  showRemoveButton = true,
}: MediaPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    // Create preview from File object
    if (file) {
      const objectUrl = createFilePreview(file);
      setPreviewUrl(objectUrl);

      // Cleanup on unmount or file change
      return () => {
        revokeFilePreview(objectUrl);
      };
    } else if (url) {
      // Use provided URL directly
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  }, [file, url]);

  if (!previewUrl) {
    return null;
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <img
        src={previewUrl}
        alt={alt}
        className="h-32 w-32 rounded-lg object-cover ring-1 ring-gray-200"
      />

      {showRemoveButton && onRemove && (
        <Button
          type="button"
          variant="destructive"
          size="icon"
          onClick={onRemove}
          className="absolute -right-2 -top-2 h-6 w-6 rounded-full shadow-md"
          aria-label={removeLabel}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}
