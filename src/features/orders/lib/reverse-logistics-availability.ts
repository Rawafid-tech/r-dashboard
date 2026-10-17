import type { ExchangePreview } from "@/features/exchanges/types";
import type { ReturnPreview } from "@/features/returns/types";

export function isReturnActionAvailable(
  preview: ReturnPreview | undefined,
): boolean {
  if (!preview) return false;
  if (preview.existingReturn) return false;
  if (!preview.bookable) return false;
  return preview.connections.length > 0;
}

export function isExchangeActionAvailable(
  preview: ExchangePreview | undefined,
): boolean {
  if (!preview) return false;
  if (preview.existingReturn) return false;
  if (!preview.bookable) return false;
  return preview.connections.length > 0;
}
