import {
  ArrowDown,
  ArrowUp,
  Plus,
  Trash2,
} from "lucide-react";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  countAxisCombinations,
  createFlatVariantRow,
  createVariantAxis,
  createVariantAxisValue,
  generateVariantRowsFromAxes,
  hasVariantFormErrors,
  productVariantsToFlatRows,
  toVariantRequests,
  validateFlatVariantRows,
  validateGeneratedVariantRows,
  validateVariantAxes,
  variantRequestsEqual,
  type FlatVariantRow,
  type GeneratedVariantRow,
  type VariantAxis,
  type VariantFormErrors,
} from "@/features/products/lib/product-variants";
import type { ProductVariant, VariantRequest } from "@/features/products/types";
import {
  Button,
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  Input,
  Switch,
} from "@/shared/components/ui";

export interface ProductVariantsEditorHandle {
  hasVariants: boolean;
  getVariantRequests: () => VariantRequest[];
  validate: () => VariantFormErrors;
  isDirty: () => boolean;
  getRowIds: () => string[];
  getRows: () => Array<{ id: string; name: string }>;
}

interface ProductVariantsEditorProps {
  mode: "create" | "edit";
  formId: string;
  disabled?: boolean;
  initialVariants?: ProductVariant[];
  resetKey: string;
  serverErrors?: VariantFormErrors;
}

function buildInitialEditState(variants: ProductVariant[]) {
  const rows = productVariantsToFlatRows(variants);
  return {
    hasVariants: rows.length > 0,
    flatRows: rows.length > 0 ? rows : [createFlatVariantRow()],
    baseline: toVariantRequests(rows),
  };
}

export const ProductVariantsEditor = forwardRef<
  ProductVariantsEditorHandle,
  ProductVariantsEditorProps
