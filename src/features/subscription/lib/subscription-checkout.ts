import type { BillingPeriod } from "@/shared/types/enums";
import type {
  PlanTier,
  PublicPlan,
  Subscription,
} from "@/features/subscription/types";

export function getTierPrice(
  tier: PlanTier,
  billingPeriod: BillingPeriod,
): number {
  return billingPeriod === "MONTHLY" ? tier.monthlyPrice : tier.yearlyPrice;
}

export function isCurrentSubscriptionDeal(
  subscription: Subscription | undefined,
  planCode: string,
  shipmentsPerMonth: number,
  billingPeriod: BillingPeriod,
): boolean {
  if (!subscription) return false;

  return (
    subscription.planCode.toUpperCase() === planCode.toUpperCase() &&
    subscription.shipmentsPerMonth === shipmentsPerMonth &&
    subscription.billingPeriod === billingPeriod
  );
}

export function canAffordTier(
  balance: number,
  tier: PlanTier,
  billingPeriod: BillingPeriod,
): boolean {
  const price = getTierPrice(tier, billingPeriod);
  return balance >= price;
}

export function getBalanceAfterCheckout(
  balance: number,
  price: number,
): number {
  return Math.round((balance - price) * 100) / 100;
}

export function isPlanChange(
  subscription: Subscription | undefined,
  planCode: string,
  shipmentsPerMonth: number,
  billingPeriod: BillingPeriod,
): boolean {
  if (!subscription) return false;
  return !isCurrentSubscriptionDeal(
    subscription,
    planCode,
    shipmentsPerMonth,
    billingPeriod,
  );
}

export function isPaidPlanChange(
  subscription: Subscription | undefined,
  planCode: string,
  shipmentsPerMonth: number,
  billingPeriod: BillingPeriod,
): boolean {
  if (!subscription) return false;
  if (subscription.planCode === "FREE") return false;
  return isPlanChange(subscription, planCode, shipmentsPerMonth, billingPeriod);
}

export function sortPublicPlans(plans: PublicPlan[]): PublicPlan[] {
  const order = ["FREE", "LAUNCH", "BUSINESS"];

  const rank = (plan: PublicPlan) => {
    const index = order.indexOf(plan.code);
    if (index !== -1) return index;
    if (plan.customPricing) return order.length + 1000;
    return order.length;
  };

  const minMonthly = (plan: PublicPlan) =>
    plan.tiers.reduce(
      (min, tier) => Math.min(min, tier.monthlyPrice),
      Number.POSITIVE_INFINITY,
    );

  return [...plans].sort((left, right) => {
    const leftRank = rank(left);
    const rightRank = rank(right);
    if (leftRank !== rightRank) return leftRank - rightRank;
    return minMonthly(left) - minMonthly(right);
  });
}
