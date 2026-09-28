import type { FieldPath, UseFormSetError } from "react-hook-form";
import type { ZodError } from "zod";
import {
  normalizeNumericInput,
  type OrderFormValues,
} from "@/features/orders/schema";
import type { Order, OrderPayload } from "@/features/orders/types";
import {
  getFieldErrors,
  isApiError,
  parseApiError,
} from "@/shared/api/error-handler";

const DUPLICATE_ORDER_NUMBER_MARKERS = [
  "already have an order with this number",
  "لديك بالفعل طلب بهذا الرقم",
] as const;

const CONCURRENT_CHANGE_MARKERS = [
  "changed by someone else at the same time",
  "تم تغيير هذا الطلب من شخص آخر في نفس الوقت",
] as const;

const CANCELLED_EDIT_MARKERS = [
  "cancelled and can no longer be changed",
  "ملغى ولا يمكن تعديله",
] as const;

export function isDuplicateOrderNumberConflict(error: unknown): boolean {
  if (!isApiError(error, 409)) return false;
  const detail = parseApiError(error).detail;
  return DUPLICATE_ORDER_NUMBER_MARKERS.some((marker) => detail.includes(marker));
}

export function isConcurrentOrderChange(error: unknown): boolean {
  if (!isApiError(error, 409)) return false;
  const detail = parseApiError(error).detail;
  return CONCURRENT_CHANGE_MARKERS.some((marker) => detail.includes(marker));
}

export function isCancelledOrderEdit(error: unknown): boolean {
  if (!isApiError(error, 409)) return false;
  const detail = parseApiError(error).detail;
  return CANCELLED_EDIT_MARKERS.some((marker) => detail.includes(marker));
}

