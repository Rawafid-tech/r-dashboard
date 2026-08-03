import { useState } from "react";
import { Trash2, ImageIcon, Loader2 } from "lucide-react";
import { formatFileSize } from "@/features/media/lib/media-validation";
import { useMediaList } from "@/features/media/hooks/use-media-list";
import { useMediaDelete } from "@/features/media/hooks/use-media-delete";
import { Button } from "@/shared/components/ui/button";
import { toast } from "sonner";
import type { MediaFile } from "@/features/media/types";

export interface MediaGalleryProps {
  onSelect?: (media: MediaFile) => void;
  selectable?: boolean;
  pageSize?: number;
  className?: string;
}

/**
 * Media gallery component with pagination and delete functionality
 * Can be used standalone or as a media picker
 */
export function MediaGallery({
  onSelect,
  selectable = false,
  pageSize = 12,
  className,
}: MediaGalleryProps) {
  const [currentPage, setCurrentPage] = useState(0);

  const { data, isLoading, error } = useMediaList({
    page: currentPage,
    size: pageSize,
    sort: "CREATED_AT",
    direction: "DESC",
  });

  const deleteMutation = useMediaDelete({
    onSuccess: () => {
      toast.success("Media file deleted successfully");
    },
    onError: (error) => {
      toast.error(error.detail || "Failed to delete media file");
    },
  });

  const handleDelete = (mediaId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this media file?")) {
      deleteMutation.mutate(mediaId);
    }
  };

  const handleSelect = (media: MediaFile) => {
    if (selectable && onSelect) {
      onSelect(media);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-red-600">Failed to load media files</p>
      </div>
    );
  }

  if (!data?.content.length) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 text-gray-400">
        <ImageIcon className="h-12 w-12" aria-hidden="true" />
        <p className="text-sm">No media files uploaded yet</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Gallery Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {data.content.map((media) => (
          <div
            key={media.id}
            role={selectable ? "button" : undefined}
            tabIndex={selectable ? 0 : undefined}
            onClick={() => handleSelect(media)}
            onKeyDown={(e) => {
              if (selectable && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                handleSelect(media);
              }
            }}
            className={`group relative overflow-hidden rounded-lg border border-gray-200 transition-all ${
              selectable
                ? "cursor-pointer hover:border-primary hover:shadow-md"
                : ""
            }`}
            aria-label={
              selectable
                ? `Select ${media.filename}`
                : `Media file ${media.filename}`
            }
          >
            {/* Image */}
            <div className="aspect-square">
              <img
                src={media.url}
                alt={media.filename}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>

            {/* Overlay with info */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
              <p className="truncate text-xs font-medium text-white">
                {media.filename}
              </p>
              <p className="text-xs text-gray-300">
                {formatFileSize(media.sizeBytes)}
              </p>
            </div>

            {/* Delete Button */}
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={(e) => handleDelete(media.id, e)}
              disabled={deleteMutation.isPending}
              className="absolute right-2 top-2 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
              aria-label={`Delete ${media.filename}`}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
          >
            Previous
          </Button>

          <span className="text-sm text-gray-600">
            Page {currentPage + 1} of {data.totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((p) => Math.min(data.totalPages - 1, p + 1))
            }
            disabled={currentPage === data.totalPages - 1}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
