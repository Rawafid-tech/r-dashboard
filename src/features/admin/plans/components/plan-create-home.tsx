import { ArrowLeft, CreditCard } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Badge, Button } from "@/shared/components/ui";
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

      <section
        className="relative overflow-hidden rounded-2xl bg-[linear-gradient(135deg,color-mix(in_oklab,var(--color-primary)_10%,transparent),color-mix(in_oklab,#7c3aed_8%,transparent))] px-5 py-6 ring-1 ring-foreground/8 sm:px-7 sm:py-8"
        aria-labelledby="plan-create-title"
      >
        <div className="space-y-4">
          <Button asChild variant="ghost" size="sm" className="-ms-2 w-fit">
            <Link to="/admin/plans">
              <ArrowLeft aria-hidden="true" />
              {t("plans.detail.backToCatalog")}
            </Link>
          </Button>

          <div className="space-y-2">
            <Badge variant="secondary" className="gap-1 uppercase">
              <CreditCard className="size-3" aria-hidden="true" />
              {t("plans.create.badge")}
            </Badge>
            <h1
              id="plan-create-title"
              className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
            >
              {t("plans.create.title")}
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t("plans.create.subtitle")}
            </p>
          </div>
        </div>
      </section>

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
