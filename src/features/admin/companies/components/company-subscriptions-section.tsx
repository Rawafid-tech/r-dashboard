import { History, Loader2 } from "lucide-react";
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
import { useLocaleStore } from "@/stores/locale.store";
import { cn } from "@/shared/lib/utils";

interface CompanySubscriptionsSectionProps {
  subscriptions?: Subscription[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
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

function SubscriptionTimelineItem({ subscription }: { subscription: Subscription }) {
  const { t } = useTranslation(["admin", "billing"]);
  const locale = useLocaleStore((state) => state.locale);
  const intlLocale = locale === "ar" ? "ar-EG" : "en-US";
  const isFree = subscription.planCode === "FREE";

  const billingLabel = subscription.billingPeriod
    ? t(`billing:billingPeriod.${subscription.billingPeriod}`)
    : t("billing:plan.openEnded");

  const periodSeparator = subscription.endsAt
    ? locale === "ar"
      ? "←"
      : "→"
    : "–";

  return (
    <li className="relative ps-6">
      <span
        className={cn(
          "absolute start-0 top-2 size-2.5 rounded-full ring-4 ring-background",
          subscription.status === "ACTIVE" ? "bg-success" : "bg-muted-foreground/50",
        )}
        aria-hidden="true"
      />
      <div className="rounded-xl border border-border/70 bg-card/40 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="font-semibold text-foreground">{subscription.planName}</p>
            <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
              <span dir="ltr" className="inline-block">
                {subscription.planCode}
              </span>
            </p>
          </div>
          <Badge variant={getStatusVariant(subscription.status)}>
            {t(`billing:subscriptionStatus.${subscription.status}`)}
          </Badge>
        </div>

        <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-xs text-muted-foreground">
              {t("companies.detail.subscriptions.shipments")}
            </dt>
            <dd className="mt-1 text-sm font-medium tabular-nums">
              <span dir="ltr" className="inline-block">
                {subscription.shipmentsPerMonth.toLocaleString(intlLocale)}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">
              {t("companies.detail.subscriptions.price")}
            </dt>
            <dd className="mt-1 text-sm font-medium tabular-nums">
              {isFree ? (
                t("billing:plan.freePrice")
              ) : (
                <span dir="ltr" className="inline-block">
                  {formatCurrency(subscription.price, "EGP", intlLocale)}
                </span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">
              {t("companies.detail.subscriptions.billingPeriod")}
            </dt>
            <dd className="mt-1 text-sm font-medium">{billingLabel}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">
              {t("companies.detail.subscriptions.period")}
            </dt>
            <dd className="mt-1 text-sm font-medium">
              <span dir="ltr" className="inline-block tabular-nums">
                {formatDate(subscription.startsAt)}
              </span>
              <span
                className="mx-1 text-muted-foreground"
                aria-hidden="true"
              >
                {periodSeparator}
              </span>
              {subscription.endsAt ? (
                <span dir="ltr" className="inline-block tabular-nums">
                  {formatDate(subscription.endsAt)}
                </span>
              ) : (
                <span>{t("billing:plan.openEnded")}</span>
              )}
            </dd>
          </div>
        </dl>
      </div>
    </li>
  );
}

export function CompanySubscriptionsSection({
  subscriptions,
  isLoading,
  isError,
  onRetry,
}: CompanySubscriptionsSectionProps) {
  const { t } = useTranslation("admin");

  return (
    <Card className="border-border/80">
      <CardHeader>
        <div className="flex items-start gap-3">
          <span
            className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/12"
            aria-hidden="true"
          >
            <History className="size-4" />
          </span>
          <div>
            <CardTitle>{t("companies.detail.subscriptions.title")}</CardTitle>
            <CardDescription>
              {t("companies.detail.subscriptions.subtitle")}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div
            className="flex items-center gap-2 text-sm text-muted-foreground"
            role="status"
            aria-live="polite"
          >
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            {t("companies.detail.subscriptions.loading")}
          </div>
        ) : null}

        {isError ? (
          <div role="alert" className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <p className="text-sm font-medium text-destructive">
              {t("companies.detail.subscriptions.error")}
            </p>
            <button
              type="button"
              className="mt-2 text-sm font-medium text-primary hover:underline"
              onClick={onRetry}
            >
              {t("companies.errors.retry")}
            </button>
          </div>
        ) : null}

        {!isLoading && !isError && subscriptions?.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("companies.detail.subscriptions.empty")}
          </p>
        ) : null}

        {!isLoading && !isError && subscriptions && subscriptions.length > 0 ? (
          <ol className="space-y-4 border-s border-border/70">
            {subscriptions.map((subscription) => (
              <SubscriptionTimelineItem
                key={subscription.id}
                subscription={subscription}
              />
            ))}
          </ol>
        ) : null}
      </CardContent>
    </Card>
  );
}
