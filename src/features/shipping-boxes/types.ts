export type ShippingBoxesSortField =
  | "CREATED_AT"
  | "NAME"
  | "LENGTH_CM"
  | "WIDTH_CM"
  | "HEIGHT_CM";

export interface ShippingBoxesListParams {
  page?: number;
  size?: number;
  sort?: ShippingBoxesSortField;
  direction?: "ASC" | "DESC";
  search?: string;
  isDefault?: boolean;
}

export interface ShippingBox {
  id: string;
  name: string;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingBoxPayload {
  name: string;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  isDefault: boolean;
}
