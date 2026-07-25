import { useTranslation } from "react-i18next";
import { Navigate, useParams } from "react-router-dom";
import { PlansErrorState } from "@/features/admin/plans/components/plans-error-state";
import { PlanDetailHero } from "@/features/admin/plans/components/plan-detail-hero";
import { PlanDetailSkeleton } from "@/features/admin/plans/components/plan-detail-skeleton";
import { PlanForm } from "@/features/admin/plans/components/plan-form";
import { PlanLifecycleActions } from "@/features/admin/plans/components/plan-lifecycle-actions";
import { useAdminPlan } from "@/features/admin/plans/hooks/use-admin-plan";
import { useAdminMe } from "@/features/admin/auth/hooks/use-admin-me";
import { AdminRole } from "@/shared/types/enums";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function PlanDetailHome() {
  const { t } = useTranslation("admin");
  const { planId } = useParams<{ planId: string }>();
  const planQuery = useAdminPlan(planId);
  const { data: admin } = useAdminMe();

  const canManage = admin?.role === AdminRole.SUPER_ADMIN;

  if (!planId || !UUID_PATTERN.test(planId)) {
    return <Navigate to="/admin/plans" replace />;
  }

  const isInitialLoading = planQuery.isLoading && !planQuery.data;
  const isNotFound =
    planQuery.isError &&
    (planQuery.error as { response?: { status?: number } })?.response
      ?.status === 404;

  if (isNotFound) {
    return <Navigate to="/admin/plans" replace />;
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <a
        href="#plan-detail-main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        {t("plans.detail.skipToContent")}
      </a>

      {isInitialLoading ? <PlanDetailSkeleton /> : null}

      {planQuery.isError && !isNotFound ? (
        <PlansErrorState
          onRetry={() => void planQuery.refetch()}
          isRetrying={planQuery.isFetching}
        />
      ) : null}

      {planQuery.data ? (
        <div id="plan-detail-main" className="space-y-6">
          <PlanDetailHero plan={planQuery.data} />

          {canManage ? (
            <PlanLifecycleActions plan={planQuery.data} />
          ) : null}

          <PlanForm
            mode="edit"
            plan={planQuery.data}
            canEdit={canManage}
          />
        </div>
      ) : null}
    </div>
  );
}
