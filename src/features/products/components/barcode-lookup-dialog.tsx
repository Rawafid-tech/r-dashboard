import { AlertCircle, Barcode, Loader2, PackageSearch } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { HandlingBadge } from "@/features/products/components/handling-badge";
import { ProductVariantsExpand } from "@/features/products/components/product-variants-expand";
import { useProductByBarcode } from "@/features/products/hooks/use-product-by-barcode";
import { formatPrice } from "@/features/products/lib/format-product";
import type { Product } from "@/features/products/types";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  FieldLabel,
  FieldSet,
  Input,
} from "@/shared/components/ui";
import { isApiError, parseApiError } from "@/shared/api/error-handler";

export interface BarcodeLookupCreateDefaults {
  barcode?: string;
}

interface BarcodeLookupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canManage: boolean;
  onEditProduct: (product: Product) => void;
  onCreateProduct: (defaults: BarcodeLookupCreateDefaults) => void;
}

type LookupPhase = "idle" | "invalid" | "loading" | "ready";

function isLookupInputInvalid(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length === 0 || trimmed.includes("/");
}

export function BarcodeLookupDialog({
  open,
  onOpenChange,
  canManage,
  onEditProduct,
  onCreateProduct,
}: BarcodeLookupDialogProps) {
  const { t } = useTranslation("products");
  const { t: tCommon } = useTranslation("common");
  const formId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const [inputValue, setInputValue] = useState("");
  const [submittedBarcode, setSubmittedBarcode] = useState<string | null>(null);
  const [phase, setPhase] = useState<LookupPhase>("idle");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [autoHandled, setAutoHandled] = useState(false);

  const lookupQuery = useProductByBarcode(submittedBarcode, {
    enabled: open && phase === "loading" && submittedBarcode != null,
  });

  const resetState = useCallback(() => {
    setInputValue("");
    setSubmittedBarcode(null);
    setPhase("idle");
    setSelectedProductId(null);
    setAutoHandled(false);
  }, []);

  useEffect(() => {
    if (!open) {
      resetState();
      return;
    }

    const timer = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [open, resetState]);

  useEffect(() => {
    if (phase !== "loading" || !submittedBarcode) return;
    if (lookupQuery.isFetching) return;

    if (lookupQuery.isError) {
      setPhase("ready");
      return;
    }

    const matches = lookupQuery.data ?? [];

    if (matches.length === 1 && canManage && !autoHandled) {
      setAutoHandled(true);
      onOpenChange(false);
      onEditProduct(matches[0]!);
      return;
    }

    if (matches.length > 1) {
      setSelectedProductId(matches[0]!.id);
    }

    setPhase("ready");
  }, [
    autoHandled,
    canManage,
    lookupQuery.data,
    lookupQuery.isError,
    lookupQuery.isFetching,
    onEditProduct,
    onOpenChange,
    phase,
    submittedBarcode,
  ]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = inputValue.trim();

    if (isLookupInputInvalid(inputValue)) {
      setSubmittedBarcode(null);
      setPhase("invalid");
      return;
    }

    setSelectedProductId(null);
    setAutoHandled(false);
    setSubmittedBarcode(trimmed);
    setPhase("loading");
  };

  const matches = lookupQuery.data ?? [];
  const isBusy = phase === "loading" && lookupQuery.isFetching;
  const showInvalid =
    phase === "invalid" ||
    (phase === "ready" && submittedBarcode != null && isLookupInputInvalid(inputValue));
  const showEmpty =
    phase === "ready" &&
    !lookupQuery.isError &&
    submittedBarcode != null &&
    matches.length === 0;
  const showMultiple = phase === "ready" && matches.length > 1;
  const showSingleReadOnly =
    phase === "ready" && matches.length === 1 && !canManage;
  const selectedProduct =
    matches.find((product) => product.id === selectedProductId) ?? null;

  const handleConfirmSelection = () => {
    if (!selectedProduct) return;
    onOpenChange(false);
    if (canManage) {
      onEditProduct(selectedProduct);
    }
  };

  const handleAddProduct = () => {
    const barcode = submittedBarcode?.trim();
    if (!barcode) return;
    onOpenChange(false);
    onCreateProduct({ barcode });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="w3" closeLabel={tCommon("common.close")}>
        <DialogHeader>
          <DialogTitle>{t("barcodeLookup.title")}</DialogTitle>
          <DialogDescription>{t("barcodeLookup.description")}</DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-4">
          <form id={formId} onSubmit={handleSubmit} className="space-y-4">
            <Field>
              <FieldLabel htmlFor="barcode-lookup-input">
                {t("barcodeLookup.inputLabel")}
              </FieldLabel>
              <Input
                ref={inputRef}
                id="barcode-lookup-input"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                spellCheck={false}
                value={inputValue}
                onChange={(event) => {
                  setInputValue(event.target.value);
                  if (phase !== "idle") {
                    setPhase("idle");
                    setSubmittedBarcode(null);
                  }
                }}
                placeholder={t("barcodeLookup.inputPlaceholder")}
                aria-describedby="barcode-lookup-status"
              />
            </Field>
            <Button type="submit" disabled={isBusy}>
              {isBusy ? (
                <Loader2 className="animate-spin" aria-hidden="true" />
              ) : (
                <Barcode aria-hidden="true" />
              )}
              {isBusy ? t("barcodeLookup.searching") : t("barcodeLookup.search")}
            </Button>
          </form>

          <div
            id="barcode-lookup-status"
            className="space-y-3"
            aria-live="polite"
            aria-atomic="true"
          >
            {showInvalid ? (
              <p className="flex items-start gap-2 text-sm text-destructive" role="alert">
                <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                {t("barcodeLookup.invalidInput")}
              </p>
            ) : null}

            {lookupQuery.isError && phase === "ready" ? (
              <p className="flex items-start gap-2 text-sm text-destructive" role="alert">
                <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                {isApiError(lookupQuery.error, 403)
                  ? tCommon("errors.forbidden")
                  : parseApiError(lookupQuery.error).detail ||
                    t("barcodeLookup.searchFailed")}
              </p>
            ) : null}

            {showEmpty ? (
              <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-4">
                <p className="flex items-start gap-2 text-sm text-foreground">
                  <PackageSearch
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  {t("barcodeLookup.notFound", { barcode: submittedBarcode })}
                </p>
                {canManage ? (
                  <Button type="button" onClick={handleAddProduct}>
                    {t("barcodeLookup.addProduct")}
                  </Button>
                ) : null}
              </div>
            ) : null}

            {showSingleReadOnly ? (
              <ProductLookupCard product={matches[0]!} />
            ) : null}

            {showMultiple ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">
                  {t("barcodeLookup.multipleTitle", { count: matches.length })}
                </p>
                <FieldSet
                  role="radiogroup"
                  aria-label={t("barcodeLookup.multipleTitle", {
                    count: matches.length,
                  })}
                  className="gap-2"
                >
                  {matches.map((product) => {
                    const inputId = `barcode-match-${product.id}`;
                    const isSelected = selectedProductId === product.id;

                    return (
                      <label
                        key={product.id}
                        htmlFor={inputId}
                        className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card p-3 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                      >
                        <input
                          id={inputId}
                          type="radio"
                          name="barcode-match"
                          value={product.id}
                          checked={isSelected}
                          onChange={() => setSelectedProductId(product.id)}
                          className="mt-1 size-4 shrink-0 accent-primary"
                        />
                        <div className="min-w-0 flex-1 space-y-1">
                          <p className="font-medium text-foreground">{product.name}</p>
                          <p dir="ltr" className="font-mono text-xs text-muted-foreground">
                            {product.sku}
                          </p>
                          <p dir="ltr" className="text-sm tabular-nums">
                            {formatPrice(product.price)}
                          </p>
                          <HandlingBadge handling={product.handling} />
                          {(product.variants?.length ?? 0) > 0 ? (
                            <ProductVariantsExpand
                              productName={product.name}
                              variants={product.variants}
                            />
                          ) : null}
                        </div>
                      </label>
                    );
                  })}
                </FieldSet>
              </div>
            ) : null}
          </div>
        </DialogBody>

        {showMultiple && canManage ? (
          <DialogFooter>
            <Button
              type="button"
              onClick={handleConfirmSelection}
              disabled={!selectedProduct}
            >
              {t("barcodeLookup.openSelected")}
            </Button>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function ProductLookupCard({ product }: { product: Product }) {
  const { t } = useTranslation("products");

  return (
    <article className="space-y-2 rounded-xl border border-border bg-card p-4">
      <h3 className="font-semibold text-foreground">{product.name}</h3>
      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">{t("table.sku")}</dt>
          <dd dir="ltr" className="font-mono">
            {product.sku}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("table.price")}</dt>
          <dd dir="ltr" className="tabular-nums">
            {formatPrice(product.price)}
          </dd>
        </div>
      </dl>
      <HandlingBadge handling={product.handling} />
      {(product.variants?.length ?? 0) > 0 ? (
        <ProductVariantsExpand
          productName={product.name}
          variants={product.variants}
        />
      ) : null}
    </article>
  );
}
