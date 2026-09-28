export const ORDER_STATUS_VALUES = ["PENDING", "CANCELLED"] as const;
export type OrderStatus = (typeof ORDER_STATUS_VALUES)[number];

export const ORDER_PAYMENT_METHOD_VALUES = ["COD", "PREPAID"] as const;
export type OrderPaymentMethod = (typeof ORDER_PAYMENT_METHOD_VALUES)[number];

export type OrdersSortField = "ORDER_DATE" | "CREATED_AT" | "ORDER_VALUE";

export type OrdersListTab = "all" | "PENDING" | "CANCELLED";

export interface OrdersListParams {
  page?: number;
  size?: number;
  sort?: OrdersSortField;
  direction?: "ASC" | "DESC";
  status?: OrderStatus;
  search?: string;
  governorateId?: string;
  senderLocationId?: string;
  paymentMethod?: OrderPaymentMethod;
  from?: string;
  to?: string;
  minValue?: number;
  maxValue?: number;
}

export type OrderCounts = Record<OrderStatus, number>;

export interface OrderGovernorateRef {
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
}

export interface OrderSenderLocationRef {
  id: string;
  name: string;
}

export interface OrderReceiver {
  firstName: string;
  lastName: string | null;
  phone: string;
  altPhone: string | null;
  email: string | null;
}

export interface OrderAddress {
  countryCode: string;
  governorate: OrderGovernorateRef;
  area: string;
  addressLine: string;
  street: string | null;
  buildingNumber: string | null;
  floor: string | null;
  apartment: string | null;
  landmark: string | null;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface OrderPayment {
  method: OrderPaymentMethod;
  currency: string;
  orderValue: number;
  codAmount: number | null;
}

export interface OrderItem {
  name: string;
  sku: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderPackage {
  boxName: string | null;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  weightKg: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  source: string;
  orderDate: string;
  senderLocation: OrderSenderLocationRef;
  receiver: OrderReceiver;
  address: OrderAddress;
  payment: OrderPayment;
  invoiceNumber: string | null;
  description: string | null;
  deliveryNotes: string | null;
  items: OrderItem[];
  itemsTotal: number;
  packages: OrderPackage[];
  totalWeightKg: number;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderListRow {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  orderDate: string;
  senderLocation: OrderSenderLocationRef;
  receiverName: string;
  receiverPhone: string;
  governorate: OrderGovernorateRef;
  area: string;
  paymentMethod: OrderPaymentMethod;
  currency: string;
  orderValue: number;
  codAmount: number | null;
  totalWeightKg: number;
  createdAt: string;
}

export interface OrderReceiverPayload {
  firstName: string;
  lastName?: string;
  phone: string;
  altPhone?: string;
  email?: string;
}

export interface OrderAddressPayload {
  countryCode: string;
  governorateId: string;
  area: string;
  addressLine: string;
  street?: string;
  buildingNumber?: string;
  floor?: string;
  apartment?: string;
  landmark?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
}

export interface OrderPaymentPayload {
  method: OrderPaymentMethod;
  orderValue: number;
  currency?: string;
  codAmount?: number;
}

export interface OrderItemPayload {
  name: string;
  sku?: string;
  unitPrice: number;
  quantity: number;
}

export interface OrderPackagePayload {
  boxName?: string;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  weightKg: number;
}

export interface OrderPayload {
  orderNumber?: string;
  orderDate?: string;
  senderLocationId?: string;
  receiver: OrderReceiverPayload;
  address: OrderAddressPayload;
  payment: OrderPaymentPayload;
  invoiceNumber?: string;
  description?: string;
  deliveryNotes?: string;
  items?: OrderItemPayload[];
  packages: OrderPackagePayload[];
}
