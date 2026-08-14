import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
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
  FieldLegend,
  FieldSet,
  Input,
  Textarea,
} from "@/shared/components/ui";
import { useMe } from "@/features/account/hooks/use-me";
import { AreaComboboxField } from "@/features/locations/components/area-combobox";
import { CoordinateMapPickerDialog } from "@/features/locations/components/coordinate-map-picker-dialog";
import { GovernorateSelectField } from "@/features/locations/components/governorate-select";
import {
  handleCreateLocationError,
  useCreateSenderLocation,
} from "@/features/locations/hooks/use-create-sender-location";
import { useSenderLocation } from "@/features/locations/hooks/use-sender-location";
import {
  handleUpdateLocationError,
  useUpdateSenderLocation,
} from "@/features/locations/hooks/use-update-sender-location";
import {
  toLocationFormValues,
  toSenderLocationPayload,
} from "@/features/locations/lib/location-form-errors";
import {
  createLocationFormSchema,
  EMPTY_LOCATION_FORM_VALUES,
  type LocationFormValues,
} from "@/features/locations/schema";
import type { SenderLocation } from "@/features/locations/types";
import { useAppForm } from "@/shared/hooks/use-app-form";
import { GOOGLE_MAPS_API_KEY } from "@/shared/lib/constants";
import { isGoogleMapsConfigured } from "@/shared/lib/google-maps-loader";

interface LocationFormDialogProps {
  mode: "create" | "edit";
  location: SenderLocation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LocationFormDialog({
  mode,
  location,
  open,
  onOpenChange,
}: LocationFormDialogProps) {
  const { t, i18n } = useTranslation("locations");
  const { t: tCommon } = useTranslation("common");
  const formId = useId();
  const coordinatesGroupId = `${formId}-coordinates`;
  const [mapPickerOpen, setMapPickerOpen] = useState(false);
  const meQuery = useMe();
  const locationId = location?.id ?? null;

  const locationQuery = useSenderLocation(locationId, {
    enabled: open && mode === "edit" && Boolean(locationId),
  });
  const createMutation = useCreateSenderLocation();
  const updateMutation = useUpdateSenderLocation(locationId ?? "");

  const schema = useMemo(
    () => createLocationFormSchema(t),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, i18n.language],
  );

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useAppForm({
    schema,
    defaultValues: EMPTY_LOCATION_FORM_VALUES,
    mode: "onBlur",
  });

  const governorateId = watch("governorateId");
  const areaValue = watch("area");
  const latitudeValue = watch("latitude");
  const longitudeValue = watch("longitude");
  const mapsEnabled = isGoogleMapsConfigured(GOOGLE_MAPS_API_KEY);

  useEffect(() => {
    if (!open) {
      reset(EMPTY_LOCATION_FORM_VALUES);
      return;
    }

    if (mode === "edit") {
      const source = locationQuery.data ?? location;
      if (!source) return;
      reset(toLocationFormValues(source));
      return;
    }

    const me = meQuery.data;
    reset({
      ...EMPTY_LOCATION_FORM_VALUES,
      contactName: me?.fullName ?? "",
      contactPhone: me?.phone ?? "",
      contactEmail: me?.email ?? "",
    });
  }, [open, mode, location, locationQuery.data, meQuery.data, reset]);

  const previousGovernorateRef = useRef<string>("");

  useEffect(() => {
    if (!open) {
      previousGovernorateRef.current = "";
      return;
    }

    if (mode !== "create") {
      previousGovernorateRef.current = governorateId;
      return;
    }

    if (
      previousGovernorateRef.current &&
      previousGovernorateRef.current !== governorateId
    ) {
      setValue("area", "");
    }

    previousGovernorateRef.current = governorateId;
  }, [governorateId, mode, open, setValue]);

  const busy =
    isSubmitting || createMutation.isPending || updateMutation.isPending;
  const isLoading =
    open && mode === "edit" && locationQuery.isLoading && !locationQuery.data;

  const coordinateGroupError =
    errors.root?.message ||
    (errors.root as { coordinatePairComplete?: { message?: string } } | undefined)
      ?.coordinatePairComplete?.message;

  const onSubmit = handleSubmit(async (values: LocationFormValues) => {
    const payload = toSenderLocationPayload(values);

    try {
      if (mode === "create") {
        await createMutation.mutateAsync(payload);
      } else if (locationId) {
        await updateMutation.mutateAsync(payload);
      }
      onOpenChange(false);
    } catch (error) {
      if (mode === "create") {
        handleCreateLocationError(error, setError);
      } else {
        handleUpdateLocationError(error, setError);
      }
    }
  });

