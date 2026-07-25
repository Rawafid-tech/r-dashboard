import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { PlansCatalog } from "@/features/admin/plans/components/plans-catalog";
import { PlansEmptyState } from "@/features/admin/plans/components/plans-empty-state";
import { PlansErrorState } from "@/features/admin/plans/components/plans-error-state";
import { PlansHero } from "@/features/admin/plans/components/plans-hero";
import { PlansPageSkeleton } from "@/features/admin/plans/components/plans-page-skeleton";
import { PlansToolbar } from "@/features/admin/plans/components/plans-toolbar";
import { useAdminPlans } from "@/features/admin/plans/hooks/use-admin-plans";
import {
  readStatusFilter,
  type PlanStatusFilter,
} from "@/features/admin/plans/schema";
import { useAdminMe } from "@/features/admin/auth/hooks/use-admin-me";
import { AdminRole, PlanStatus } from "@/shared/types/enums";

export function PlansHome() {
  const { t } = useTranslation("admin");
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = readStatusFilter(searchParams.get("status"));
  const plansQuery = useAdminPlans();
  const { data: admin } = useAdminMe();

  const canManage = admin?.role === AdminRole.SUPER_ADMIN;

  const filteredPlans = useMemo(() => {
    const plans = plansQuery.data ?? [];

    const filtered =
      statusFilter === "ALL"
        ? plans
        : plans.filter((plan) => plan.status === statusFilter);

    return filtered.slice().sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return a.code.localeCompare(b.code);
    });
  }, [plansQuery.data, statusFilter]);

  const activeCount = useMemo(
    () =>
      (plansQuery.data ?? []).filter((plan) => plan.status === PlanStatus.ACTIVE)
        .length,
    [plansQuery.data],
  );

  const updateStatusFilter = useCallback(
    (value: PlanStatusFilter) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          if (value === "ALL") {
            next.delete("status");
          } else {
            next.set("status", value);
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const isInitialLoading = plansQuery.isLoading && !plansQuery.data;
  const hasFilter = statusFilter !== "ALL";

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <a
        href="#plans-main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        {t("plans.skipToContent")}
      </a>

      {isInitialLoading ? (
        <PlansPageSkeleton />
      ) : (
        <>
          <PlansHero
            totalPlans={plansQuery.data?.length}
            activeCount={activeCount}
            canManage={canManage}
          />

          {plansQuery.isError ? (
            <PlansErrorState
              onRetry={() => void plansQuery.refetch()}
              isRetrying={plansQuery.isFetching}
            />
          ) : null}

          {!plansQuery.isError ? (
            <div id="plans-main" className="space-y-4">
              <PlansToolbar
                statusFilter={statusFilter}
                onStatusFilterChange={updateStatusFilter}
                isFetching={plansQuery.isFetching}
              />

              {filteredPlans.length === 0 ? (
                <PlansEmptyState hasFilter={hasFilter} />
              ) : (
                <PlansCatalog plans={filteredPlans} />
              )}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
