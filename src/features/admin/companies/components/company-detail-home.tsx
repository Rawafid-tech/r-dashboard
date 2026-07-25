import { useTranslation } from "react-i18next";
import { Navigate, useParams } from "react-router-dom";
import { useAdminMe } from "@/features/admin/auth/hooks/use-admin-me";
import { CompanyAssignSubscriptionPanel } from "@/features/admin/companies/components/company-assign-subscription-panel";
import { CompaniesErrorState } from "@/features/admin/companies/components/companies-error-state";
import { CompanyDetailHero } from "@/features/admin/companies/components/company-detail-hero";
import { CompanyDetailSkeleton } from "@/features/admin/companies/components/company-detail-skeleton";
import { CompanyProfileCard } from "@/features/admin/companies/components/company-profile-card";
import { CompanySubscriptionsSection } from "@/features/admin/companies/components/company-subscriptions-section";
import { CompanyTeamSection } from "@/features/admin/companies/components/company-team-section";
import { useAdminCompany } from "@/features/admin/companies/hooks/use-admin-company";
import { useAdminCompanySubscriptions } from "@/features/admin/companies/hooks/use-admin-company-subscriptions";
import { useAdminCompanyUsers } from "@/features/admin/companies/hooks/use-admin-company-users";
import { AdminRole } from "@/shared/types/enums";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function CompanyDetailHome() {
  const { t } = useTranslation("admin");
  const { companyId } = useParams<{ companyId: string }>();

  const companyQuery = useAdminCompany(companyId);
  const subscriptionsQuery = useAdminCompanySubscriptions(companyId);
  const usersQuery = useAdminCompanyUsers(companyId);
  const { data: admin } = useAdminMe();

  const canAssign = admin?.role === AdminRole.SUPER_ADMIN;
  const activeSubscription = subscriptionsQuery.data?.find(
    (subscription) => subscription.status === "ACTIVE",
  );

  if (!companyId || !UUID_PATTERN.test(companyId)) {
    return <Navigate to="/admin/companies" replace />;
  }

  const isInitialLoading = companyQuery.isLoading && !companyQuery.data;
  const isNotFound =
    companyQuery.isError &&
    (companyQuery.error as { response?: { status?: number } })?.response
      ?.status === 404;

  if (isNotFound) {
    return <Navigate to="/admin/companies" replace />;
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <a
        href="#company-detail-main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        {t("companies.detail.skipToContent")}
      </a>

      {isInitialLoading ? <CompanyDetailSkeleton /> : null}

      {companyQuery.isError && !isNotFound ? (
        <CompaniesErrorState
          onRetry={() => void companyQuery.refetch()}
          isRetrying={companyQuery.isFetching}
        />
      ) : null}

      {companyQuery.data ? (
        <div id="company-detail-main" className="space-y-6">
          <CompanyDetailHero company={companyQuery.data} />

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <CompanyProfileCard company={companyQuery.data} />
            <CompanyTeamSection
              users={usersQuery.data}
              isLoading={usersQuery.isLoading}
              isError={usersQuery.isError}
              onRetry={() => void usersQuery.refetch()}
            />
          </div>

          <CompanyAssignSubscriptionPanel
            company={companyQuery.data}
            activeSubscription={activeSubscription}
            canAssign={canAssign}
          />

          <CompanySubscriptionsSection
            subscriptions={subscriptionsQuery.data}
            isLoading={subscriptionsQuery.isLoading}
            isError={subscriptionsQuery.isError}
            onRetry={() => void subscriptionsQuery.refetch()}
          />
        </div>
      ) : null}
    </div>
  );
}