  const title = mode === "create" ? t("form.createTitle") : t("form.editTitle");
  const description =
    mode === "create" ? t("form.createDescription") : t("form.editDescription");

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
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {isLoading ? (
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
              <FieldGroup className="gap-4">
                <Field data-invalid={Boolean(errors.name) || undefined}>
                  <FieldLabel htmlFor={`${formId}-name`}>
                    {t("form.name")}
                  </FieldLabel>
                  <Input
                    id={`${formId}-name`}
                    aria-invalid={Boolean(errors.name) || undefined}
                    {...register("name")}
                  />
                  <FieldError errors={errors.name ? [errors.name] : undefined} />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field data-invalid={Boolean(errors.contactName) || undefined}>
                    <FieldLabel htmlFor={`${formId}-contactName`}>
                      {t("form.contactName")}
                    </FieldLabel>
                    <Input
                      id={`${formId}-contactName`}
                      aria-invalid={Boolean(errors.contactName) || undefined}
                      {...register("contactName")}
                    />
                    <FieldError
                      errors={
                        errors.contactName ? [errors.contactName] : undefined
                      }
                    />
                  </Field>

                  <Field data-invalid={Boolean(errors.contactPhone) || undefined}>
                    <FieldLabel htmlFor={`${formId}-contactPhone`}>
                      {t("form.contactPhone")}
                    </FieldLabel>
                    <Input
                      id={`${formId}-contactPhone`}
                      type="tel"
                      dir="ltr"
                      aria-invalid={Boolean(errors.contactPhone) || undefined}
                      {...register("contactPhone")}
                    />
                    <FieldError
                      errors={
                        errors.contactPhone ? [errors.contactPhone] : undefined
                      }
                    />
                  </Field>
                </div>

                <Field data-invalid={Boolean(errors.contactEmail) || undefined}>
                  <FieldLabel htmlFor={`${formId}-contactEmail`}>
                    {t("form.contactEmail")}
                  </FieldLabel>
                  <Input
                    id={`${formId}-contactEmail`}
                    type="email"
                    dir="ltr"
                    autoComplete="email"
                    aria-invalid={Boolean(errors.contactEmail) || undefined}
                    {...register("contactEmail")}
                  />
                  <FieldError
                    errors={errors.contactEmail ? [errors.contactEmail] : undefined}
                  />
                </Field>

                <GovernorateSelectField
                  id={`${formId}-governorate`}
                  value={governorateId}
                  onChange={(next) => setValue("governorateId", next, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })}
                  disabled={busy}
                  invalid={Boolean(errors.governorateId)}
                  label={t("form.governorate")}
                  placeholder={t("form.governoratePlaceholder")}
                  hint={t("form.governorateHint")}
                />
                <FieldError
                  errors={
                    errors.governorateId ? [errors.governorateId] : undefined
                  }
                />

                <AreaComboboxField
                  id={`${formId}-area`}
                  value={areaValue}
                  onChange={(next) =>
                    setValue("area", next, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  governorateId={governorateId}
                  disabled={busy}
                  invalid={Boolean(errors.area)}
                  label={t("form.area")}
                  hint={t("form.areaHint")}
                />
                <FieldError errors={errors.area ? [errors.area] : undefined} />

                <Field data-invalid={Boolean(errors.addressLine) || undefined}>
                  <FieldLabel htmlFor={`${formId}-addressLine`}>
                    {t("form.addressLine")}
                  </FieldLabel>
                  <FieldDescription>{t("form.addressLineHint")}</FieldDescription>
                  <Textarea
                    id={`${formId}-addressLine`}
                    rows={3}
                    aria-invalid={Boolean(errors.addressLine) || undefined}
                    {...register("addressLine")}
                  />
                  <FieldError
                    errors={errors.addressLine ? [errors.addressLine] : undefined}
                  />
                </Field>

                <FieldSet>
                  <FieldLegend>{t("form.structuredLegend")}</FieldLegend>
                  <FieldDescription>{t("form.structuredHint")}</FieldDescription>
                  <FieldGroup className="gap-4 pt-2">
                    <Field data-invalid={Boolean(errors.street) || undefined}>
                      <FieldLabel htmlFor={`${formId}-street`}>
                        {t("form.street")}
                      </FieldLabel>
                      <Input
                        id={`${formId}-street`}
                        aria-invalid={Boolean(errors.street) || undefined}
                        {...register("street")}
                      />
                      <FieldError
                        errors={errors.street ? [errors.street] : undefined}
                      />
                    </Field>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field
                        data-invalid={Boolean(errors.buildingNumber) || undefined}
                      >
                        <FieldLabel htmlFor={`${formId}-buildingNumber`}>
                          {t("form.buildingNumber")}
                        </FieldLabel>
                        <Input
                          id={`${formId}-buildingNumber`}
                          aria-invalid={
                            Boolean(errors.buildingNumber) || undefined
                          }
                          {...register("buildingNumber")}
                        />
                        <FieldError
                          errors={
                            errors.buildingNumber
                              ? [errors.buildingNumber]
                              : undefined
                          }
                        />
                      </Field>

                      <Field
                        data-invalid={Boolean(errors.postalCode) || undefined}
                      >
                        <FieldLabel htmlFor={`${formId}-postalCode`}>
                          {t("form.postalCode")}
                        </FieldLabel>
                        <Input
                          id={`${formId}-postalCode`}
                          aria-invalid={Boolean(errors.postalCode) || undefined}
                          {...register("postalCode")}
                        />
                        <FieldError
                          errors={
                            errors.postalCode ? [errors.postalCode] : undefined
                          }
                        />
                      </Field>
                    </div>
                  </FieldGroup>
                </FieldSet>

                <FieldSet
                  id={coordinatesGroupId}
                  aria-describedby={
                    coordinateGroupError
                      ? `${coordinatesGroupId}-error`
                      : undefined
                  }
                >
                  <FieldLegend>{t("form.coordinatesLegend")}</FieldLegend>
                  <FieldDescription>{t("form.coordinatesHint")}</FieldDescription>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={busy || !mapsEnabled}
                      onClick={() => setMapPickerOpen(true)}
                    >
                      <MapPin aria-hidden="true" />
                      {t("form.pickOnMap")}
                    </Button>
                    {!mapsEnabled ? (
                      <p className="text-xs text-muted-foreground">
                        {t("form.mapsUnavailable")}
                      </p>
                    ) : null}
                  </div>
                  <FieldGroup className="grid gap-4 pt-2 sm:grid-cols-2">
                    <Field data-invalid={Boolean(errors.latitude) || undefined}>
                      <FieldLabel htmlFor={`${formId}-latitude`}>
                        {t("form.latitude")}
                      </FieldLabel>
                      <Input
                        id={`${formId}-latitude`}
                        inputMode="decimal"
                        dir="ltr"
                        aria-invalid={Boolean(errors.latitude) || undefined}
                        {...register("latitude")}
                      />
                      <FieldError
                        errors={errors.latitude ? [errors.latitude] : undefined}
                      />
                    </Field>

                    <Field data-invalid={Boolean(errors.longitude) || undefined}>
                      <FieldLabel htmlFor={`${formId}-longitude`}>
                        {t("form.longitude")}
                      </FieldLabel>
                      <Input
                        id={`${formId}-longitude`}
                        inputMode="decimal"
                        dir="ltr"
                        aria-invalid={Boolean(errors.longitude) || undefined}
                        {...register("longitude")}
                      />
                      <FieldError
                        errors={
                          errors.longitude ? [errors.longitude] : undefined
                        }
                      />
                    </Field>
                  </FieldGroup>
                  {coordinateGroupError ? (
                    <p
                      id={`${coordinatesGroupId}-error`}
                      className="mt-2 text-sm text-destructive"
                      role="alert"
                    >
                      {coordinateGroupError}
                    </p>
                  ) : null}
                </FieldSet>
              </FieldGroup>
            </DialogBody>

            <DialogFooter className="border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => onOpenChange(false)}
              >
                {tCommon("common.cancel")}
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? (
                  <>
                    <Loader2 className="animate-spin" aria-hidden="true" />
                    {t("form.saving")}
                  </>
                ) : (
                  tCommon("common.save")
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>

      <CoordinateMapPickerDialog
        open={mapPickerOpen}
        onOpenChange={setMapPickerOpen}
        latitude={latitudeValue}
        longitude={longitudeValue}
        onConfirm={(lat, lng) => {
          setValue("latitude", lat, { shouldDirty: true, shouldValidate: true });
          setValue("longitude", lng, { shouldDirty: true, shouldValidate: true });
        }}
        onClear={() => {
          setValue("latitude", "", { shouldDirty: true, shouldValidate: true });
          setValue("longitude", "", { shouldDirty: true, shouldValidate: true });
        }}
      />
    </Dialog>
  );
}
