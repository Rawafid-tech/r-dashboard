import { useEffect, useId, useMemo, useRef } from "react";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  applyWalletAdjustFieldErrors,
  useAdjustCompanyWallet,
} from "@/features/admin/companies/hooks/use-adjust-company-wallet";
import {
  createWalletAdjustSchema,
  parseWalletAdjustAmount,
  type WalletAdjustFormValues,
} from "@/features/admin/companies/lib/wallet-adjust-schema";
import type { AdminCompany } from "@/features/admin/companies/types";
import type { AdminWallet } from "@/features/wallet/types";
import { formatCurrency } from "@/shared/lib/formatters";
import { useAppForm } from "@/shared/hooks/use-app-form";
import { cn } from "@/shared/lib/utils";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  FieldError,
  FieldLabel,
  Input,
} from "@/shared/components/ui";
import { useLocaleStore } from "@/stores/locale.store";

interface CompanyWalletAdjustDialogProps {
  company: AdminCompany;
  wallet: AdminWallet;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CompanyWalletAdjustDialog({
  company,
  wallet,
  open,
  onOpenChange,
}: CompanyWalletAdjustDialogProps) {
  const { t, i18n } = useTranslation("admin");
  const locale = useLocaleStore((state) => state.locale);
  const intlLocale = locale === "ar" ? "ar-EG" : "en-US";
  const formId = useId();
  const adjustMutation = useAdjustCompanyWallet(company.id);
  const requestIdRef = useRef(crypto.randomUUID());
  const isFirstRenderRef = useRef(true);

  const schema = useMemo(
    () => createWalletAdjustSchema(t),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, i18n.language],
  );

  const {
    register,
    handleSubmit,
    setError,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useAppForm({
    schema,
    defaultValues: {
      direction: "CREDIT" as const,
      amount: "",
      note: "",
    },
    mode: "onBlur",
  });

  const watchedDirection = watch("direction");
  const watchedAmount = watch("amount");
  const watchedNote = watch("note");

  useEffect(() => {
    if (!open) {
      isFirstRenderRef.current = true;
      return;
    }

    requestIdRef.current = crypto.randomUUID();
    isFirstRenderRef.current = true;
    reset({
      direction: "CREDIT",
      amount: "",
      note: "",
    });
  }, [open, reset]);

  useEffect(() => {
    if (!open) return;

    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

    requestIdRef.current = crypto.randomUUID();
  }, [open, watchedDirection, watchedAmount, watchedNote]);

  const busy = isSubmitting || adjustMutation.isPending;

  const onSubmit = handleSubmit(async (values: WalletAdjustFormValues) => {
    try {
      await adjustMutation.mutateAsync({
        requestId: requestIdRef.current,
        direction: values.direction,
        amount: parseWalletAdjustAmount(values.amount),
        note: values.note.trim(),
      });
      onOpenChange(false);
    } catch (error) {
      if (applyWalletAdjustFieldErrors(error, setError)) return;
    }
  });

  const previewAmount = Number(watchedAmount);
  const previewBalance =
    watchedDirection === "CREDIT"
      ? wallet.balance +
        (Number.isFinite(previewAmount) ? previewAmount : 0)
      : wallet.balance -
        (Number.isFinite(previewAmount) ? previewAmount : 0);

  const currentFormatted = formatCurrency(
    wallet.balance,
    wallet.currency,
    intlLocale,
  );
  const afterFormatted = formatCurrency(
    previewBalance,
    wallet.currency,
    intlLocale,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="w6" closeLabel={t("companies.detail.wallet.cancel")}>
        <DialogHeader className="gap-1">
          <DialogTitle>{t("companies.detail.wallet.adjustTitle")}</DialogTitle>
          <DialogDescription className="text-xs">
            {t("companies.detail.wallet.adjustDescription", {
              company: company.name,
            })}
          </DialogDescription>
        </DialogHeader>

        <form id={formId} onSubmit={onSubmit} noValidate className="space-y-4">
          <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-[7.5rem_6.5rem_minmax(0,1fr)]">
            <Field>
              <FieldLabel className="text-xs">
                {t("companies.detail.wallet.directionLabel")}
              </FieldLabel>
              <div
                className="flex rounded-lg border border-border p-0.5"
                role="radiogroup"
                aria-label={t("companies.detail.wallet.directionLabel")}
              >
                {(["CREDIT", "DEBIT"] as const).map((direction) => (
                  <label
                    key={direction}
                    className={cn(
                      "flex-1 cursor-pointer rounded-md px-2 py-1.5 text-center text-xs font-medium transition-colors",
                      "has-[:checked]:bg-primary has-[:checked]:text-primary-foreground",
                      "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                    )}
                  >
                    <input
                      type="radio"
                      value={direction}
                      className="sr-only"
                      disabled={busy}
                      {...register("direction")}
                    />
                    {direction === "CREDIT"
                      ? t("companies.detail.wallet.directionCreditShort")
                      : t("companies.detail.wallet.directionDebitShort")}
                  </label>
                ))}
              </div>
              {errors.direction ? (
                <FieldError>{errors.direction.message}</FieldError>
              ) : null}
            </Field>

            <Field data-invalid={!!errors.amount || undefined}>
              <FieldLabel htmlFor={`${formId}-amount`} className="text-xs">
                {t("companies.detail.wallet.amountLabel")}
              </FieldLabel>
              <Input
                id={`${formId}-amount`}
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0.01"
                max="1000000"
                dir="ltr"
                className="h-9 tabular-nums"
                disabled={busy}
                placeholder="0.00"
                aria-describedby={`${formId}-amount-hint`}
                {...register("amount")}
              />
              <span id={`${formId}-amount-hint`} className="sr-only">
                {t("companies.detail.wallet.amountHint")}
              </span>
              {errors.amount ? (
                <FieldError>{errors.amount.message}</FieldError>
              ) : null}
            </Field>

            <Field data-invalid={!!errors.note || undefined}>
              <FieldLabel htmlFor={`${formId}-note`} className="text-xs">
                {t("companies.detail.wallet.noteLabel")}
              </FieldLabel>
              <Input
                id={`${formId}-note`}
                maxLength={500}
                disabled={busy}
                className="h-9"
                placeholder={t("companies.detail.wallet.notePlaceholder")}
                aria-describedby={`${formId}-note-hint`}
                {...register("note")}
              />
              <span id={`${formId}-note-hint`} className="sr-only">
                {t("companies.detail.wallet.noteHint")}
              </span>
              {errors.note ? (
                <FieldError>{errors.note.message}</FieldError>
              ) : null}
            </Field>
          </div>

          <div
            className="flex flex-col gap-3 rounded-lg border border-border/70 bg-muted/20 px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between"
            aria-live="polite"
          >
            <p className="text-muted-foreground">
              <span className="sr-only">
                {t("companies.detail.wallet.previewTitle")}:{" "}
              </span>
              <span dir="ltr" className="tabular-nums font-medium text-foreground">
                {currentFormatted}
              </span>
              <span aria-hidden="true" className="mx-2 text-muted-foreground">
                →
              </span>
              <span dir="ltr" className="tabular-nums font-medium text-foreground">
                {afterFormatted}
              </span>
            </p>
          </div>
        </form>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => onOpenChange(false)}
          >
            {t("companies.detail.wallet.cancel")}
          </Button>
          <Button type="submit" form={formId} disabled={busy}>
            {busy ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : null}
            {busy
              ? t("companies.detail.wallet.submitting")
              : t("companies.detail.wallet.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
