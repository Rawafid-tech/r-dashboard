import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui";
import { formatCurrency } from "@/shared/lib/formatters";
import { useCreateSubscription } from "@/features/subscription/hooks/use-create-subscription";
import {
  getBalanceAfterCheckout,
  isPaidPlanChange,
} from "@/features/subscription/lib/subscription-checkout";
import type {
  CheckoutSelection,
  Subscription,
} from "@/features/subscription/types";

interface BillingCheckoutDialogProps {
  selection: CheckoutSelection | null;
  subscription?: Subscription;
  walletBalance: number;
  currency: string;
  intlLocale: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BillingCheckoutDialog({
  selection,
  subscription,
  walletBalance,
  currency,
  intlLocale,
  open,
  onOpenChange,
}: BillingCheckoutDialogProps) {
  const { t } = useTranslation("billing");
  const createMutation = useCreateSubscription();

  const busy = createMutation.isPending;
  const isFree = selection?.planCode === "FREE";
  const price = selection?.price ?? 0;
  const balanceAfter = getBalanceAfterCheckout(walletBalance, price);

  const formattedCharge = formatCurrency(price, currency, intlLocale);
  const formattedBefore = formatCurrency(walletBalance, currency, intlLocale);
  const formattedAfter = formatCurrency(balanceAfter, currency, intlLocale);

  const showForfeiture =
    selection &&
    subscription &&
    isPaidPlanChange(
      subscription,
      selection.planCode,
      selection.shipmentsPerMonth,
      selection.billingPeriod,
    );

  const periodLabel = selection
    ? t(`billingPeriod.${selection.billingPeriod}`)
    : "";

  const handleConfirm = async () => {
    if (!selection) return;

    try {
      await createMutation.mutateAsync({
        planCode: selection.planCode,
        shipmentsPerMonth: selection.shipmentsPerMonth,
        billingPeriod: selection.billingPeriod,
      });
      onOpenChange(false);
    } catch {
      // Toast handled in mutation hook.
    }
  };

  const title = showForfeiture
    ? t("checkout.titleChange")
    : t("checkout.title");

  const description = isFree
    ? t("checkout.descriptionFree")
    : t("checkout.description", { amount: formattedCharge });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="w4" aria-describedby="checkout-description">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription id="checkout-description">
            {description}
          </DialogDescription>
        </DialogHeader>

        {selection ? (
          <div className="space-y-4">
            <dl className="rounded-lg border border-border/60 bg-muted/20 p-4 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">{selection.planName}</dt>
                <dd className="font-medium" dir="ltr">
                  {selection.shipmentsPerMonth.toLocaleString(intlLocale)}{" "}
                  {t("plans.shipmentsLabel").toLowerCase()}
                </dd>
              </div>
              <div className="mt-2 flex justify-between gap-3">
                <dt className="text-muted-foreground">
                  {t("plans.billingCycle")}
                </dt>
                <dd className="font-medium">{periodLabel}</dd>
              </div>
              {!isFree ? (
                <div className="mt-2 flex justify-between gap-3 border-t border-border/60 pt-2">
                  <dt className="font-medium">{t("checkout.chargeAmount")}</dt>
                  <dd className="font-semibold tabular-nums" dir="ltr">
                    {formattedCharge}
                  </dd>
                </div>
              ) : null}
            </dl>

            {showForfeiture ? (
              <p
                className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-900 dark:text-amber-100"
                role="note"
              >
                {t("checkout.forfeitureWarning", {
                  amount: formattedCharge,
                  period: periodLabel.toLowerCase(),
                })}
              </p>
            ) : null}

            {!isFree ? (
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border border-border/60 p-3">
                  <dt className="text-xs text-muted-foreground">
                    {t("checkout.balanceBefore")}
                  </dt>
                  <dd className="mt-1 font-semibold tabular-nums" dir="ltr">
                    {formattedBefore}
                  </dd>
                </div>
                <div className="rounded-lg border border-border/60 p-3">
                  <dt className="text-xs text-muted-foreground">
                    {t("checkout.balanceAfter")}
                  </dt>
                  <dd className="mt-1 font-semibold tabular-nums" dir="ltr">
                    {formattedAfter}
                  </dd>
                </div>
              </dl>
            ) : null}

            <p className="text-xs text-muted-foreground">
              {t("checkout.supportNote")}
            </p>
          </div>
        ) : null}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={busy}
          >
            {t("checkout.cancel")}
          </Button>
          <Button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={busy || !selection}
            aria-busy={busy}
          >
            {busy ? (
              <>
                <Loader2 className="animate-spin" aria-hidden="true" />
                {t("checkout.processing")}
              </>
            ) : isFree ? (
              t("checkout.confirmFree")
            ) : (
              t("checkout.confirm")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