function trimOptional(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function trimRequired(value: string | undefined): string {
  return (value ?? "").trim();
}

function normalizePhone(value: string): string {
  return value.replace(/\s/g, "");
}

function roundNumber(value: string | undefined, places: number): number {
  const parsed = Number(normalizeNumericInput(value ?? ""));
  const factor = 10 ** places;
  return Math.round(parsed * factor) / factor;
}

export function toOrderPayload(values: OrderFormValues): OrderPayload {
  const paymentMethod = values.paymentMethod;
  const orderValue = roundNumber(values.orderValue, 2);

  const payment: OrderPayload["payment"] = {
    method: paymentMethod,
    orderValue,
    currency: "EGP",
  };

  if (paymentMethod === "COD") {
    const codRaw = values.codAmount?.trim();
    if (codRaw) {
      payment.codAmount = roundNumber(codRaw, 2);
    }
  }

  const items = (values.items ?? [])
    .filter((item) => trimRequired(item.name).length > 0)
    .map((item) => ({
      name: trimRequired(item.name),
      sku: trimOptional(item.sku),
      unitPrice: roundNumber(item.unitPrice, 2),
      quantity: Math.round(roundNumber(item.quantity, 0)),
    }));

  const packages = (values.packages ?? []).map((pkg) => ({
    boxName: trimOptional(pkg.boxName),
    lengthCm: roundNumber(pkg.lengthCm, 2),
    widthCm: roundNumber(pkg.widthCm, 2),
    heightCm: roundNumber(pkg.heightCm, 2),
    weightKg: roundNumber(pkg.weightKg, 3),
  }));

  const payload: OrderPayload = {
    receiver: {
      firstName: trimRequired(values.receiverFirstName),
      lastName: trimOptional(values.receiverLastName),
      phone: normalizePhone(trimRequired(values.receiverPhone)),
      altPhone: values.receiverAltPhone?.trim()
        ? normalizePhone(values.receiverAltPhone)
        : undefined,
      email: trimOptional(values.receiverEmail),
    },
    address: {
      countryCode: "EG",
      governorateId: trimRequired(values.governorateId),
      area: trimRequired(values.area),
      addressLine: trimRequired(values.addressLine),
      street: trimOptional(values.street),
      buildingNumber: trimOptional(values.buildingNumber),
      floor: trimOptional(values.floor),
      apartment: trimOptional(values.apartment),
      landmark: trimOptional(values.landmark),
      postalCode: trimOptional(values.postalCode),
    },
    payment,
    invoiceNumber: trimOptional(values.invoiceNumber),
    description: trimOptional(values.description),
    deliveryNotes: trimOptional(values.deliveryNotes),
    items: items.length > 0 ? items : undefined,
    packages,
  };

  const orderNumber = values.orderNumber?.trim();
  if (orderNumber) {
    payload.orderNumber = orderNumber;
  }

  const senderLocationId = values.senderLocationId?.trim();
  if (senderLocationId) {
    payload.senderLocationId = senderLocationId;
  }

  return payload;
}

export function toOrderFormValues(order: Order): OrderFormValues {
  return {
    orderNumber: order.orderNumber,
    senderLocationId: order.senderLocation.id,
    receiverFirstName: order.receiver.firstName,
    receiverLastName: order.receiver.lastName ?? "",
    receiverPhone: order.receiver.phone,
    receiverAltPhone: order.receiver.altPhone ?? "",
    receiverEmail: order.receiver.email ?? "",
    governorateId: order.address.governorate.id,
    area: order.address.area,
    addressLine: order.address.addressLine,
    street: order.address.street ?? "",
    buildingNumber: order.address.buildingNumber ?? "",
    floor: order.address.floor ?? "",
    apartment: order.address.apartment ?? "",
    landmark: order.address.landmark ?? "",
    postalCode: order.address.postalCode ?? "",
    paymentMethod: order.payment.method,
    orderValue: String(order.payment.orderValue),
    codAmount:
      order.payment.codAmount != null ? String(order.payment.codAmount) : "",
    invoiceNumber: order.invoiceNumber ?? "",
    description: order.description ?? "",
    deliveryNotes: order.deliveryNotes ?? "",
    items: order.items.map((item) => ({
      name: item.name,
      sku: item.sku ?? "",
      unitPrice: String(item.unitPrice),
      quantity: String(item.quantity),
    })),
    packages: order.packages.map((pkg) => ({
      boxName: pkg.boxName ?? "",
      lengthCm: String(pkg.lengthCm),
      widthCm: String(pkg.widthCm),
      heightCm: String(pkg.heightCm),
      weightKg: String(pkg.weightKg),
    })),
  };
}

const SERVER_FIELD_MAP: Record<string, keyof OrderFormValues | string> = {
  orderNumber: "orderNumber",
  senderLocationId: "senderLocationId",
  "receiver.firstName": "receiverFirstName",
  "receiver.lastName": "receiverLastName",
  "receiver.phone": "receiverPhone",
  "receiver.altPhone": "receiverAltPhone",
  "receiver.email": "receiverEmail",
  "address.governorateId": "governorateId",
  "address.area": "area",
  "address.addressLine": "addressLine",
  "address.street": "street",
  "address.buildingNumber": "buildingNumber",
  "address.floor": "floor",
  "address.apartment": "apartment",
  "address.landmark": "landmark",
  "address.postalCode": "postalCode",
  "payment.method": "paymentMethod",
  "payment.orderValue": "orderValue",
  "payment.codAmount": "codAmount",
  invoiceNumber: "invoiceNumber",
  description: "description",
  deliveryNotes: "deliveryNotes",
};

function mapServerFieldPath(path: string): string | null {
  if (path in SERVER_FIELD_MAP) {
    return SERVER_FIELD_MAP[path] as string;
  }

  const itemMatch = /^items\[(\d+)\]\.(\w+)$/.exec(path);
  if (itemMatch) {
    const index = itemMatch[1];
    const field = itemMatch[2];
    if (field === "name") return `items.${index}.name`;
    if (field === "sku") return `items.${index}.sku`;
    if (field === "unitPrice") return `items.${index}.unitPrice`;
    if (field === "quantity") return `items.${index}.quantity`;
  }

  const packageMatch = /^packages\[(\d+)\]\.(\w+)$/.exec(path);
  if (packageMatch) {
    const index = packageMatch[1];
    const field = packageMatch[2];
    if (field === "boxName") return `packages.${index}.boxName`;
    if (field === "lengthCm") return `packages.${index}.lengthCm`;
    if (field === "widthCm") return `packages.${index}.widthCm`;
    if (field === "heightCm") return `packages.${index}.heightCm`;
    if (field === "weightKg") return `packages.${index}.weightKg`;
  }

  return null;
}

export function summarizeZodIssues(error: ZodError): string {
  const messages = [
    ...new Set(error.issues.map((issue) => issue.message).filter(Boolean)),
  ];
  return messages.slice(0, 4).join("\n");
}

export function serverErrorOnStep1(error: unknown): boolean {
  const fieldErrors = getFieldErrors(error);
  if (!fieldErrors) return false;

  return Object.keys(fieldErrors).some(
    (name) => name.startsWith("receiver") || name.startsWith("address"),
  );
}

export function applyZodIssues(
  error: ZodError,
  setError: UseFormSetError<OrderFormValues>,
) {
  const seen = new Set<string>();

  for (const issue of error.issues) {
    const path = issue.path.map(String).join(".");
    if (!path || seen.has(path)) continue;
    seen.add(path);
    setError(path as FieldPath<OrderFormValues>, {
      type: "manual",
      message: issue.message,
    });
  }
}

export function applyOrderFieldErrors(
  error: unknown,
  setError: UseFormSetError<OrderFormValues>,
) {
  const fieldErrors = getFieldErrors(error);
  if (!fieldErrors) return;

  Object.entries(fieldErrors).forEach(([name, message]) => {
    const mapped = mapServerFieldPath(name);
    if (!mapped) return;
    setError(mapped as keyof OrderFormValues & string, {
      type: "server",
      message,
    });
  });
}

export function handleOrderFormError(
  error: unknown,
  setError: UseFormSetError<OrderFormValues>,
): string | null {
  applyOrderFieldErrors(error, setError);

  if (isDuplicateOrderNumberConflict(error)) {
    const detail = parseApiError(error).detail;
    setError("orderNumber", { type: "server", message: detail });
    return detail;
  }

  if (isCancelledOrderEdit(error) || isConcurrentOrderChange(error)) {
    return parseApiError(error).detail;
  }

  return parseApiError(error).detail;
}
