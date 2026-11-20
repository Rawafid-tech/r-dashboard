const PDF_MIME = "application/pdf";

/**
 * Opens an empty tab while the click's user activation is still valid, so the
 * PDF can be shown in it after the (async) download without being blocked.
 * `noopener` is not passed because it makes `window.open` return null.
 */
export function reservePdfWindow(): Window | null {
  if (typeof window === "undefined") return null;

  const reserved = window.open("", "_blank");
  if (reserved) reserved.opener = null;
  return reserved;
}

export interface PdfWindowMessage {
  title: string;
  message: string;
  lang: string;
  dir: "ltr" | "rtl";
}

/**
 * Says what the reserved tab is waiting for, instead of a blank page: a print
 * of many labels can take a while for carriers that print one label per call.
 * Best effort — some browsers hand back a tab the page can't write to.
 */
export function writePdfWindowMessage(
  reserved: Window | null,
  { title, message, lang, dir }: PdfWindowMessage,
): void {
  if (!reserved || reserved.closed) return;
  try {
    const doc = reserved.document;
    doc.title = title;
    doc.documentElement.lang = lang;
    doc.documentElement.dir = dir;
    const paragraph = doc.createElement("p");
    paragraph.setAttribute("role", "status");
    paragraph.textContent = message;
    paragraph.style.cssText =
      "font: 16px/1.5 system-ui, sans-serif; margin: 2rem; color: #444;";
    doc.body.replaceChildren(paragraph);
  } catch {
    // The tab is still usable for the PDF; only the message is lost.
  }
}

/**
 * Shows the PDF in the reserved tab, or downloads it when no tab could be
 * opened. Returns false when it had to fall back to downloading.
 */
export function showPdfBlob(
  blob: Blob,
  filename: string,
  reserved: Window | null,
): boolean {
  if (!reserved || reserved.closed) {
    downloadPdfBlob(blob, filename);
    return false;
  }

  const pdfBlob =
    blob.type === PDF_MIME ? blob : new Blob([blob], { type: PDF_MIME });

  const url = URL.createObjectURL(pdfBlob);
  reserved.location.href = url;

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
  // Some browsers cancel the download if the URL is revoked immediately.
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export function shipmentLabelFilename(trackingNumber: string | null): string {
  const slug = trackingNumber?.trim() || "shipment";
  return `label-${slug}.pdf`;
}
