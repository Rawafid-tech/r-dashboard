import { useTranslation } from "react-i18next";
import { useSettings } from "@/features/account/hooks/use-settings";
import { BillingErrorState } from "@/features/subscription/components/billing-error-state";
import { BillingHero } from "@/features/subscription/components/billing-hero";
import { BillingPageSkeleton } from "@/features/subscription/components/billing-page-skeleton";
import {
  BillingSnapshotNotice,
  BillingUpgradePanel,
} from "@/features/subscription/components/billing-upgrade-panel";
import { SubscriptionPlanCard } from "@/features/subscription/components/subscription-plan-card";
import { useSubscription } from "@/features/subscription/hooks/use-subscription";

export function BillingHome() {
  const { t } = useTranslation("billing");
  const subscriptionQuery = useSubscription();
  const settingsQuery = useSettings();

  const isLoading =
    subscriptionQuery.isLoading ||
    (settingsQuery.isLoading && !settingsQuery.data);

  const isError = subscriptionQuery.isError;

  const refetchAll = () =>
    Promise.all([subscriptionQuery.refetch(), settingsQuery.refetch()]);

  const subscription = subscriptionQuery.data;
  const isFree = subscription?.planCode === "FREE";

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <a
        href="#billing-main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        {t("skipToContent")}
      </a>

      {isLoading && !isError ? (
        <BillingPageSkeleton />
      ) : (
        <>
          <BillingHero planName={subscription?.planName} />

          {isError ? (
            <BillingErrorState
              onRetry={() => void refetchAll()}
              isRetrying={subscriptionQuery.isFetching}
            />
          ) : null}

          {subscription && !isError ? (
            <div id="billing-main" className="space-y-6">
              <section aria-labelledby="billing-plan-title">
                <h2 id="billing-plan-title" className="sr-only">
                  {t("plan.sectionTitle")}
                </h2>
                <SubscriptionPlanCard
                  subscription={subscription}
                  currency={settingsQuery.data?.currency}
                  dateFormat={settingsQuery.data?.dateFormat}
                />
              </section>

              <div className="grid gap-4 lg:grid-cols-2">
                <BillingUpgradePanel isFreePlan={isFree} />
                <BillingSnapshotNotice className="h-full lg:col-span-1" />
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
