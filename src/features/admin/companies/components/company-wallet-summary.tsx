import { useId, useState } from "react";
import { History, Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CompanyWalletAdjustDialog } from "@/features/admin/companies/components/company-wallet-adjust-dialog";
import type { AdminCompany } from "@/features/admin/companies/types";
import type { AdminWallet } from "@/features/wallet/types";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@/shared/components/ui";
import { formatCurrency, formatDate } from "@/shared/lib/formatters";
import { useLocaleStore } from "@/stores/locale.store";

interface CompanyWalletSummaryProps {
  company: AdminCompany;
  wallet?: AdminWallet;
  isLoading: boolean;
  isError: boolean;
  canManage: boolean;
  onViewLedger: () => void;
  onRetry: () => void;
}

export function CompanyWalletSummary({
  company,
  wallet,
  isLoading,
  isError,
  canManage,
  onViewLedger,
  onRetry,
}: CompanyWalletSummaryProps) {
  const { t } = useTranslation("admin");
  const locale = useLocaleStore((state) => state.locale);
  const intlLocale = locale === "ar" ? "ar-EG" : "en-US";
  const sectionId = useId();
  const [adjustOpen, setAdjustOpen] = useState(false);

  return (
    <>
      <Card aria-labelledby={`${sectionId}-title`}>
        <CardHeader className="gap-3 border-b border-border/60 bg-muted/15 pb-4">
          <div className="flex items-start gap-3">
            <span
              className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15"
              aria-hidden="true"
            >
              <Wallet className="size-4" />
            </span>
            <div className="min-w-0 space-y-1">
              <CardTitle id={`${sectionId}-title`} className="text-base">
                {t("companies.detail.wallet.title")}
              </CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                {t("companies.detail.wallet.summaryHint")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          {isLoading ? (
            <div className="space-y-2" aria-busy="true">
              <Skeleton className="h-8 w-36" />
              <Skeleton className="h-4 w-48" />
            </div>
          ) : null}

          {isError ? (
            <div className="space-y-3" role="alert">
              <p className="text-sm text-destructive">
                {t("companies.detail.wallet.loadError")}
              </p>
              <Button type="button" variant="outline" size="sm" onClick={onRetry}>
                {t("companies.errors.retry")}
              </Button>
            </div>
          ) : null}

          {wallet && !isError ? (
            <div aria-live="polite" aria-atomic="true" className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  {t("companies.detail.wallet.balanceLabel")}
                </p>
                <p
                  dir="ltr"
                  className="mt-1 text-2xl font-semibold tracking-tight text-foreground tabular-nums"
                >
                  {formatCurrency(wallet.balance, wallet.currency, intlLocale)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  <time dir="ltr" dateTime={wallet.updatedAt} className="tabular-nums">
                    {t("companies.detail.wallet.updatedAt", {
                      date: formatDate(wallet.updatedAt),
                    })}
                  </time>
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onViewLedger}
                >
                  <History className="size-4" aria-hidden="true" />
                  {t("companies.detail.wallet.viewLedger")}
                </Button>
                {canManage ? (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setAdjustOpen(true)}
                  >
                    {t("companies.detail.wallet.adjustButton")}
                  </Button>
                ) : null}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {canManage && wallet ? (
        <CompanyWalletAdjustDialog
          company={company}
          wallet={wallet}
          open={adjustOpen}
          onOpenChange={setAdjustOpen}
        />
      ) : null}
    </>
  );
}
