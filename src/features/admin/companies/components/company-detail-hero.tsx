import { ArrowLeft, Building2, Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button, Skeleton } from "@/shared/components/ui";
import { formatCompanyAccountNumber } from "@/features/admin/companies/lib/company-label";
import { PlanCodeBadge } from "@/features/admin/companies/components/plan-code-badge";
import type { AdminCompany } from "@/features/admin/companies/types";
import type { AdminWallet } from "@/features/wallet/types";
import { PageHeader } from "@/shared/components/layout/page-header";
import { formatCurrency } from "@/shared/lib/formatters";
import { useLocaleStore } from "@/stores/locale.store";

interface CompanyDetailHeroProps {
  company: AdminCompany;
  wallet?: AdminWallet;
  isWalletLoading?: boolean;
}

export function CompanyDetailHero({
  company,
  wallet,
  isWalletLoading = false,
}: CompanyDetailHeroProps) {
  const { t } = useTranslation("admin");
  const locale = useLocaleStore((state) => state.locale);
  const intlLocale = locale === "ar" ? "ar-EG" : "en-US";
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
          <div className="flex flex-wrap gap-3">
            <div className="rounded-lg border border-border bg-card px-4 py-3">
              <p className="text-xs text-muted-foreground">
                {t("companies.detail.currentPlan")}
              </p>
              <div className="mt-2">
                <PlanCodeBadge planCode={company.planCode} />
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card px-4 py-3">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Wallet className="size-3.5" aria-hidden="true" />
                {t("companies.detail.hero.walletBalance")}
              </p>
              <div className="mt-2" aria-live="polite">
                {isWalletLoading ? (
                  <Skeleton className="h-6 w-24" />
                ) : wallet ? (
                  <p
                    dir="ltr"
                    className="text-sm font-semibold tabular-nums text-foreground"
                  >
                    {formatCurrency(
                      wallet.balance,
                      wallet.currency,
                      intlLocale,
                    )}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">—</p>
                )}
              </div>
            </div>
          </div>
        }
      />
    </div>
  );
}
