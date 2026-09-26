import { isApiError, parseApiError } from "@/shared/api/error-handler";

export type SubscriptionErrorKey =
  | "alreadyOnPlan"
  | "changeInProgress"
  | "insufficientBalance"
  | "planNotFound"
  | "invalidTier"
  | "planNotAssignable"
  | "ownerOnly"
  | "generic";

const ALREADY_ON_PLAN_PATTERNS = [
  "already on this plan",
  "مشتركة في هذه الباقة",
];

const CHANGE_IN_PROGRESS_PATTERNS = [
  "change to this subscription was in progress",
  "Another change",
];

const INSUFFICIENT_BALANCE_PATTERNS = [
  "Insufficient wallet balance",
  "رصيد المحفظة غير كاف",
];

export function getSubscriptionErrorKey(error: unknown): SubscriptionErrorKey {
  if (isApiError(error, 403)) {
    return "ownerOnly";
  }

  if (isApiError(error, 409)) {
    const detail = parseApiError(error).detail.toLowerCase();

    if (
      ALREADY_ON_PLAN_PATTERNS.some((pattern) =>
        detail.includes(pattern.toLowerCase()),
      )
    ) {
      return "alreadyOnPlan";
    }

    if (
      CHANGE_IN_PROGRESS_PATTERNS.some((pattern) =>
        detail.includes(pattern.toLowerCase()),
      )
    ) {
      return "changeInProgress";
    }

    if (
      INSUFFICIENT_BALANCE_PATTERNS.some((pattern) =>
        detail.includes(pattern.toLowerCase()),
      )
    ) {
      return "insufficientBalance";
    }
  }

  if (isApiError(error, 404)) {
    return "planNotFound";
  }

  if (isApiError(error, 400)) {
    const detail = parseApiError(error).detail.toLowerCase();

    if (detail.includes("no tier")) {
      return "invalidTier";
    }

    if (detail.includes("cannot be assigned")) {
      return "planNotAssignable";
    }
  }

  return "generic";
}
