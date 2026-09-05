import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useWallet } from "@/features/wallet/hooks/use-wallet";
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Skeleton,
} from "@/shared/components/ui";
import { formatCurrency, formatDate } from "@/shared/lib/formatters";
import {
  MerchantPermission,
  useMerchantPermissions,
} from "@/shared/hooks/use-merchant-permissions";
import { useIsMobile } from "@/shared/hooks/use-is-mobile";
import { useLocaleStore } from "@/stores/locale.store";
import { cn } from "@/shared/lib/utils";

const HOVER_CLOSE_DELAY_MS = 120;

export function WalletHeaderPopover() {
  const { t } = useTranslation("wallet");
  const locale = useLocaleStore((state) => state.locale);
  const intlLocale = locale === "ar" ? "ar-EG" : "en-US";
  const isMobile = useIsMobile();
  const { hasPermission, isLoading: isPermissionsLoading } =
    useMerchantPermissions();
  const canReadWallet = hasPermission(MerchantPermission.WALLET_READ);

  const walletQuery = useWallet({ enabled: canReadWallet });
  const [open, setOpen] = useState(false);
  const closeTimerRef = useRef<number | null>(null);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setOpen(false);
      closeTimerRef.current = null;
    }, HOVER_CLOSE_DELAY_MS);
  }, [clearCloseTimer]);

  useEffect(() => clearCloseTimer, [clearCloseTimer]);

  if (isPermissionsLoading || !canReadWallet) {
    return null;
  }

  const wallet = walletQuery.data;
  const formattedBalance = wallet
    ? formatCurrency(wallet.balance, wallet.currency, intlLocale)
    : null;

  const handleTriggerMouseEnter = () => {
    if (isMobile) return;
    clearCloseTimer();
    setOpen(true);
  };

  const handleTriggerMouseLeave = () => {
    if (isMobile) return;
    scheduleClose();
  };

  const handleContentMouseEnter = () => {
    if (isMobile) return;
    clearCloseTimer();
  };

  const handleContentMouseLeave = () => {
    if (isMobile) return;
    scheduleClose();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="max-w-[11rem] gap-2 rounded-full ps-2.5"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label={t("header.triggerLabel")}
          onMouseEnter={handleTriggerMouseEnter}
          onMouseLeave={handleTriggerMouseLeave}
        >
          <span
            className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"
            aria-hidden="true"
          >
            <Wallet className="size-3.5" />
          </span>
          {walletQuery.isLoading && !wallet ? (
            <Skeleton className="h-4 w-16" />
          ) : formattedBalance ? (
            <span dir="ltr" className="truncate tabular-nums font-medium">
              {formattedBalance}
            </span>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[min(calc(100vw-2rem),20rem)] gap-0 overflow-hidden p-0"
        onMouseEnter={handleContentMouseEnter}
        onMouseLeave={handleContentMouseLeave}
      >
        <div className="space-y-3 p-4">
          <div className="flex items-start gap-3">
            <span
              className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15"
              aria-hidden="true"
            >
              <Wallet className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-muted-foreground">
                {t("header.totalBalance")}
              </p>
              {walletQuery.isLoading && !wallet ? (
                <Skeleton className="mt-2 h-7 w-28" />
              ) : formattedBalance ? (
                <p
                  dir="ltr"
                  className="mt-1 text-xl font-semibold tabular-nums text-foreground"
                  aria-live="polite"
                >
                  {formattedBalance}
                </p>
              ) : (
                <p className="mt-1 text-sm text-destructive" role="alert">
                  {t("header.loadError")}
                </p>
              )}
              {wallet ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  <time dir="ltr" dateTime={wallet.updatedAt} className="tabular-nums">
                    {t("header.updatedAt", {
                      date: formatDate(wallet.updatedAt),
                    })}
                  </time>
                </p>
              ) : null}
            </div>
          </div>

          <p className="text-xs leading-relaxed text-muted-foreground">
            {t("header.hint")}
          </p>
        </div>

        <div className="border-t border-border/70 bg-muted/20 p-3">
          <Button
            asChild
            variant="secondary"
            className="h-9 w-full justify-between gap-2"
            onClick={() => setOpen(false)}
          >
            <Link to="/wallet">
              <span>{t("header.viewWallet")}</span>
              <ArrowLeft
                className={cn(
                  "size-4 shrink-0 text-muted-foreground",
                  locale === "ar" ? "" : "rotate-180",
                )}
                aria-hidden="true"
              />
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
