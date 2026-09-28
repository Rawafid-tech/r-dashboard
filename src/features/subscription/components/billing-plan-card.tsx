import { AlertCircle, Check, Mail, Package, Sparkles } from "lucide-react";
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
  Separator,
} from "@/shared/components/ui";
import { SUPPORT_EMAIL } from "@/shared/lib/constants";
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

function PlanPriceDisplay({
  price,
  currency,
  intlLocale,
  priceSuffix,
  isFree,
}: {
  price: number;
  currency: string;
  intlLocale: string;
  priceSuffix: string;
  isFree: boolean;
}) {
  const parts = useMemo(() => {
    const hasDecimals = price % 1 !== 0;
    return new Intl.NumberFormat(intlLocale, {
      style: "currency",
      currency,
      minimumFractionDigits: hasDecimals ? 2 : 0,
      maximumFractionDigits: hasDecimals ? 2 : 0,
    }).formatToParts(price);
  }, [price, currency, intlLocale]);

  return (
    <div className="flex flex-wrap items-baseline gap-1.5">
      {parts.map((part, index) => {
        if (part.type === "currency") {
          return (
            <span
              key={index}
              className="self-baseline text-sm font-semibold text-muted-foreground"
            >
              {part.value}
            </span>
          );
        }
        if (part.type === "literal") {
          return (
            <span
              key={index}
              className="self-baseline text-sm text-muted-foreground"
            >
              {part.value}
            </span>
          );
        }
        return (
          <span
            key={index}
            className="text-3xl font-extrabold tracking-tight tabular-nums text-foreground"
          >
            {part.value}
          </span>
        );
      })}
      <span className="self-baseline text-xs font-medium text-muted-foreground">
        {priceSuffix}
      </span>
      {isFree ? (
        <span className="ms-2 inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
          مجاناً
        </span>
      ) : null}
    </div>
  );
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
        "relative flex h-full flex-col overflow-hidden rounded-2xl border text-start transition-all duration-200",
        isCurrent
          ? "border-emerald-500/40 bg-gradient-to-b from-emerald-500/[0.04] via-card to-card ring-1 ring-emerald-500/20 shadow-sm"
          : isHighlighted
            ? "border-primary/50 bg-gradient-to-b from-primary/[0.06] via-card to-card ring-1 ring-primary/25 shadow-lg shadow-primary/5"
            : "border-border/70 bg-card/60 hover:border-border hover:shadow-md",
      )}
    >
      {/* Top accent bar for highlighted plan */}
      {isHighlighted ? (
        <div
          className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50"
          aria-hidden="true"
        />
      ) : null}

      {/* ── Header ─────────────────────────────────────── */}
      <CardHeader className="pb-3 pt-6 px-6">
        <div className="flex min-h-7 items-center justify-between gap-2">
          <h3 className="text-lg font-bold leading-snug tracking-tight text-foreground">
            {plan.name}
          </h3>
          <div className="flex shrink-0 flex-wrap gap-1.5">
            {isCurrent ? (
              <Badge
                variant="success"
                className="gap-1 text-[11px] font-medium"
              >
                <Check className="size-3" aria-hidden="true" />
                {t("plans.currentBadge")}
              </Badge>
            ) : null}
            {isHighlighted ? (
              <Badge className="gap-1 bg-primary text-[11px] font-medium text-primary-foreground shadow-sm">
                <Sparkles className="size-3" aria-hidden="true" />
                {t("plans.recommended")}
              </Badge>
            ) : null}
          </div>
        </div>

        <p className="mt-1 line-clamp-2 min-h-[2.25rem] text-xs leading-relaxed text-muted-foreground">
          {plan.description || (isFree ? t("plans.freeHint") : "\u00A0")}
        </p>
      </CardHeader>

      {/* ── Price ──────────────────────────────────────── */}
      <CardContent className="flex flex-1 flex-col space-y-4 px-6 pb-5 pt-0">
        <div className="min-h-[2.5rem]">
          {plan.customPricing ? (
            <p className="text-xl font-semibold text-muted-foreground">
              {t("plans.customPricingHint")}
            </p>
          ) : (
            <PlanPriceDisplay
              price={price}
              currency={currency}
              intlLocale={intlLocale}
              priceSuffix={priceSuffix}
              isFree={isFree}
            />
          )}
        </div>

        <Separator className="opacity-40" />

        {/* Tier / Capacity Box */}
        {!plan.customPricing ? (
          <div className="space-y-2 rounded-xl border border-border/60 bg-muted/20 p-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 font-medium text-foreground/80">
                <Package className="size-3.5 text-primary" aria-hidden="true" />
                {t("plans.shipmentsLabel")}
              </span>
              {plan.tiers.length > 1 ? (
                <span className="text-[11px] font-normal text-muted-foreground/80">
                  {plan.tiers.length} خيارات
                </span>
              ) : null}
            </div>

            {plan.tiers.length > 1 ? (
              <Select
                value={shipmentsPerMonth}
                onValueChange={setShipmentsPerMonth}
                disabled={!isOwner || isCheckoutPending}
              >
                <SelectTrigger
                  id={`${formId}-tier`}
                  className="h-10 w-full bg-background/80 font-medium"
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
                        : `${tier.shipmentsPerMonth.toLocaleString(intlLocale)} ${t("plans.shipmentUnit")}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex h-10 items-center justify-between rounded-lg border border-border/40 bg-background/50 px-3 text-sm">
                <span className="font-bold tabular-nums text-foreground">
                  {formattedShipments}
                </span>
                {selectedTier && selectedTier.shipmentsPerMonth < 999999 ? (
                  <span className="text-xs text-muted-foreground">
                    {t("plans.shipmentUnit")}
                  </span>
                ) : null}
              </div>
            )}
          </div>
        ) : null}

        {/* Features if available */}
        {plan.features && plan.features.length > 0 ? (
          <div className="space-y-1.5 pt-1">
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <Check
                    className="size-3.5 shrink-0 text-emerald-500"
                    aria-hidden="true"
                  />
                  <span className="font-medium text-foreground/90">
                    {feature.type === "UNLIMITED"
                      ? t("plans.unlimitedShipments")
                      : feature.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Insufficient balance warning */}
        {insufficientBalance && isOwner ? (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-2.5 text-xs text-destructive">
            <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
            <span>{t("wallet.insufficientHint")}</span>
          </div>
        ) : null}
      </CardContent>

      {/* ── CTA ─────────────────────────────────────────── */}
      <CardFooter className="mt-auto px-6 pb-6 pt-2">
        {plan.customPricing ? (
          <Button
            type="button"
            variant="outline"
            fullWidth
            asChild
            className="h-10 rounded-lg font-semibold"
          >
            <a href={mailHref}>
              <Mail className="me-1.5 size-4" aria-hidden="true" />
              {t("plans.contactUs")}
            </a>
          </Button>
        ) : !isOwner ? (
          <Button
            type="button"
            variant="outline"
            fullWidth
            disabled
            className="h-10 rounded-lg font-semibold"
          >
            {t("plans.subscribe")}
          </Button>
        ) : isCurrent ? (
          <Button
            type="button"
            variant="secondary"
            fullWidth
            disabled
            className="h-10 rounded-lg font-semibold"
          >
            <Check className="me-1.5 size-4 text-emerald-500" aria-hidden="true" />
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
            className={cn(
              "h-10 rounded-lg font-semibold",
              isHighlighted && "shadow-md hover:shadow-lg",
            )}
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
