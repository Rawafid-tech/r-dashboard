import type {
  BulkPreviewLineRequest,
  ShipmentPreviewParams,
  ShipmentDistrictsParams,
  ShipmentsListParams,
} from "@/features/shipments/types";

export const shipmentKeys = {
  all: ["shipments"] as const,
  lists: () => [...shipmentKeys.all, "list"] as const,
  list: (params: ShipmentsListParams) =>
    [...shipmentKeys.lists(), params] as const,
  counts: () => [...shipmentKeys.all, "counts"] as const,
  details: () => [...shipmentKeys.all, "detail"] as const,
  detail: (id: string) => [...shipmentKeys.details(), id] as const,
  previews: () => [...shipmentKeys.all, "preview"] as const,
  preview: (params: ShipmentPreviewParams) =>
    [...shipmentKeys.previews(), params] as const,
  bulkPreviews: () => [...shipmentKeys.all, "bulk-preview"] as const,
  bulkPreview: (lines: BulkPreviewLineRequest[]) =>
    [...shipmentKeys.bulkPreviews(), lines] as const,
  districts: () => [...shipmentKeys.all, "districts"] as const,
  districtSearch: (params: ShipmentDistrictsParams) =>
    [...shipmentKeys.districts(), params] as const,
};
