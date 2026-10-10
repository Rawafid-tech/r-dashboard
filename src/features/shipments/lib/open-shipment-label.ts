const PDF_MIME = "application/pdf";

export function openPdfBlob(blob: Blob, _filename: string): boolean {
  if (typeof window === "undefined") return false;

  const pdfBlob =
    blob.type === PDF_MIME || blob.type === ""
      ? blob
      : new Blob([blob], { type: PDF_MIME });

  const url = URL.createObjectURL(pdfBlob);
  const opened = window.open(url, "_blank", "noopener,noreferrer");

  if (!opened) {
    URL.revokeObjectURL(url);
    return false;
  }

  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 60_000);

  return true;
}

export function downloadPdfBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function shipmentLabelFilename(trackingNumber: string | null): string {
  const slug = trackingNumber?.trim() || "shipment";
  return `label-${slug}.pdf`;
}
