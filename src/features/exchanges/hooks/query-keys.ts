import type { ExchangePreviewParams } from "@/features/exchanges/types";

export const exchangeKeys = {
  all: ["exchanges"] as const,
  previews: () => [...exchangeKeys.all, "preview"] as const,
  preview: (params: ExchangePreviewParams) =>
    [...exchangeKeys.previews(), params] as const,
};
