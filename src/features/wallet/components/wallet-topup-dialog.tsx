import { useEffect, useId, useRef, useState } from "react";
import { AxiosError } from "axios";
import { PlusIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTopUpMutation, parseTopUpMinimumError } from "@/features/wallet/hooks/use-topup-mutation";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Input,
} from "@/shared/components/ui";
import { formatCurrency } from "@/shared/lib/formatters";

/** Maximum amount per the structural validation rule */
const MAX_AMOUNT = 1_000_000;

interface WalletTopUpDialogProps {
  /** Currency from the wallet — read-only, never let the user change it */
  currency: string;
  intlLocale: string;
}

/**
 * Dialog that collects a top-up amount and redirects to Paymob checkout.
 *
 * Rules enforced by this component:
 * - No card form (card data never touches our origin)
 * - No iframe (Paymob needs full-page navigation for 3DS)
 * - Minimum is read from the server's 400 response — never hardcoded
 * - Amount is validated client-side first, then server response is used
 *   as the authoritative floor
 */
export function WalletTopUpDialog({
  currency,
  intlLocale,
}: WalletTopUpDialogProps) {
  const { t } = useTranslation("wallet");
  const amountId = useId();
  const amountErrorId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [rawValue, setRawValue] = useState("");
  const [clientError, setClientError] = useState<string | null>(null);
  const [serverMinimum, setServerMinimum] = useState<number | null>(null);
  const [gatewayError, setGatewayError] = useState<string | null>(null);

  const mutation = useTopUpMutation();

  // Reset all state when dialog closes
  useEffect(() => {
    if (!open) {
      setRawValue("");
      setClientError(null);
      setServerMinimum(null);
      setGatewayError(null);
      mutation.reset();
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      window.setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const validateAmount = (value: string): string | null => {
    const trimmed = value.trim();
    if (!trimmed) return t("topup.errorInvalidAmount");

    const num = Number(trimmed);
    if (!Number.isFinite(num) || num <= 0) return t("topup.errorInvalidAmount");
    if (num > MAX_AMOUNT) return t("topup.errorInvalidAmount");

    // At most 2 decimal places
    if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return t("topup.errorInvalidAmount");

    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);
    setServerMinimum(null);
    setGatewayError(null);

    const validationError = validateAmount(rawValue);
    if (validationError) {
      setClientError(validationError);
      return;
    }

    const amount = Number(rawValue.trim());

    mutation.mutate(
      { amount },
      {
        onError: (error) => {
          // ① below minimum → read `minimum` from top-level problem detail
          const minError = parseTopUpMinimumError(error);
          if (minError) {
            setServerMinimum(minError.minimum);
            return;
          }

          // ② gateway down → 502
          if (error instanceof AxiosError && error.response?.status === 502) {
            setGatewayError(t("topup.errorGatewayDown"));
            return;
          }

          // ③ fallback generic
          setGatewayError(t("topup.errorGeneric"));
        },
      },
    );
  };

  const isSubmitting = mutation.isPending;

  const minimumLabel = serverMinimum !== null
    ? t("topup.errorBelowMinimum", {
        amount: formatCurrency(serverMinimum, currency, intlLocale),
      })
    : null;

  const fieldError = clientError ?? minimumLabel;
  const hasFieldError = Boolean(fieldError);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          size="sm"
          id="wallet-topup-trigger"
          aria-haspopup="dialog"
        >
          <PlusIcon className="size-4" aria-hidden="true" />
          {t("topup.button")}
        </Button>
      </DialogTrigger>

      <DialogContent size="w2" closeLabel={t("topup.cancel")}>
        <DialogHeader>
          <DialogTitle>{t("topup.dialogTitle")}</DialogTitle>
          <DialogDescription>{t("topup.dialogDescription")}</DialogDescription>
        </DialogHeader>

        <form id="topup-form" onSubmit={handleSubmit} noValidate>
          <DialogBody className="space-y-4">
            <Field data-invalid={hasFieldError || undefined}>
              <FieldLabel htmlFor={amountId}>
                {t("topup.amountLabel")}
              </FieldLabel>

              <div className="flex items-center gap-2">
                <Input
                  ref={inputRef}
                  id={amountId}
                  type="number"
                  inputMode="decimal"
                  min="0.01"
                  max={MAX_AMOUNT}
                  step="0.01"
                  dir="ltr"
                  placeholder={t("topup.amountPlaceholder")}
                  value={rawValue}
                  onChange={(e) => {
                    setRawValue(e.target.value);
                    // Clear errors as user types
                    if (clientError) setClientError(null);
                    if (serverMinimum !== null) setServerMinimum(null);
                  }}
                  aria-describedby={amountErrorId}
                  aria-invalid={hasFieldError}
                  disabled={isSubmitting}
                  className="tabular-nums"
                />
                <span
                  className="shrink-0 text-sm font-medium text-muted-foreground tabular-nums"
                  aria-hidden="true"
                >
                  {currency}
                </span>
              </div>

              {fieldError ? (
                <FieldError id={amountErrorId} role="alert">
                  {fieldError}
                </FieldError>
              ) : (
                <FieldDescription id={amountErrorId}>
                  {serverMinimum !== null
                    ? t("topup.minHint", {
                        amount: formatCurrency(serverMinimum, currency, intlLocale),
                      })
                    : null}
                </FieldDescription>
              )}
            </Field>

            {/* Gateway / generic error — shown below the field */}
            {gatewayError ? (
              <p
                role="alert"
                className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
              >
                {gatewayError}
              </p>
            ) : null}
          </DialogBody>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              {t("topup.cancel")}
            </Button>
            <Button
              type="submit"
              form="topup-form"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? t("topup.submitting") : t("topup.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
