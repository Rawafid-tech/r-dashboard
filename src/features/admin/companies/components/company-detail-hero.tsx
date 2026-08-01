import { ArrowLeft, Building2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/shared/components/ui";
import { formatCompanyAccountNumber } from "@/features/admin/companies/lib/company-label";
import { PlanCodeBadge } from "@/features/admin/companies/components/plan-code-badge";
import type { AdminCompany } from "@/features/admin/companies/types";
import { PageHeader } from "@/shared/components/layout/page-header";

interface CompanyDetailHeroProps {
  company: AdminCompany;
}

export function CompanyDetailHero({ company }: CompanyDetailHeroProps) {
  const { t } = useTranslation("admin");
  const accountNumber = formatCompanyAccountNumber(company.identifier);

  return (
    <div className="space-y-4">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="-ms-2 w-fit text-muted-foreground hover:text-foreground"
      >
        <Link to="/admin/companies">
          <ArrowLeft aria-hidden="true" />
          {t("companies.detail.backToDirectory")}
        </Link>
      </Button>

      <PageHeader
        title={
          <span className="flex items-center gap-3">
            <span
              className="grid size-10 shrink-0 place-items-center rounded-md bg-primary/10 text-primary"
              aria-hidden="true"
            >
              <Building2 className="size-4" />
            </span>
            <span className="min-w-0">{company.name}</span>
          </span>
        }
        description={
          <span className="font-mono text-sm" dir="ltr">
            {accountNumber}
          </span>
        }
        actions={
          <div className="rounded-lg border border-border bg-card px-4 py-3">
            <p className="text-xs text-muted-foreground">
              {t("companies.detail.currentPlan")}
            </p>
            <div className="mt-2">
              <PlanCodeBadge planCode={company.planCode} />
            </div>
          </div>
        }
      />
    </div>
  );
}
