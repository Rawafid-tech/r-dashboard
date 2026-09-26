import { useTranslation } from "react-i18next";
import { useSettings } from "@/features/account/hooks/use-settings";
import { BillingErrorState } from "@/features/subscription/components/billing-error-state";
import { BillingGraceBanner } from "@/features/subscription/components/billing-grace-banner";
import { BillingHero } from "@/features/subscription/components/billing-hero";
import { BillingPageSkeleton } from "@/features/subscription/components/billing-page-skeleton";
import { BillingCurrentPlanCard } from "@/features/subscription/components/billing-current-plan-card";
import { BillingPlansSection } from "@/features/subscription/components/billing-plans-section";
import { useSubscription } from "@/features/subscription/hooks/use-subscription";
import { useLocaleStore } from "@/stores/locale.store";

export function BillingHome() {
  const { t } = useTranslation("billing");
  const subscriptionQuery = useSubscription();
  const settingsQuery = useSettings();
  const locale = useLocaleStore((state) => state.locale);
  const intlLocale = locale === "ar" ? "ar-EG" : "en-US";

  const isLoading =
    subscriptionQuery.isLoading ||
    (settingsQuery.isLoading && !settingsQuery.data);

  const isError = subscriptionQuery.isError;

  const refetchAll = () =>
    Promise.all([subscriptionQuery.refetch(), settingsQuery.refetch()]);

  const subscription = subscriptionQuery.data;
  const currency = settingsQuery.data?.currency;
  const dateFormat = settingsQuery.data?.dateFormat;

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
          <BillingHero />

          {isError ? (
            <BillingErrorState
              onRetry={() => void refetchAll()}
              isRetrying={subscriptionQuery.isFetching}
            />
          ) : null}

          {subscription && !isError ? (
            <div id="billing-main" className="space-y-6">
              {subscription.graceUntil ? (
                <BillingGraceBanner
                  subscription={subscription}
                  currency={currency}
                  dateFormat={dateFormat}
                  intlLocale={intlLocale}
                />
              ) : null}

              <section aria-labelledby="billing-current-plan-title">
                <h2 id="billing-current-plan-title" className="sr-only">
                  {t("layout.currentPlan")}
                </h2>
                <BillingCurrentPlanCard
                  subscription={subscription}
                  currency={currency}
                  dateFormat={dateFormat}
                />
              </section>

              <BillingPlansSection
                subscription={subscription}
                currency={currency}
                className="border-t border-border pt-6"
              />
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
