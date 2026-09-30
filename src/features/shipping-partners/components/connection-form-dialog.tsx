import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { FormEvent, RefObject } from "react";
import { Loader2 } from "lucide-react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  OptionFields,
  SecretFields,
} from "@/features/shipping-partners/components/connection-fields";
import {
  activateCarrierConnection,
  createCarrierConnection,
  deactivateCarrierConnection,
  updateCarrierConnection,
} from "@/features/shipping-partners/api/shipping-partners.api";
import { useCarrierConnection } from "@/features/shipping-partners/hooks/use-carrier-connection";
import { useInvalidateCarrierConnections } from "@/features/shipping-partners/hooks/use-invalidate-carrier-connections";
import { useTestCarrierConnection } from "@/features/shipping-partners/hooks/use-test-carrier-connection";
import { carrierDisplayName } from "@/features/shipping-partners/lib/carrier-label";
import {
  applyConnectionFieldErrors,
  isRequestCanceled,
} from "@/features/shipping-partners/lib/connection-form-errors";
import {
  buildConnectionFormValues,
  credentialFingerprint,
  nonEmptyCredentials,
  pickupFieldKey,
  preferredPickupId,
  savedPickupId,
  toCreatePayload,
  toUpdatePayload,
} from "@/features/shipping-partners/lib/connection-payload";
import {
  createConnectionFormSchema,
  type ConnectionValidationContext,
} from "@/features/shipping-partners/schema";
import type {
  Carrier,
  CarrierConnection,
  ConnectionFormValues,
  PickupLocation,
} from "@/features/shipping-partners/types";
import { isApiError, parseApiError } from "@/shared/api/error-handler";
import { useAppForm } from "@/shared/hooks/use-app-form";
import { cn } from "@/shared/lib/utils";
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
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
  Switch,
} from "@/shared/components/ui";

interface ConnectionFormDialogProps {
  mode: "create" | "edit";
  carrier: Carrier | null;
  connection: CarrierConnection | null;
  open: boolean;
  restoreFocusRef: RefObject<HTMLElement | null>;
  onOpenChange: (open: boolean) => void;
}

interface TestErrorState {
  outage: boolean;
  message: string;
}

interface SuccessfulTest {
  locations: PickupLocation[];
  fingerprint: string;
}

