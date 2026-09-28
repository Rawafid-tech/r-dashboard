import { useEffect, useId, useMemo, useRef } from "react";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  applyWalletRefundFieldErrors,
  useRefundCompanyWallet,
} from "@/features/admin/companies/hooks/use-refund-company-wallet";
import {
  createWalletRefundSchema,
  parseWalletRefundAmount,
  type WalletRefundFormValues,
} from "@/features/admin/companies/lib/wallet-refund-schema";
import { formatWalletCentsInput } from "@/features/wallet/lib/wallet-refund";
import { getWalletTransactionTypeLabel } from "@/features/wallet/lib/wallet-transaction-label";
import type { WalletTransaction } from "@/features/wallet/types";
import { useAppForm } from "@/shared/hooks/use-app-form";
import { formatCurrency, formatDate } from "@/shared/lib/formatters";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Input,
} from "@/shared/components/ui";
import { useLocaleStore } from "@/stores/locale.store";

interface CompanyWalletRefundDialogProps {
  companyId: string;
  companyName: string;
  currency: string;
  charge: WalletTransaction;
  refundableCents: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CompanyWalletRefundDialog({
  companyId,
  companyName,
  currency,
  charge,
  refundableCents,
  open,
  onOpenChange,
}: CompanyWalletRefundDialogProps) {
  const { t, i18n } = useTranslation("admin");
  const { t: tWallet } = useTranslation("wallet");
  const locale = useLocaleStore((state) => state.locale);
  const intlLocale = locale === "ar" ? "ar-EG" : "en-US";
  const formId = useId();
  const refundableId = `${formId}-refundable`;
  const amountHintId = `${formId}-amount-hint`;
  const amountErrorId = `${formId}-amount-error`;
  const noteHintId = `${formId}-note-hint`;
  const noteErrorId = `${formId}-note-error`;
  const refundMutation = useRefundCompanyWallet(companyId);
  const requestIdRef = useRef(crypto.randomUUID());
  const isFirstAmountChangeRef = useRef(true);

  const schema = useMemo(
    () => createWalletRefundSchema(t, refundableCents),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, i18n.language, refundableCents],
  );

  const chargeLabel = getWalletTransactionTypeLabel(
    charge.type,
    charge.direction,
    tWallet,
  );
  const chargeAmount = formatCurrency(charge.amount, currency, intlLocale);
  const refundableAmount = formatCurrency(
    refundableCents / 100,
    currency,
    intlLocale,
  );
  const prefilledAmount = formatWalletCentsInput(refundableCents);

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
      amount: prefilledAmount,
      note: "",
    },
    mode: "onBlur",
  });

  const watchedAmount = watch("amount");

  useEffect(() => {
    if (!open) {
      isFirstAmountChangeRef.current = true;
      return;
    }

    requestIdRef.current = crypto.randomUUID();
    isFirstAmountChangeRef.current = true;
    reset({
      amount: prefilledAmount,
      note: "",
    });
  }, [open, charge.id, prefilledAmount, reset]);

  useEffect(() => {
    if (!open) return;

    if (isFirstAmountChangeRef.current) {
      isFirstAmountChangeRef.current = false;
      return;
    }

    requestIdRef.current = crypto.randomUUID();
  }, [open, watchedAmount]);

  const busy = isSubmitting || refundMutation.isPending;

  const onSubmit = handleSubmit(async (values: WalletRefundFormValues) => {
    try {
      await refundMutation.mutateAsync({
        transactionId: charge.id,
        body: {
          requestId: requestIdRef.current,
          amount: parseWalletRefundAmount(values.amount),
          note: values.note.trim(),
        },
      });
      onOpenChange(false);
    } catch (error) {
      if (applyWalletRefundFieldErrors(error, setError)) return;
    }
  });

  const amountDescribedBy = errors.amount
    ? `${refundableId} ${amountErrorId}`
    : `${refundableId} ${amountHintId}`;
  const noteDescribedBy = errors.note
    ? `${noteHintId} ${noteErrorId}`
    : noteHintId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="w3" closeLabel={t("companies.detail.wallet.cancel")}>
        <DialogHeader className="gap-1">
          <DialogTitle>{t("companies.detail.wallet.refundTitle")}</DialogTitle>
          <DialogDescription>
            {t("companies.detail.wallet.refundDescription", {
              company: companyName,
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-border/70 bg-muted/20 px-3 py-3 text-sm">
          <p className="text-xs font-medium text-muted-foreground">
            {t("companies.detail.wallet.refundChargeLabel")}
          </p>
          <p className="mt-1 font-medium text-foreground">{chargeLabel}</p>
          <p className="mt-1 text-muted-foreground">
            <time dateTime={charge.createdAt}>
              <span dir="ltr" className="inline-block tabular-nums">
                {formatDate(charge.createdAt, "DD_MM_YYYY")}
              </span>
            </time>
            <span aria-hidden="true" className="mx-2">
              ·
            </span>
            <span dir="ltr" className="inline-block tabular-nums">
              {chargeAmount}
            </span>
          </p>
          <p id={refundableId} className="mt-2 text-foreground">
            {t("companies.detail.wallet.refundable", {
              remaining: refundableAmount,
              total: chargeAmount,
            })}
          </p>
        </div>

        <form id={formId} onSubmit={onSubmit} noValidate className="space-y-4">
          <Field data-invalid={!!errors.amount || undefined}>
            <FieldLabel htmlFor={`${formId}-amount`}>
              {t("companies.detail.wallet.refundAmountLabel")}
            </FieldLabel>
            <Input
              id={`${formId}-amount`}
              type="text"
              inputMode="decimal"
              dir="ltr"
              className="tabular-nums"
              disabled={busy}
              autoComplete="off"
              aria-invalid={errors.amount ? true : undefined}
              aria-describedby={amountDescribedBy}
              {...register("amount")}
            />
            {errors.amount ? (
              <FieldError id={amountErrorId}>{errors.amount.message}</FieldError>
            ) : (
              <FieldDescription id={amountHintId}>
                {t("companies.detail.wallet.refundAmountHint", {
                  remaining: refundableAmount,
                })}
              </FieldDescription>
            )}
          </Field>

          <Field data-invalid={!!errors.note || undefined}>
            <FieldLabel htmlFor={`${formId}-note`}>
              {t("companies.detail.wallet.refundNoteLabel")}
            </FieldLabel>
            <Input
              id={`${formId}-note`}
              maxLength={500}
              disabled={busy}
              autoComplete="off"
              placeholder={t("companies.detail.wallet.refundNotePlaceholder")}
              aria-invalid={errors.note ? true : undefined}
              aria-describedby={noteDescribedBy}
              {...register("note")}
            />
            <FieldDescription id={noteHintId}>
              {t("companies.detail.wallet.refundNoteHint")}
            </FieldDescription>
            {errors.note ? (
              <FieldError id={noteErrorId}>{errors.note.message}</FieldError>
            ) : null}
          </Field>
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
          <Button
            type="submit"
            form={formId}
            disabled={busy || refundableCents <= 0}
            aria-busy={busy || undefined}
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : null}
            {busy
              ? t("companies.detail.wallet.refundSubmitting")
              : t("companies.detail.wallet.refundSubmit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
