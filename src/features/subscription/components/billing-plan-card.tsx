import { Mail } from "lucide-react";
import { useId, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui";
import { SUPPORT_EMAIL } from "@/shared/lib/constants";
import { formatCurrency } from "@/shared/lib/formatters";
import {
  canAffordTier,
  getTierPrice,
  isCurrentSubscriptionDeal,
} from "@/features/subscription/lib/subscription-checkout";
import type {
  CheckoutSelection,
  PublicPlan,
  Subscription,
} from "@/features/subscription/types";
import type { BillingPeriod } from "@/shared/types/enums";
import { cn } from "@/shared/lib/utils";

interface BillingPlanCardProps {
  plan: PublicPlan;
  subscription?: Subscription;
  walletBalance: number;
  currency: string;
  intlLocale: string;
  billingPeriod: BillingPeriod;
  isOwner: boolean;
  isCheckoutPending: boolean;
  onSelectPlan: (selection: CheckoutSelection) => void;
}

export function BillingPlanCard({
  plan,
  subscription,
  walletBalance,
  currency,
  intlLocale,
  billingPeriod,
  isOwner,
  isCheckoutPending,
  onSelectPlan,
}: BillingPlanCardProps) {
  const { t } = useTranslation("billing");
  const formId = useId();

  const defaultTier = plan.tiers[0];
  const [shipmentsPerMonth, setShipmentsPerMonth] = useState(
    String(defaultTier?.shipmentsPerMonth ?? ""),
  );

  const selectedTier = useMemo(
    () =>
      plan.tiers.find(
        (tier) => String(tier.shipmentsPerMonth) === shipmentsPerMonth,
      ),
    [plan.tiers, shipmentsPerMonth],
  );

  const price = selectedTier ? getTierPrice(selectedTier, billingPeriod) : 0;
  const isFree = plan.code === "FREE";

  const isCurrent = selectedTier
    ? isCurrentSubscriptionDeal(
        subscription,
        plan.code,
        selectedTier.shipmentsPerMonth,
        billingPeriod,
      )
    : false;

  const canAfford = selectedTier
    ? canAffordTier(walletBalance, selectedTier, billingPeriod)
    : true;

  const insufficientBalance = !isFree && !canAfford;
  const isHighlighted = plan.highlighted && !isCurrent;

  const mailHref = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
    t("upgrade.mailSubject"),
  )}&body=${encodeURIComponent(t("upgrade.mailBody"))}`;

  const handleSubscribe = () => {
    if (!selectedTier) return;
    onSelectPlan({
      planCode: plan.code,
      planName: plan.name,
      shipmentsPerMonth: selectedTier.shipmentsPerMonth,
      billingPeriod,
      price,
    });
  };

  const priceSuffix =
    billingPeriod === "MONTHLY" ? t("plans.perMonth") : t("plans.perYear");

  const formattedShipments =
    selectedTier && selectedTier.shipmentsPerMonth >= 999999
      ? t("plans.unlimited")
      : selectedTier
        ? selectedTier.shipmentsPerMonth.toLocaleString(intlLocale)
        : "—";

  return (
    <Card
      className={cn(
        "relative flex flex-col overflow-hidden text-start transition-shadow",
        isCurrent &&
          "border-primary/40 bg-primary/[0.03] ring-1 ring-primary/20",
        isHighlighted && !isCurrent && "border-border shadow-sm",
      )}
    >
      {/* Colored top accent for highlighted/recommended plans */}
      {isHighlighted ? (
        <div
          className="absolute inset-x-0 top-0 h-0.5 bg-primary"
          aria-hidden="true"
        />
      ) : null}

      {/* ── Header ─────────────────────────────────────── */}
      <CardHeader className="pb-3 pt-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="text-base font-semibold leading-snug">
            {plan.name}
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {isCurrent ? (
              <Badge variant="success">{t("plans.currentBadge")}</Badge>
            ) : null}
            {isHighlighted ? (
              <Badge>{t("plans.recommended")}</Badge>
            ) : null}
          </div>
        </div>

        {plan.description ? (
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {plan.description}
          </p>
        ) : null}
      </CardHeader>

      {/* ── Price ──────────────────────────────────────── */}
      <CardContent className="flex-1 space-y-4 pb-4">
        <div>
          {isFree ? (
            <p className="text-3xl font-bold">{t("plan.freePrice")}</p>
          ) : plan.customPricing ? (
            <p className="text-xl font-semibold text-muted-foreground">
              {t("plans.customPricingHint")}
            </p>
          ) : (
            <div dir="ltr" className="flex items-end gap-1.5">
              <span className="text-3xl font-bold tabular-nums">
                {formatCurrency(price, currency, intlLocale)}
              </span>
              <span className="mb-1 text-sm text-muted-foreground">
                {priceSuffix}
              </span>
            </div>
          )}
        </div>

        {/* Tier / Shipments */}
        {!plan.customPricing ? (
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground">
              {t("plans.shipmentsLabel")}
            </p>

            {plan.tiers.length > 1 ? (
              <Select
                value={shipmentsPerMonth}
                onValueChange={setShipmentsPerMonth}
                disabled={!isOwner || isCheckoutPending}
              >
                <SelectTrigger
                  id={`${formId}-tier`}
                  className="w-full"
                  aria-label={t("plans.shipmentsLabel")}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" align="start">
                  {plan.tiers.map((tier) => (
                    <SelectItem
                      key={tier.shipmentsPerMonth}
                      value={String(tier.shipmentsPerMonth)}
                    >
                      {tier.shipmentsPerMonth >= 999999
                        ? t("plans.unlimited")
                        : tier.shipmentsPerMonth.toLocaleString(intlLocale)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm font-medium tabular-nums" dir="ltr">
                {formattedShipments}
              </p>
            )}
          </div>
        ) : null}

        {/* Insufficient balance warning */}
        {insufficientBalance && isOwner ? (
          <p className="text-xs text-destructive">
            {t("wallet.insufficientHint")}
          </p>
        ) : null}
      </CardContent>

      {/* ── CTA ─────────────────────────────────────────── */}
      <CardFooter className="pt-0">
        {plan.customPricing ? (
          <Button type="button" variant="outline" fullWidth asChild>
            <a href={mailHref}>
              <Mail aria-hidden="true" />
              {t("plans.contactUs")}
            </a>
          </Button>
        ) : !isOwner ? (
          <Button type="button" variant="outline" fullWidth disabled>
            {t("plans.subscribe")}
          </Button>
        ) : isCurrent ? (
          <Button type="button" variant="secondary" fullWidth disabled>
            {t("plans.currentPlan")}
          </Button>
        ) : (
          <Button
            type="button"
            variant={isHighlighted ? "default" : "outline"}
            fullWidth
            onClick={handleSubscribe}
            disabled={!selectedTier || isCheckoutPending || insufficientBalance}
            aria-busy={isCheckoutPending}
          >
            {subscription?.planCode === "FREE" && !isFree
              ? t("plans.subscribe")
              : t("plans.changePlan")}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
