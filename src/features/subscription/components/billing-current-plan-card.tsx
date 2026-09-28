import type { ReactNode } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, LayoutGrid } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  Label,
  Separator,
  Skeleton,
  Switch,
} from "@/shared/components/ui";
import { formatCurrency, formatDate } from "@/shared/lib/formatters";
import { useMerchantPermissions } from "@/shared/hooks/use-merchant-permissions";
import { usePatchAutoRenew } from "@/features/subscription/hooks/use-patch-auto-renew";
import { getSubscriptionPeriodContext } from "@/features/subscription/lib/subscription-period-label";
import { BillingCancelDialog } from "@/features/subscription/components/billing-cancel-dialog";
import type { Subscription } from "@/features/subscription/types";
import type { DateFormat } from "@/shared/types/enums";
import { useWallet } from "@/features/wallet/hooks/use-wallet";
import { useLocaleStore } from "@/stores/locale.store";
import { cn } from "@/shared/lib/utils";

interface BillingCurrentPlanCardProps {
  subscription: Subscription;
  currency?: string;
  dateFormat?: DateFormat;
  className?: string;
}

function Stat({
  label,
  children,
  dir,
  className,
}: {
  label: string;
  children: ReactNode;
  dir?: string;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className="mt-0.5 truncate text-sm font-semibold tabular-nums"
        dir={dir}
      >
        {children}
      </p>
    </div>
  );
}

export function BillingCurrentPlanCard({
  subscription,
  currency = "EGP",
  dateFormat = "DD_MM_YYYY",
  className,
}: BillingCurrentPlanCardProps) {
  const { t } = useTranslation("billing");
  const locale = useLocaleStore((state) => state.locale);
  const intlLocale = locale === "ar" ? "ar-EG" : "en-US";
  const { isOwner } = useMerchantPermissions();
  const patchMutation = usePatchAutoRenew();
  const walletQuery = useWallet();
  const [cancelOpen, setCancelOpen] = useState(false);

  const isFree = subscription.planCode === "FREE";
  const inGrace = subscription.graceUntil != null;
  const showAutoRenew = subscription.endsAt !== null;
  const periodContext = getSubscriptionPeriodContext(subscription);

  const formattedPeriodDate = periodContext.date
    ? formatDate(periodContext.date, dateFormat)
    : null;

  const priceLabel = formatCurrency(subscription.price, currency, intlLocale);

  const periodLine =
    periodContext.kind === "renewing"
      ? t("period.renewing", {
          date: formattedPeriodDate,
          price: priceLabel,
        })
      : periodContext.kind === "ending"
        ? t("period.ending", { date: formattedPeriodDate })
        : periodContext.kind === "grace"
          ? t("period.grace", { date: formattedPeriodDate })
          : t("period.open");

  const billingPeriodLabel = subscription.billingPeriod
    ? t(`billingPeriod.${subscription.billingPeriod}`)
    : t("plan.openEnded");

  const shipmentsLabel =
    subscription.shipmentsPerMonth >= 999999
      ? t("plans.unlimited")
      : subscription.shipmentsPerMonth.toLocaleString(intlLocale);

  const wallet = walletQuery.data;
  const balanceLabel = wallet
    ? formatCurrency(wallet.balance, wallet.currency, intlLocale)
    : null;

  const switchId = `auto-renew-${subscription.id}`;
  const busy = patchMutation.isPending;

  const handleAutoRenewChange = (checked: boolean) => {
    if (!isOwner || busy) return;
    if (!checked) {
      setCancelOpen(true);
      return;
    }
    void patchMutation.mutateAsync({ autoRenew: true });
  };

  return (
    <>
      <Card
        className={cn(
          "overflow-hidden border-primary/20 bg-gradient-to-br from-card via-card to-primary/5",
          className,
        )}
      >
        {/* ── Header ─────────────────────────────────────────────── */}
        <CardHeader className="flex flex-row flex-wrap items-start gap-4 border-b border-border/50 bg-muted/10 pb-4">
          <span
            className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15"
            aria-hidden="true"
          >
            <LayoutGrid className="size-5" />
          </span>

          <div className="min-w-0 flex-1 text-start">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold leading-snug">
                {subscription.planName}
              </h2>
              <Badge variant={inGrace ? "warning" : "success"}>
                {inGrace
                  ? t("plan.graceBadge")
                  : t(`subscriptionStatus.${subscription.status}`)}
              </Badge>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {periodLine}
            </p>
          </div>
        </CardHeader>

        {/* ── Stats + Wallet ──────────────────────────────────────── */}
        <CardContent className="pt-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {/* Shipments */}
            <Stat label={t("plan.shipments")}>
              <span>{shipmentsLabel}</span>
            </Stat>

            {/* Price */}
            <Stat label={t("plan.price")}>
              <span>
                {isFree ? t("plan.freePrice") : priceLabel}
              </span>
            </Stat>

            {/* Billing period */}
            <Stat label={t("plan.billingPeriod")}>{billingPeriodLabel}</Stat>

            {/* Wallet balance — links to /wallet */}
            <Link
              to="/wallet"
              className="group flex min-w-0 flex-col rounded-lg border border-primary/10 bg-primary/5 px-3 py-2.5 transition-colors hover:border-primary/25 hover:bg-primary/10"
              aria-label={t("wallet.viewWallet")}
            >
              <span className="flex items-center gap-1 text-xs text-primary">
                {t("wallet.title")}
                <ArrowUpRight
                  className="size-3 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </span>
              {walletQuery.isLoading ? (
                <Skeleton className="mt-1.5 h-4 w-24" />
              ) : (
                <span
                  className="mt-0.5 truncate text-sm font-semibold tabular-nums text-primary"
                >
                  {balanceLabel ?? "—"}
                </span>
              )}
            </Link>
          </div>

          {/* Auto-renew toggle */}
          {showAutoRenew ? (
            <>
              <Separator className="my-4" />
              <div className="flex items-center justify-between gap-4 text-start">
                <div className="min-w-0 flex-1">
                  <Label
                    htmlFor={switchId}
                    className="text-sm font-medium"
                  >
                    {t("autoRenew.title")}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {subscription.autoRenew
                      ? t("autoRenew.enabledLabel")
                      : t("autoRenew.disabledLabel")}
                  </p>
                  {!isOwner ? (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {t("autoRenew.ownerOnlyHint")}
                    </p>
                  ) : null}
                </div>
                <Switch
                  id={switchId}
                  checked={subscription.autoRenew}
                  onCheckedChange={handleAutoRenewChange}
                  disabled={!isOwner || busy}
                  aria-busy={busy}
                  className="shrink-0"
                />
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>

      <BillingCancelDialog
        subscription={subscription}
        dateFormat={dateFormat}
        open={cancelOpen}
        onOpenChange={setCancelOpen}
      />
    </>
  );
}
