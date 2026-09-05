import { useId, type ChangeEvent, type DragEvent } from "react";
import { FileSpreadsheet, Loader2, Upload } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SPREADSHEET_ACCEPT } from "@/features/products/lib/import-parse-sheet";
import { Button } from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";

interface ImportFileZoneProps {
  fileName: string | null;
  isParsing: boolean;
  compact?: boolean;
  disabled?: boolean;
  isDragging: boolean;
  onDraggingChange: (dragging: boolean) => void;
  onFile: (file: File) => void;
}

export function ImportFileZone({
  fileName,
  isParsing,
  compact = false,
  disabled = false,
  isDragging,
  onDraggingChange,
  onFile,
}: ImportFileZoneProps) {
  const { t } = useTranslation("products");
  const inputId = useId();
  const hintId = `${inputId}-hint`;
  const statusId = `${inputId}-status`;
  const busy = isParsing || disabled;

  function handleDragEnter(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (!busy) onDraggingChange(true);
  }

  function handleDragLeave(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    event.stopPropagation();
    onDraggingChange(false);
  }

  function handleDragOver(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    event.stopPropagation();
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    event.stopPropagation();
    onDraggingChange(false);
    if (busy) return;
    const file = event.dataTransfer.files[0];
    if (file) onFile(file);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file && !busy) onFile(file);
  }

  return (
    <div className="space-y-2">
      <input
        id={inputId}
        type="file"
        accept={SPREADSHEET_ACCEPT}
        className="sr-only"
        disabled={busy}
        onChange={handleChange}
        aria-describedby={compact ? statusId : `${hintId} ${statusId}`}
      />

      {compact && fileName ? (
        <div className="flex flex-col gap-3 rounded-xl border border-border/70 bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex min-w-0 items-center gap-2 text-sm text-foreground">
            {isParsing ? (
              <Loader2
                className="size-4 shrink-0 animate-spin text-primary"
                aria-hidden="true"
              />
            ) : (
              <FileSpreadsheet
                className="size-4 shrink-0 text-primary"
                aria-hidden="true"
              />
            )}
            <span className="truncate">
              {t("import.upload.fileName", { name: fileName })}
            </span>
          </p>
          <Button type="button" variant="outline" size="sm" disabled={busy} asChild>
            <label htmlFor={inputId} className="cursor-pointer">
              {isParsing
                ? t("import.upload.parsing")
                : t("import.upload.replaceFile")}
            </label>
          </Button>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-10 text-center transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border/80 bg-muted/15 hover:border-primary/40 hover:bg-muted/25",
            busy && "pointer-events-none opacity-60",
          )}
        >
          <span
            className="grid size-12 place-items-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15"
            aria-hidden="true"
          >
            {isParsing ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Upload className="size-5" />
            )}
          </span>
          <span className="text-sm font-medium text-foreground">
            {t("import.upload.dropLabel")}
          </span>
          <span id={hintId} className="max-w-sm text-sm text-muted-foreground">
            {isParsing ? t("import.upload.parsing") : t("import.upload.dropHint")}
          </span>
          <Button type="button" variant="outline" size="sm" disabled={busy} asChild>
            <span>{t("import.upload.chooseFile")}</span>
          </Button>
          <span className="text-xs text-muted-foreground">
            {t("import.upload.accepted")}
          </span>
        </label>
      )}

      <p id={statusId} className="sr-only" aria-live="polite">
        {fileName
          ? t("import.upload.fileName", { name: fileName })
          : t("import.upload.accepted")}
      </p>
    </div>
  );
}
