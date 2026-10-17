import type { ReturnPreviewParams } from "@/features/returns/types";

export const returnKeys = {
  all: ["returns"] as const,
  previews: () => [...returnKeys.all, "preview"] as const,
  preview: (params: ReturnPreviewParams) =>
    [...returnKeys.previews(), params] as const,
};
