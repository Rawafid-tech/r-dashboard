import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components/ui";
import { formatCurrency, formatDate } from "@/shared/lib/formatters";
import type { Subscription } from "@/features/subscription/types";
import type { DateFormat } from "@/shared/types/enums";
import { SUPPORT_EMAIL } from "@/shared/lib/constants";
import { cn } from "@/shared/lib/utils";

interface BillingGraceBannerProps {
  subscription: Subscription;
  currency?: string;
  dateFormat?: DateFormat;
  intlLocale: string;
  className?: string;
}

export function BillingGraceBanner({
  subscription,
  currency = "EGP",
  dateFormat = "DD_MM_YYYY",
  intlLocale,
  className,
}: BillingGraceBannerProps) {
  const { t } = useTranslation("billing");

  if (!subscription.graceUntil) return null;

  const formattedPrice = formatCurrency(
    subscription.price,
    currency,
    intlLocale,
  );
  const formattedDeadline = formatDate(
    subscription.graceUntil,
    dateFormat,
  );

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-warning/30 bg-warning/5 p-4 text-start sm:flex-row sm:items-start sm:gap-4",
        className,
      )}
      role="alert"
      aria-live="polite"
    >
      <AlertTriangle
        className="size-5 shrink-0 text-warning"
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-sm font-semibold">{t("grace.title")}</p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {t("grace.description", {
            planName: subscription.planName,
            price: formattedPrice,
          })}
        </p>
        <p className="text-sm text-muted-foreground">
          {t("grace.deadline", { date: formattedDeadline })}
        </p>
        <p className="text-xs text-muted-foreground">
          {t("grace.ownerEmailNote")}
        </p>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="shrink-0 self-start sm:self-center"
        asChild
      >
        <a href={`mailto:${SUPPORT_EMAIL}`}>{t("grace.contactSupport")}</a>
      </Button>
    </div>
  );
}
