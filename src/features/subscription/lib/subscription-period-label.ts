import type { Subscription } from "@/features/subscription/types";

export type SubscriptionPeriodKind = "renewing" | "ending" | "grace" | "open";

export interface SubscriptionPeriodContext {
  kind: SubscriptionPeriodKind;
  date: string | null;
  daysRemaining: number | null;
}

function getDaysUntil(isoString: string): number {
  const target = new Date(isoString).getTime();
  const now = Date.now();
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

export function getSubscriptionPeriodContext(
  subscription: Subscription,
): SubscriptionPeriodContext {
  if (subscription.graceUntil) {
    return {
      kind: "grace",
      date: subscription.graceUntil,
      daysRemaining: getDaysUntil(subscription.graceUntil),
    };
  }

  if (!subscription.endsAt) {
    return {
      kind: "open",
      date: null,
      daysRemaining: null,
    };
  }

  if (subscription.autoRenew) {
    return {
      kind: "renewing",
      date: subscription.endsAt,
      daysRemaining: getDaysUntil(subscription.endsAt),
    };
  }

  return {
    kind: "ending",
    date: subscription.endsAt,
    daysRemaining: getDaysUntil(subscription.endsAt),
  };
}

export function isInGracePeriod(subscription: Subscription): boolean {
  return subscription.graceUntil != null;
}