export function ConnectionFormDialog({
  mode,
  carrier,
  connection,
  open,
  restoreFocusRef,
  onOpenChange,
}: ConnectionFormDialogProps) {
  const { t, i18n } = useTranslation("shippingPartners");
  const { t: tCommon } = useTranslation("common");
  const formId = useId();
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const pendingFocus = useRef(false);
  const hydrated = useRef(false);
  const wasOpen = useRef(open);
  const contextRef = useRef<ConnectionValidationContext>({
    step: 1,
    mode,
    fields: [],
    pickupIds: [],
    savedPickupId: "",
  });

  const connectionId = connection?.id ?? null;
  const connectionQuery = useCarrierConnection(connectionId, {
    enabled: open && mode === "edit" && Boolean(connectionId),
  });
  const { test, isPending: isTesting, reset: resetTest } =
    useTestCarrierConnection();
  const invalidate = useInvalidateCarrierConnections();

  const [step, setStep] = useState<1 | 2>(1);
  const [successfulTest, setSuccessfulTest] = useState<SuccessfulTest | null>(
    null,
  );
  const [testError, setTestError] = useState<TestErrorState | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);

  const fields = carrier?.fields ?? [];
  const source = connectionQuery.data ?? connection;
  const savedPickup = savedPickupId(source, fields);

  const schema = useMemo(
    () => createConnectionFormSchema(t, () => contextRef.current),
    // Language changes must rebuild messages.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, i18n.language],
  );

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    getValues,
    setValue,
    trigger,
    watch,
    formState: { errors },
  } = useAppForm({
    schema,
    defaultValues: buildConnectionFormValues(fields),
  });

  const credentials = watch("credentials");
  const fingerprint = credentialFingerprint(credentials ?? {});
  const testIsCurrent =
    successfulTest !== null && successfulTest.fingerprint === fingerprint;
  const pickupLocations = testIsCurrent ? successfulTest.locations : [];

  contextRef.current = {
    step,
    mode,
    fields,
    pickupIds: pickupLocations.map((location) => location.id),
    savedPickupId: savedPickup,
  };

  useEffect(() => {
    if (open) return;
    resetTest();
    setSuccessfulTest(null);
    setTestError(null);
    setGlobalError(null);
    setRevealed({});
    setStep(1);
    setIsSaving(false);
    hydrated.current = false;
    reset(buildConnectionFormValues([]));
  }, [open, reset, resetTest]);

  useEffect(() => {
    if (!open || hydrated.current || !carrier) return;

    if (mode === "create") {
      reset(buildConnectionFormValues(carrier.fields));
      setStep(1);
      hydrated.current = true;
      return;
    }

    if (connectionQuery.isLoading && !source) return;
    if (!source) return;

    reset(buildConnectionFormValues(carrier.fields, source));
    setStep(2);
    hydrated.current = true;
  }, [
    open,
    mode,
    carrier,
    source,
    connectionQuery.isLoading,
    reset,
  ]);

  useEffect(() => {
    if (!open || step !== 2 || !pendingFocus.current) return;
    const frame = window.requestAnimationFrame(() => {
      stepHeadingRef.current?.focus();
      pendingFocus.current = false;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open, step]);

  useEffect(() => {
    const previous = wasOpen.current;
    wasOpen.current = open;
    if (!previous || open) return;

    const node = restoreFocusRef.current;
    if (!node?.isConnected) return;
    const frame = window.requestAnimationFrame(() => node.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [open, restoreFocusRef]);

  const busy = isSaving || isTesting;
  const isLoading =
    open &&
    mode === "edit" &&
    connectionQuery.isLoading &&
    !connectionQuery.data &&
    !hydrated.current;

  const carrierName = carrier
    ? carrierDisplayName(carrier, i18n.language)
    : "";

  const runTest = async () => {
    if (!carrier) return;
    contextRef.current = { ...contextRef.current, step: 1 };
    const valid = await trigger("credentials");
    if (!valid) return;

    setTestError(null);
    setGlobalError(null);

    const credentials = nonEmptyCredentials(getValues("credentials"));
    if (Object.keys(credentials).length === 0) {
      const secret = carrier.fields.find((field) => field.kind === "SECRET");
      if (secret) {
        setError(`credentials.${secret.key}`, {
          type: "manual",
          message: t("form.required"),
        });
      }
      return;
    }

    try {
      const result = await test(carrier.code, credentials);
      const locations = result.pickupLocations ?? [];
      const nextFingerprint = credentialFingerprint(getValues("credentials"));
      setSuccessfulTest({ locations, fingerprint: nextFingerprint });

      const key = pickupFieldKey(carrier.fields);
      if (key) {
        const current = String(getValues().options[key] ?? "");
        const known = new Set(locations.map((location) => location.id));
        if (!current || !known.has(current)) {
          setValue(`options.${key}`, preferredPickupId(locations) ?? "", {
            shouldDirty: true,
          });
        }
      }

      pendingFocus.current = true;
      setStep(2);
    } catch (error) {
      if (isRequestCanceled(error)) return;
      setSuccessfulTest(null);
      setTestError({
        outage: isApiError(error, 502),
        message: parseApiError(error).detail,
      });
    }
  };

  const save = async (values: ConnectionFormValues) => {
    if (!carrier) return;
    const currentFingerprint = credentialFingerprint(values.credentials);
    const tested =
      successfulTest !== null &&
      successfulTest.fingerprint === currentFingerprint;
    const pickupKey = pickupFieldKey(carrier.fields);
    const nextPickup = pickupKey ? String(values.options[pickupKey] ?? "") : "";
    const previousPickup = savedPickupId(source, carrier.fields);

    if (mode === "create" && !tested) {
      setStep(1);
      setGlobalError(t("form.testRequired"));
      return;
    }

    if (mode === "edit" && currentFingerprint !== "[]" && !tested) {
      setStep(1);
      setGlobalError(t("form.retestRequired"));
      return;
    }

    if (mode === "edit" && nextPickup !== previousPickup && !tested) {
      setStep(1);
      setGlobalError(t("form.retestForPickup"));
      return;
    }

    setIsSaving(true);
    setGlobalError(null);

    try {
      if (mode === "create") {
        const created = await createCarrierConnection(
          toCreatePayload(carrier.code, carrier.fields, values),
        );
        let latest = created;
        if (!values.active) {
          try {
            latest = await deactivateCarrierConnection(created.id);
          } catch (error) {
            invalidate(created);
            toast.error(
              parseApiError(error).detail || t("toast.savedStatusFailed"),
            );
            onOpenChange(false);
            return;
          }
        }
        invalidate(latest);
        toast.success(t("toast.created"));
        onOpenChange(false);
        return;
      }

      if (!connectionId || !source) return;

      const updated = await updateCarrierConnection(
        connectionId,
        toUpdatePayload(carrier.fields, values),
      );
      let latest = updated;
      if (values.active !== source.active) {
        try {
          latest = values.active
            ? await activateCarrierConnection(connectionId)
            : await deactivateCarrierConnection(connectionId);
        } catch (error) {
          invalidate(updated);
          toast.error(
            parseApiError(error).detail || t("toast.savedStatusFailed"),
          );
          onOpenChange(false);
          return;
        }
      }
      invalidate(latest);
      toast.success(t("toast.updated"));
      onOpenChange(false);
    } catch (error) {
      const applied = applyConnectionFieldErrors(error, carrier.fields, setError);
      if (applied.step) setStep(applied.step);
      if (applied.global) {
        setGlobalError(applied.global);
      } else if (!applied.step) {
        setGlobalError(parseApiError(error).detail || t("toast.saveFailed"));
      } else {
        setGlobalError(null);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step === 1) {
      void runTest();
      return;
    }
    contextRef.current = { ...contextRef.current, step: 2 };
    void handleSubmit(save)(event);
  };

  const stepLabel =
    step === 1 ? t("form.stepCredentials") : t("form.stepSettings");

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (busy) return;
        onOpenChange(next);
      }}
    >
      <DialogContent
        size="w6"
        className="gap-0 overflow-hidden"
        showCloseButton={!busy}
        closeLabel={tCommon("common.close")}
      >
        <DialogHeader className="border-b border-border/60 pe-10">
          <DialogTitle>
            {mode === "create"
              ? t("form.createTitle", { carrier: carrierName })
              : t("form.editTitle", { name: source?.name ?? carrierName })}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? t("form.createDescription")
              : t("form.editDescription")}
          </DialogDescription>
        </DialogHeader>

        {isLoading || !carrier ? (
          <div
            className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-muted-foreground"
            role="status"
          >
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            {t("form.loading")}
          </div>
        ) : (
          <form
            id={formId}
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
            onSubmit={onSubmit}
            noValidate
          >
            <DialogBody className="space-y-4">
              <ol
                aria-label={t("form.stepsLabel")}
                className="flex flex-wrap gap-2"
              >
                {([1, 2] as const).map((item) => {
                  const locked = item === 2 && mode === "create" && !testIsCurrent;
                  const current = step === item;
                  return (
                    <li key={item}>
                      <button
                        type="button"
                        aria-current={current ? "step" : undefined}
                        disabled={locked || busy}
                        className={cn(
                          "rounded-full border px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          current
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-foreground",
                        )}
                        onClick={() => setStep(item)}
                      >
                        {item === 1
                          ? t("form.stepCredentials")
                          : t("form.stepSettings")}
                      </button>
                    </li>
                  );
                })}
              </ol>

              <h2
                ref={stepHeadingRef}
                tabIndex={-1}
                className="text-sm font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {t("form.stepHeading", {
                  current: step,
                  total: 2,
                  label: stepLabel,
                })}
              </h2>

              {globalError ? (
                <p
                  role="alert"
                  className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
                >
                  {globalError}
                </p>
              ) : null}

              <FieldGroup className="gap-4">
                {step === 1 ? (
                  <>
                    <SecretFields
                      formId={formId}
                      fields={fields}
                      control={control}
                      errors={errors}
                      revealed={revealed}
                      credentialHint={
                        mode === "edit" ? (source?.credentialHint ?? null) : null
                      }
                      preserveSaved={mode === "edit"}
                      disabled={busy}
                      onToggleReveal={(key) =>
                        setRevealed((current) => ({
                          ...current,
                          [key]: !current[key],
                        }))
                      }
                    />
                    {testError ? (
                      <div
                        role="alert"
                        className="space-y-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
                      >
                        <p>{testError.message}</p>
                        {testError.outage ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={busy}
                            onClick={() => void runTest()}
                          >
                            {t("form.retry")}
                          </Button>
                        ) : null}
                      </div>
                    ) : null}
                  </>
                ) : (
                  <>
                    {testIsCurrent ? (
                      <p role="status" className="text-sm text-foreground">
                        {pickupLocations.length > 0
                          ? t("form.testSuccess", {
                              count: pickupLocations.length,
                            })
                          : t("form.testSuccessNone")}
                      </p>
                    ) : null}

                    <Field data-invalid={Boolean(errors.name) || undefined}>
                      <FieldLabel htmlFor={`${formId}-name`}>
                        {t("form.name")}
                        <span className="text-destructive" aria-hidden="true">
                          {" "}
                          *
                        </span>
                        <span className="sr-only">
                          {" "}
                          ({t("form.requiredSuffix")})
                        </span>
                      </FieldLabel>
                      <Input
                        id={`${formId}-name`}
                        placeholder={t("form.namePlaceholder")}
                        autoComplete="off"
                        disabled={busy}
                        aria-invalid={Boolean(errors.name) || undefined}
                        aria-describedby={
                          errors.name ? `${formId}-name-error` : undefined
                        }
                        aria-required="true"
                        {...register("name")}
                      />
                      <FieldError
                        id={`${formId}-name-error`}
                        errors={errors.name ? [errors.name] : undefined}
                      />
                    </Field>

                    <Controller
                      name="active"
                      control={control}
                      render={({ field }) => (
                        <Field orientation="horizontal">
                          <Switch
                            id={`${formId}-active`}
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={busy}
                          />
                          <div>
                            <FieldLabel htmlFor={`${formId}-active`}>
                              {t("form.active")}
                            </FieldLabel>
                            <FieldDescription>
                              {t("form.activeHint")}
                            </FieldDescription>
                          </div>
                        </Field>
                      )}
                    />

                    <OptionFields
                      formId={formId}
                      fields={fields}
                      control={control}
                      errors={errors}
                      pickupLocations={pickupLocations}
                      savedPickupId={savedPickup}
                      disabled={busy}
                    />
                  </>
                )}
              </FieldGroup>
            </DialogBody>

            <DialogFooter>
              {step === 2 ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={busy}
                  onClick={() => setStep(1)}
                >
                  {t("form.back")}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  disabled={busy}
                  onClick={() => onOpenChange(false)}
                >
                  {t("form.cancel")}
                </Button>
              )}
              {step === 1 ? (
                <Button type="submit" disabled={busy}>
                  {isTesting ? (
                    <>
                      <Loader2 className="animate-spin" aria-hidden="true" />
                      {t("form.testing")}
                    </>
                  ) : (
                    t("form.test")
                  )}
                </Button>
              ) : (
                <Button type="submit" disabled={busy}>
                  {isSaving ? (
                    <>
                      <Loader2 className="animate-spin" aria-hidden="true" />
                      {t("form.saving")}
                    </>
                  ) : (
                    t("form.save")
                  )}
                </Button>
              )}
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
