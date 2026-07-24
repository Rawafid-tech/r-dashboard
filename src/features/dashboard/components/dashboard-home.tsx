import { useTranslation } from "react-i18next";
import { AccountOverviewCard } from "@/features/dashboard/components/account-overview-card";
import { CompanyOverviewCard } from "@/features/dashboard/components/company-overview-card";
import {
  DashboardErrorState,
  DashboardHero,
} from "@/features/dashboard/components/dashboard-hero";
import {
  DashboardOverviewSkeleton,
  SubscriptionOverviewCard,
} from "@/features/dashboard/components/subscription-overview-card";
import { useDashboardData } from "@/features/dashboard/hooks/use-dashboard-data";

export function DashboardHome() {
  const { t } = useTranslation("dashboard");
  const { user, company, subscription, isLoading, isError, refetchAll } =
    useDashboardData();

  const companyLabel =
    company && user
      ? t("hero.companyLabel", {
          company: company.name,
          identifier: company.identifier,
        })
      : undefined;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <a
        href="#dashboard-main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        {t("skipToContent")}
      </a>

      <DashboardHero firstName={user?.firstName} companyLabel={companyLabel} />

      {isError ? (
        <DashboardErrorState onRetry={() => void refetchAll()} />
      ) : null}

      <section
        id="dashboard-main"
        aria-labelledby="dashboard-overview-title"
        className="space-y-4"
      >
        <div>
          <h2 id="dashboard-overview-title" className="text-lg font-semibold">
            {t("overview.title")}
          </h2>
          <p className="text-sm text-muted-foreground">{t("overview.subtitle")}</p>
        </div>

        {isLoading ? (
          <DashboardOverviewSkeleton />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <SubscriptionOverviewCard subscription={subscription} />
            <AccountOverviewCard user={user} />
            <CompanyOverviewCard company={company} />
          </div>
        )}
      </section>
    </div>
  );
}