>(function ProductVariantsEditor(
  {
    mode,
    formId,
    disabled = false,
    initialVariants = [],
    resetKey,
    serverErrors,
  },
  ref,
) {
  const { t } = useTranslation("products");
  const [hasVariants, setHasVariants] = useState(false);
  const [axes, setAxes] = useState<VariantAxis[]>([createVariantAxis()]);
  const [generatedRows, setGeneratedRows] = useState<GeneratedVariantRow[]>(
    [],
  );
  const [flatRows, setFlatRows] = useState<FlatVariantRow[]>([
    createFlatVariantRow(),
  ]);
  const [baselineRequests, setBaselineRequests] = useState<VariantRequest[]>(
    [],
  );
  const [localErrors, setLocalErrors] = useState<VariantFormErrors>({});

  useEffect(() => {
    if (mode === "edit") {
      const initial = buildInitialEditState(initialVariants);
      setHasVariants(initial.hasVariants);
      setFlatRows(initial.flatRows);
      setBaselineRequests(initial.baseline);
      setAxes([createVariantAxis()]);
      setGeneratedRows([]);
      setLocalErrors({});
      return;
    }

    setHasVariants(false);
    setAxes([createVariantAxis()]);
    setGeneratedRows([]);
    setFlatRows([createFlatVariantRow()]);
    setBaselineRequests([]);
    setLocalErrors({});
  }, [mode, resetKey, initialVariants]);

  useEffect(() => {
    if (mode !== "create" || !hasVariants) {
      setGeneratedRows([]);
      return;
    }

    const priceMap = new Map(
      generatedRows.map((row) => [row.name, row.price] as const),
    );
    setGeneratedRows(generateVariantRowsFromAxes(axes, priceMap));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [axes, hasVariants, mode]);

  const combinationCount = useMemo(
    () => (mode === "create" && hasVariants ? countAxisCombinations(axes) : 0),
    [axes, hasVariants, mode],
  );

  const mergedErrors = useMemo(() => {
    const rows = { ...(localErrors.rows ?? {}), ...(serverErrors?.rows ?? {}) };
    return {
      global: serverErrors?.global ?? localErrors.global,
      rows: Object.keys(rows).length > 0 ? rows : undefined,
    } satisfies VariantFormErrors;
  }, [localErrors, serverErrors]);

  const activeRows =
    mode === "create"
      ? generatedRows
      : hasVariants
        ? flatRows
        : [];

  useImperativeHandle(
    ref,
    () => ({
      hasVariants,
      getVariantRequests: () =>
        hasVariants ? toVariantRequests(activeRows) : [],
      validate: () => {
        if (!hasVariants) {
          setLocalErrors({});
          return {};
        }

        const axisErrors =
          mode === "create" ? validateVariantAxes(axes, t) : {};
        const rowErrors =
          mode === "create"
            ? validateGeneratedVariantRows(generatedRows, t)
            : validateFlatVariantRows(flatRows, t);

        const combined: VariantFormErrors = {
          global: axisErrors.global ?? rowErrors.global,
          rows: {
            ...(axisErrors.rows ?? {}),
            ...(rowErrors.rows ?? {}),
          },
        };

        if (combined.rows && Object.keys(combined.rows).length === 0) {
          delete combined.rows;
        }

        setLocalErrors(combined);
        return combined;
      },
      isDirty: () => {
        if (mode === "create") return hasVariants;
        const current = hasVariants ? toVariantRequests(flatRows) : [];
        return !variantRequestsEqual(current, baselineRequests);
      },
      getRowIds: () => activeRows.map((row) => row.id),
      getRows: () =>
        activeRows.map((row) => ({ id: row.id, name: row.name })),
    }),
    [
      activeRows,
      axes,
      baselineRequests,
      flatRows,
      generatedRows,
      hasVariants,
      mode,
      t,
    ],
  );

  const updateAxis = (axisId: string, patch: Partial<VariantAxis>) => {
    setAxes((current) =>
      current.map((axis) =>
        axis.id === axisId ? { ...axis, ...patch } : axis,
      ),
    );
  };

  const updateAxisValue = (
    axisId: string,
    valueId: string,
    value: string,
  ) => {
    setAxes((current) =>
      current.map((axis) => {
        if (axis.id !== axisId) return axis;
        return {
          ...axis,
          values: axis.values.map((entry) =>
            entry.id === valueId ? { ...entry, value } : entry,
          ),
        };
      }),
    );
  };

  const addAxisValue = (axisId: string) => {
    setAxes((current) =>
      current.map((axis) =>
        axis.id === axisId
          ? { ...axis, values: [...axis.values, createVariantAxisValue()] }
          : axis,
      ),
    );
  };

  const removeAxisValue = (axisId: string, valueId: string) => {
    setAxes((current) =>
      current.map((axis) => {
        if (axis.id !== axisId) return axis;
        const nextValues = axis.values.filter((entry) => entry.id !== valueId);
        return {
          ...axis,
          values:
            nextValues.length > 0 ? nextValues : [createVariantAxisValue()],
        };
      }),
    );
  };

  const removeAxis = (axisId: string) => {
    setAxes((current) => {
      const next = current.filter((axis) => axis.id !== axisId);
      return next.length > 0 ? next : [createVariantAxis()];
    });
  };

  const updateGeneratedRowPrice = (rowId: string, price: string) => {
    setGeneratedRows((current) =>
      current.map((row) => (row.id === rowId ? { ...row, price } : row)),
    );
  };

  const updateFlatRow = (
    rowId: string,
    patch: Partial<Pick<FlatVariantRow, "name" | "price">>,
  ) => {
    setFlatRows((current) =>
      current.map((row) => (row.id === rowId ? { ...row, ...patch } : row)),
    );
  };

  const moveFlatRow = (rowId: string, direction: "up" | "down") => {
    setFlatRows((current) => {
      const index = current.findIndex((row) => row.id === rowId);
      if (index === -1) return current;

      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= current.length) return current;

      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(targetIndex, 0, item!);
      return next;
    });
  };

  const removeFlatRow = (rowId: string) => {
    setFlatRows((current) => {
      const next = current.filter((row) => row.id !== rowId);
      return next.length > 0 ? next : [createFlatVariantRow()];
    });
  };

  const toggleHintId = `${formId}-variants-toggle-hint`;

  return (
    <FieldSet>
      <FieldLegend>{t("form.variants.legend")}</FieldLegend>

      <Field
        orientation="horizontal"
        className="items-center justify-between rounded-lg border border-border/60 px-4 py-3"
      >
        <div className="space-y-0.5">
          <FieldLabel htmlFor={`${formId}-has-variants`}>
            {t("form.variants.toggleLabel")}
          </FieldLabel>
          <FieldDescription id={toggleHintId}>
            {t("form.variants.toggleHint")}
          </FieldDescription>
        </div>
        <Switch
          id={`${formId}-has-variants`}
          checked={hasVariants}
          disabled={disabled}
          aria-describedby={toggleHintId}
          onCheckedChange={(checked) => {
            setHasVariants(checked);
            setLocalErrors({});
            if (checked && mode === "edit" && flatRows.length === 0) {
              setFlatRows([createFlatVariantRow()]);
            }
          }}
        />
      </Field>

      {hasVariants ? (
        <FieldGroup className="gap-4 pt-2">
          <FieldDescription>
            {mode === "create"
              ? t("form.variants.createHint")
              : t("form.variants.editHint")}
          </FieldDescription>

          {mergedErrors.global ? (
            <p
              className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
              role="alert"
            >
              {mergedErrors.global}
            </p>
          ) : null}

          {mode === "create" ? (
            <>
              <div className="space-y-4">
                {axes.map((axis, axisIndex) => (
                  <div
                    key={axis.id}
                    className="space-y-3 rounded-lg border border-border/60 p-4"
                  >
                    <div className="flex flex-wrap items-end gap-3">
                      <Field className="min-w-[12rem] flex-1">
                        <FieldLabel htmlFor={`${formId}-axis-name-${axis.id}`}>
                          {t("form.variants.axisName")}
                        </FieldLabel>
                        <Input
                          id={`${formId}-axis-name-${axis.id}`}
                          value={axis.name}
                          disabled={disabled}
                          placeholder={t("form.variants.axisNamePlaceholder")}
                          onChange={(event) =>
                            updateAxis(axis.id, { name: event.target.value })
                          }
                        />
                      </Field>
                      {axes.length > 1 ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={disabled}
                          onClick={() => removeAxis(axis.id)}
                        >
                          <Trash2 aria-hidden="true" />
                          {t("form.variants.removeAxis", {
                            name: axis.name || `#${axisIndex + 1}`,
                          })}
                        </Button>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      {axis.values.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex flex-wrap items-end gap-2"
                        >
                          <Field className="min-w-[12rem] flex-1">
                            <FieldLabel
                              htmlFor={`${formId}-axis-value-${entry.id}`}
                            >
                              {t("form.variants.axisValue")}
                            </FieldLabel>
                            <Input
                              id={`${formId}-axis-value-${entry.id}`}
                              dir="auto"
                              value={entry.value}
                              disabled={disabled}
                              placeholder={t(
                                "form.variants.axisValuePlaceholder",
                              )}
                              onChange={(event) =>
                                updateAxisValue(
                                  axis.id,
                                  entry.id,
                                  event.target.value,
                                )
                              }
                            />
                          </Field>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            disabled={disabled}
                            aria-label={t("form.variants.removeAxisValue", {
                              value: entry.value || t("form.variants.axisValue"),
                              name: axis.name || t("form.variants.axisName"),
                            })}
                            onClick={() => removeAxisValue(axis.id, entry.id)}
                          >
                            <Trash2 aria-hidden="true" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={disabled}
                        onClick={() => addAxisValue(axis.id)}
                      >
                        <Plus aria-hidden="true" />
                        {t("form.variants.addAxisValue", {
                          name: axis.name || t("form.variants.axisName"),
                        })}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={disabled}
                  onClick={() => setAxes((current) => [...current, createVariantAxis()])}
                >
                  <Plus aria-hidden="true" />
                  {t("form.variants.addAxis")}
                </Button>
                <p
                  className="text-sm text-muted-foreground"
                  aria-live="polite"
                >
                  {t("form.variants.combinationCountLive", {
                    count: combinationCount,
                  })}
                </p>
              </div>

              {generatedRows.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t("form.variants.emptyCreate")}
                </p>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-border/60">
                  <table className="w-full min-w-[32rem] border-collapse text-sm">
                    <caption className="sr-only">
                      {t("form.variants.tableCaption")}
                    </caption>
                    <thead>
                      <tr className="border-b border-border/60 bg-muted/30">
                        <th scope="col" className="px-4 py-2 text-start text-xs font-medium text-muted-foreground">
                          {t("form.variants.columnLabel")}
                        </th>
                        <th scope="col" className="px-4 py-2 text-start text-xs font-medium text-muted-foreground">
                          {t("form.variants.columnPrice")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {generatedRows.map((row) => {
                        const rowError = mergedErrors.rows?.[row.id];
                        return (
                          <tr key={row.id}>
                            <td className="px-4 py-3 align-top">
                              <span dir="auto" className="font-medium text-foreground">
                                {row.name}
                              </span>
                            </td>
                            <td className="px-4 py-3 align-top">
                              <Field data-invalid={Boolean(rowError?.price) || undefined}>
                                <Input
                                  id={`${formId}-variant-price-${row.id}`}
                                  dir="ltr"
                                  inputMode="decimal"
                                  disabled={disabled}
                                  value={row.price}
                                  placeholder={t("form.variants.pricePlaceholder")}
                                  aria-invalid={Boolean(rowError?.price) || undefined}
                                  aria-describedby={`${formId}-variant-price-hint-${row.id}`}
                                  className="tabular-nums"
                                  onChange={(event) =>
                                    updateGeneratedRowPrice(
                                      row.id,
                                      event.target.value,
                                    )
                                  }
                                />
                                <FieldDescription id={`${formId}-variant-price-hint-${row.id}`}>
                                  {t("form.variants.priceHint")}
                                </FieldDescription>
                                <FieldError
                                  errors={
                                    rowError?.price
                                      ? [{ message: rowError.price }]
                                      : undefined
                                  }
                                />
                              </Field>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <>
              {flatRows.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t("form.variants.emptyEdit")}
                </p>
              ) : (
                <div className="space-y-3">
                  {flatRows.map((row, index) => {
                    const rowError = mergedErrors.rows?.[row.id];
                    return (
                      <div
                        key={row.id}
                        className="space-y-3 rounded-lg border border-border/60 p-4"
                      >
                        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_12rem_auto]">
                          <Field data-invalid={Boolean(rowError?.name) || undefined}>
                            <FieldLabel htmlFor={`${formId}-variant-name-${row.id}`}>
                              {t("form.variants.rowName")}
                            </FieldLabel>
                            <Input
                              id={`${formId}-variant-name-${row.id}`}
                              dir="auto"
                              disabled={disabled}
                              value={row.name}
                              placeholder={t("form.variants.rowNamePlaceholder")}
                              aria-invalid={Boolean(rowError?.name) || undefined}
                              onChange={(event) =>
                                updateFlatRow(row.id, { name: event.target.value })
                              }
                            />
                            <FieldError
                              errors={
                                rowError?.name
                                  ? [{ message: rowError.name }]
                                  : undefined
                              }
                            />
                          </Field>

                          <Field data-invalid={Boolean(rowError?.price) || undefined}>
                            <FieldLabel htmlFor={`${formId}-variant-price-${row.id}`}>
                              {t("form.variants.columnPrice")}
                            </FieldLabel>
                            <Input
                              id={`${formId}-variant-price-${row.id}`}
                              dir="ltr"
                              inputMode="decimal"
                              disabled={disabled}
                              value={row.price}
                              placeholder={t("form.variants.pricePlaceholder")}
                              aria-invalid={Boolean(rowError?.price) || undefined}
                              className="tabular-nums"
                              onChange={(event) =>
                                updateFlatRow(row.id, { price: event.target.value })
                              }
                            />
                            <FieldError
                              errors={
                                rowError?.price
                                  ? [{ message: rowError.price }]
                                  : undefined
                              }
                            />
                          </Field>

                          <div className="flex items-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon-sm"
                              disabled={disabled || index === 0}
                              aria-label={t("form.variants.moveUp", {
                                name: row.name || t("form.variants.rowName"),
                              })}
                              onClick={() => moveFlatRow(row.id, "up")}
                            >
                              <ArrowUp aria-hidden="true" />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon-sm"
                              disabled={disabled || index === flatRows.length - 1}
                              aria-label={t("form.variants.moveDown", {
                                name: row.name || t("form.variants.rowName"),
                              })}
                              onClick={() => moveFlatRow(row.id, "down")}
                            >
                              <ArrowDown aria-hidden="true" />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon-sm"
                              disabled={disabled}
                              aria-label={t("form.variants.removeRow", {
                                name: row.name || t("form.variants.rowName"),
                              })}
                              onClick={() => removeFlatRow(row.id)}
                            >
                              <Trash2 aria-hidden="true" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled}
                onClick={() =>
                  setFlatRows((current) => [...current, createFlatVariantRow()])
                }
              >
                <Plus aria-hidden="true" />
                {t("form.variants.addRow")}
              </Button>
            </>
          )}
        </FieldGroup>
      ) : null}
    </FieldSet>
  );
});

export { hasVariantFormErrors };
