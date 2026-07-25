import { ArrowLeft, Building2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Badge, Button } from "@/shared/components/ui";
import { formatCompanyAccountNumber } from "@/features/admin/companies/lib/company-label";
import { PlanCodeBadge } from "@/features/admin/companies/components/plan-code-badge";
import type { AdminCompany } from "@/features/admin/companies/types";

interface CompanyDetailHeroProps {
  company: AdminCompany;
}

export function CompanyDetailHero({ company }: CompanyDetailHeroProps) {
  const { t } = useTranslation("admin");
  const accountNumber = formatCompanyAccountNumber(company.identifier);

  return (
    <section
      className="space-y-4"
      aria-labelledby="company-detail-title"
    >
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

      <div className="relative overflow-hidden rounded-2xl bg-[linear-gradient(135deg,color-mix(in_oklab,var(--color-primary)_10%,transparent),color-mix(in_oklab,#7c3aed_8%,transparent))] px-5 py-6 ring-1 ring-foreground/8 sm:px-7 sm:py-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <span
              className="grid size-12 shrink-0 place-items-center rounded-xl bg-violet-500/10 text-violet-700 ring-1 ring-violet-500/12 dark:text-violet-200"
              aria-hidden="true"
            >
              <Building2 className="size-5" />
            </span>
            <div className="min-w-0 space-y-2">
              <Badge variant="secondary" className="uppercase">
                {t("companies.detail.badge")}
              </Badge>
              <h1
                id="company-detail-title"
                className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
              >
                {company.name}
              </h1>
              <p className="font-mono text-sm text-muted-foreground" dir="ltr">
                {accountNumber}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-background/70 px-4 py-3 backdrop-blur-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("companies.detail.currentPlan")}
            </p>
            <div className="mt-2">
              <PlanCodeBadge planCode={company.planCode} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
