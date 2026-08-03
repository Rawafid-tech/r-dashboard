import { useRef, type ChangeEvent } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  getAcceptedFileTypes,
  validateMediaFile,
} from "@/features/media/lib/media-validation";
import type { MediaValidationError } from "@/features/media/lib/media-validation";

export interface MediaUploadButtonProps {
  onFileSelect: (file: File) => void;
  onValidationError?: (error: MediaValidationError) => void;
  disabled?: boolean;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  children?: React.ReactNode;
  className?: string;
}

/**
 * Button component for triggering media file selection
 * Validates file before passing to parent component
 */
export function MediaUploadButton({
  onFileSelect,
  onValidationError,
  disabled = false,
  variant = "outline",
  size = "default",
  children,
  className,
}: MediaUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    // Validate file
    const validationError = validateMediaFile(file);
    if (validationError) {
      onValidationError?.(validationError);
      // Reset input to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    if (file) {
      onFileSelect(file);
      // Reset input to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={handleButtonClick}
        disabled={disabled}
        className={className}
        aria-label="Upload image"
      >
        {children || (
          <>
            <Upload className="h-4 w-4" aria-hidden="true" />
            <span>Upload Image</span>
          </>
        )}
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept={getAcceptedFileTypes()}
        onChange={handleFileChange}
        className="sr-only"
        aria-label="Select image file"
        tabIndex={-1}
      />
    </>
  );
}
