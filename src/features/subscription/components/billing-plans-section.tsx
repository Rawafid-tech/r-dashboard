import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components/ui";
import { useMerchantPermissions } from "@/shared/hooks/use-merchant-permissions";
import { useCreateSubscription } from "@/features/subscription/hooks/use-create-subscription";
import { usePublicPlans } from "@/features/subscription/hooks/use-public-plans";
import { sortPublicPlans } from "@/features/subscription/lib/subscription-checkout";
import type {
  CheckoutSelection,
  Subscription,
} from "@/features/subscription/types";
import { BillingCheckoutDialog } from "@/features/subscription/components/billing-checkout-dialog";
import { BillingPlanCard } from "@/features/subscription/components/billing-plan-card";
import { useWallet } from "@/features/wallet/hooks/use-wallet";
import { useLocaleStore } from "@/stores/locale.store";
import { BillingPeriod } from "@/shared/types/enums";
import { cn } from "@/shared/lib/utils";

interface BillingPlansSectionProps {
  subscription?: Subscription;
  currency?: string;
  className?: string;
}

export function BillingPlansSection({
  subscription,
  currency = "EGP",
  className,
}: BillingPlansSectionProps) {
  const { t } = useTranslation("billing");
  const { isOwner } = useMerchantPermissions();
  const plansQuery = usePublicPlans();
  const walletQuery = useWallet();
  const createMutation = useCreateSubscription();

  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>(
    BillingPeriod.MONTHLY,
  );
  const [checkoutSelection, setCheckoutSelection] =
    useState<CheckoutSelection | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const locale = useLocaleStore((state) => state.locale);
  const intlLocale = locale === "ar" ? "ar-EG" : "en-US";
  const walletBalance = walletQuery.data?.balance ?? 0;
  const walletCurrency = walletQuery.data?.currency ?? currency;
  const sortedPlans = sortPublicPlans(plansQuery.data ?? []);

  return (
    <section
      className={cn("space-y-5 text-start", className)}
      aria-labelledby="billing-plans-heading"
    >
      {/* Section header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h2
            id="billing-plans-heading"
            className="text-base font-semibold"
          >
            {t("layout.changePlan")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("plans.sectionDescription")}
          </p>
        </div>

        {/* Period toggle */}
        <div
          className="inline-flex rounded-lg border border-border bg-muted/20 p-0.5"
          role="group"
          aria-label={t("plans.billingCycle")}
        >
          {Object.values(BillingPeriod).map((period) => {
            const active = billingPeriod === period;
            return (
              <Button
                key={period}
                type="button"
                size="sm"
                variant={active ? "secondary" : "ghost"}
                className="h-8 min-w-[5rem] rounded-md px-3"
                aria-pressed={active}
                onClick={() => setBillingPeriod(period)}
              >
                {t(`billingPeriod.${period}`)}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Staff note */}
      {!isOwner ? (
        <p
          className="rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground"
          role="note"
        >
          {t("plans.staffHint")}
        </p>
      ) : null}

      {/* Loading */}
      {plansQuery.isLoading ? (
        <div
          className="flex items-center gap-2 py-12 text-sm text-muted-foreground"
          role="status"
          aria-live="polite"
        >
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          {t("plans.loading")}
        </div>
      ) : null}

      {/* Error */}
      {plansQuery.isError ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3"
        >
          <p className="text-sm font-medium text-destructive">
            {t("plans.loadError")}
          </p>
          <button
            type="button"
            className="mt-1 text-sm font-medium text-primary hover:underline"
            onClick={() => void plansQuery.refetch()}
          >
            {t("plans.retry")}
          </button>
        </div>
      ) : null}

      {/* Plans grid */}
      {!plansQuery.isLoading && !plansQuery.isError && sortedPlans.length ? (
        <div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          role="list"
          aria-label={t("plans.sectionTitle")}
        >
          {sortedPlans.map((plan) => (
            <div key={plan.code} role="listitem">
              <BillingPlanCard
                plan={plan}
                subscription={subscription}
                walletBalance={walletBalance}
                currency={walletCurrency}
                intlLocale={intlLocale}
                billingPeriod={billingPeriod}
                isOwner={isOwner}
                isCheckoutPending={createMutation.isPending}
                onSelectPlan={(selection) => {
                  setCheckoutSelection(selection);
                  setCheckoutOpen(true);
                }}
              />
            </div>
          ))}
        </div>
      ) : null}

      {/* Footer note */}
      {!plansQuery.isLoading && !plansQuery.isError ? (
        <p className="text-xs text-muted-foreground">
          {t("notice.description")}
        </p>
      ) : null}

      <BillingCheckoutDialog
        selection={checkoutSelection}
        subscription={subscription}
        walletBalance={walletBalance}
        currency={walletCurrency}
        intlLocale={intlLocale}
        open={checkoutOpen}
        onOpenChange={(open) => {
          setCheckoutOpen(open);
          if (!open) setCheckoutSelection(null);
        }}
      />
    </section>
  );
}
