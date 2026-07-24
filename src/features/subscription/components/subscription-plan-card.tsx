import type { LucideIcon } from "lucide-react";
import {
  CalendarClock,
  CircleDollarSign,
  Package,
  Repeat,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui";
import { formatCurrency, formatDate } from "@/shared/lib/formatters";
import type { Subscription } from "@/features/subscription/types";
import type { DateFormat } from "@/shared/types/enums";
import { useLocaleStore } from "@/stores/locale.store";
import { cn } from "@/shared/lib/utils";

interface SubscriptionPlanCardProps {
  subscription: Subscription;
  currency?: string;
  dateFormat?: DateFormat;
  className?: string;
}

function getStatusVariant(
  status: Subscription["status"],
): "success" | "destructive" | "muted" {
  switch (status) {
    case "ACTIVE":
      return "success";
    case "EXPIRED":
      return "destructive";
    default:
      return "muted";
  }
}

interface MetricTileProps {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
}

function MetricTile({ icon: Icon, label, value, hint }: MetricTileProps) {
  return (
    <div
      role="listitem"
      className="rounded-xl border border-border/60 bg-muted/20 p-4"
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4 shrink-0" aria-hidden="true" />
        <p className="text-xs font-medium">{label}</p>
      </div>
      <p className="mt-2 text-lg font-semibold tracking-tight">{value}</p>
      {hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function getDaysUntil(isoString: string): number {
  const target = new Date(isoString).getTime();
  const now = Date.now();
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

export function SubscriptionPlanCard({
  subscription,
  currency = "EGP",
  dateFormat = "DD_MM_YYYY",
  className,
}: SubscriptionPlanCardProps) {
  const { t } = useTranslation("billing");
  const locale = useLocaleStore((state) => state.locale);
  const intlLocale = locale === "ar" ? "ar-EG" : "en-US";

  const isFree = subscription.planCode === "FREE";
  const billingLabel = subscription.billingPeriod
    ? t(`billingPeriod.${subscription.billingPeriod}`)
    : t("plan.openEnded");

  const validityValue = subscription.endsAt
    ? formatDate(subscription.endsAt, dateFormat)
    : billingLabel;

  const validityHint =
    subscription.endsAt && !isFree
      ? t(
          getDaysUntil(subscription.endsAt) <= 30
            ? "plan.expiringSoon"
            : "plan.renewalHint",
          { date: validityValue },
        )
      : isFree
        ? t("plan.freeHint")
        : undefined;

  const priceValue = formatCurrency(
    subscription.price,
    currency,
    intlLocale,
  );

  return (
    <Card className={cn("border-border/80 shadow-sm", className)}>
      <CardHeader className="gap-4 border-b border-border/60 bg-muted/20 pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-xl sm:text-2xl">
              {subscription.planName}
            </CardTitle>
            <CardDescription className="font-mono text-xs uppercase tracking-wide">
              {subscription.planCode}
            </CardDescription>
          </div>
          <Badge variant={getStatusVariant(subscription.status)}>
            {t(`subscriptionStatus.${subscription.status}`)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          role="list"
          aria-label={t("plan.sectionTitle")}
        >
          <MetricTile
            icon={Package}
            label={t("plan.shipments")}
            value={subscription.shipmentsPerMonth.toLocaleString(intlLocale)}
            hint={t("plan.shipmentsHint")}
          />
          <MetricTile
            icon={CircleDollarSign}
            label={t("plan.price")}
            value={isFree ? t("plan.freePrice") : priceValue}
            hint={isFree ? undefined : t("plan.priceHint")}
          />
          <MetricTile
            icon={Repeat}
            label={t("plan.billingPeriod")}
            value={billingLabel}
          />
          <MetricTile
            icon={CalendarClock}
            label={isFree ? t("plan.validity") : t("plan.renewal")}
            value={validityValue}
            hint={validityHint}
          />
        </div>

        <dl className="mt-6 grid gap-3 border-t border-border/60 pt-6 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium text-muted-foreground">
              {t("plan.startedAt")}
            </dt>
            <dd className="mt-1 font-medium">
              {formatDate(subscription.startsAt, dateFormat)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-muted-foreground">
              {isFree ? t("plan.validUntil") : t("plan.endsAt")}
            </dt>
            <dd className="mt-1 font-medium">{validityValue}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
