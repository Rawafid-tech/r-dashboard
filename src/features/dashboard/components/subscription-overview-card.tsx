import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@/shared/components/ui";
import { formatCurrency, formatDate } from "@/shared/lib/formatters";
import { getSubscriptionPeriodContext } from "@/features/subscription/lib/subscription-period-label";
import type { Subscription } from "@/features/subscription/types";
import { useLocaleStore } from "@/stores/locale.store";

function OverviewCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-28" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
      </CardContent>
    </Card>
  );
}

export function DashboardOverviewSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <OverviewCardSkeleton />
      <OverviewCardSkeleton />
      <OverviewCardSkeleton />
    </div>
  );
}

interface SubscriptionOverviewCardProps {
  subscription?: Subscription;
}

export function SubscriptionOverviewCard({
  subscription,
}: SubscriptionOverviewCardProps) {
  const { t } = useTranslation("dashboard");
  const { t: tBilling } = useTranslation("billing");
  const locale = useLocaleStore((state) => state.locale);
  const intlLocale = locale === "ar" ? "ar-EG" : "en-US";

  const isFree = subscription?.planCode === "FREE";
  const billingLabel = subscription?.billingPeriod
    ? t(`billingPeriod.${subscription.billingPeriod}`)
    : t("cards.subscription.openEnded");

  const periodContext = subscription
    ? getSubscriptionPeriodContext(subscription)
    : null;

  const inGrace = periodContext?.kind === "grace";

  const renewalValue = (() => {
    if (!subscription || !periodContext) return "—";

    if (periodContext.kind === "open") {
      return billingLabel;
    }

    const formattedDate = periodContext.date
      ? formatDate(periodContext.date)
      : "—";

    if (periodContext.kind === "grace") {
      return tBilling("period.grace", { date: formattedDate });
    }

    if (periodContext.kind === "ending") {
      return tBilling("period.ending", { date: formattedDate });
    }

    const priceLabel = formatCurrency(
      subscription.price,
      "EGP",
      intlLocale,
    );
    return tBilling("period.renewing", {
      date: formattedDate,
      price: priceLabel,
    });
  })();

  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
        <CardTitle>{t("cards.subscription.title")}</CardTitle>
        {subscription ? (
          <div className="flex flex-wrap gap-1.5">
            <Badge variant={inGrace ? "warning" : "success"}>
              {t(`subscriptionStatus.${subscription.status}`)}
            </Badge>
            {inGrace ? (
              <Badge variant="warning">{tBilling("plan.graceBadge")}</Badge>
            ) : null}
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-xs text-muted-foreground">
            {t("cards.subscription.plan")}
          </p>
          <p className="text-lg font-semibold">
            {subscription?.planName ?? "—"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-muted-foreground">
              {t("cards.subscription.shipments")}
            </p>
            <p className="font-medium">
              {subscription?.shipmentsPerMonth?.toLocaleString(locale) ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              {t("cards.subscription.price")}
            </p>
            <p className="font-medium" dir="ltr">
              {subscription
                ? formatCurrency(
                    subscription.price,
                    "EGP",
                    intlLocale,
                  )
                : "—"}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground">
            {inGrace
              ? tBilling("plan.graceBadge")
              : isFree
                ? t("cards.subscription.validity")
                : t("cards.subscription.renewal")}
          </p>
          <p className="font-medium">{renewalValue}</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button type="button" fullWidth asChild>
          <Link to="/billing">{t("cards.subscription.viewBillingCta")}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
