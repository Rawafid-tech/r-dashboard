import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui";
import { PageHeader } from "@/shared/components/layout/page-header";
import { PlanForm } from "@/features/admin/plans/components/plan-form";
import { useAdminMe } from "@/features/admin/auth/hooks/use-admin-me";
import { AdminRole } from "@/shared/types/enums";
import type { AdminPlan } from "@/features/admin/plans/types";

export function PlanCreateHome() {
  const { t } = useTranslation("admin");
  const navigate = useNavigate();
  const { data: admin, isLoading } = useAdminMe();

  const canManage = admin?.role === AdminRole.SUPER_ADMIN;

  if (!isLoading && !canManage) {
    return <Navigate to="/admin/plans" replace />;
  }

  const handleCreateSuccess = (plan: AdminPlan) => {
    navigate(`/admin/plans/${plan.id}`, { replace: true });
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <a
        href="#plan-create-main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        {t("plans.create.skipToContent")}
      </a>

      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm" className="-ms-2 w-fit">
          <Link to="/admin/plans">
            <ArrowLeft aria-hidden="true" />
            {t("plans.detail.backToCatalog")}
          </Link>
        </Button>

        <PageHeader
          title={t("plans.create.title")}
          description={t("plans.create.subtitle")}
        />
      </div>

      <div id="plan-create-main">
        <PlanForm
          mode="create"
          canEdit={canManage}
          onCreateSuccess={handleCreateSuccess}
        />
      </div>
    </div>
  );
}
