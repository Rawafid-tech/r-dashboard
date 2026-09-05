import { Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@/shared/components/ui";
import { formatCurrency, formatDate } from "@/shared/lib/formatters";
import type { Wallet as WalletData } from "@/features/wallet/types";

interface WalletBalanceCardProps {
  wallet: WalletData;
  intlLocale: string;
  dateFormat?: "DD_MM_YYYY" | "MM_DD_YYYY" | "YYYY_MM_DD";
}

export function WalletBalanceCard({
  wallet,
  intlLocale,
  dateFormat = "DD_MM_YYYY",
}: WalletBalanceCardProps) {
  const { t } = useTranslation("wallet");
  const formattedBalance = formatCurrency(
    wallet.balance,
    wallet.currency,
    intlLocale,
  );
  const formattedDate = formatDate(wallet.updatedAt, dateFormat);

  return (
    <Card className="overflow-hidden border-primary/15 bg-gradient-to-br from-card via-card to-primary/5">
      <CardHeader className="flex flex-row items-start gap-3 border-b border-border/60 bg-muted/15 pb-4">
        <span
          className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15"
          aria-hidden="true"
        >
          <Wallet className="size-5" />
        </span>
        <div className="min-w-0 space-y-1">
          <CardTitle className="text-base font-medium text-muted-foreground">
            {t("balance.title")}
          </CardTitle>
          <p
            className="text-3xl font-semibold tracking-tight text-foreground tabular-nums sm:text-4xl"
            dir="ltr"
            aria-label={formattedBalance}
          >
            {formattedBalance}
          </p>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-sm text-muted-foreground">
          <span className="sr-only">{t("balance.updatedAtLabel")}: </span>
          <time dir="ltr" dateTime={wallet.updatedAt} className="tabular-nums">
            {t("balance.updatedAt", { date: formattedDate })}
          </time>
        </p>
      </CardContent>
    </Card>
  );
}

export function WalletBalanceCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start gap-3 border-b border-border/60 pb-4">
        <Skeleton className="size-11 shrink-0 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-48 max-w-full" />
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <Skeleton className="h-4 w-40" />
      </CardContent>
    </Card>
  );
}
