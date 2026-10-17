import { useEffect, useId, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { ReturnItemQuantityStepper } from "@/features/returns/components/return-item-quantity-stepper";
import { useBookReturn } from "@/features/returns/hooks/use-book-return";
import { useReturnPreview } from "@/features/returns/hooks/use-return-preview";
import { parseReturnBookingError } from "@/features/returns/lib/return-booking-errors";
import {
  buildReturnBookingSchema,
  hasReturnItemsSelected,
} from "@/features/returns/schema";
import { useOrder } from "@/features/orders/hooks/use-order";
import { ShipmentDistrictCombobox } from "@/features/shipments/components/shipment-district-combobox";
import { ShipmentPickupInfo } from "@/features/shipments/components/shipment-pickup-info";
import { getShipmentDistrictLabel } from "@/features/shipments/lib/district-label";
import { shipmentCarrierLabel } from "@/features/shipments/lib/shipment-connection-label";
import type { ShipmentDistrict } from "@/features/shipments/types";
import { useSenderLocations } from "@/features/locations/hooks/use-sender-locations";
import { parseApiError } from "@/shared/api/error-handler";
import {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@/shared/components/ui";
import { useLocaleStore } from "@/stores/locale.store";

interface BookReturnDialogProps {
  orderId: string;
  orderNumber?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBooked?: (shipmentId: string) => void;
}

export function BookReturnDialog({
  orderId,
  orderNumber,
  open,
  onOpenChange,
  onBooked,
}: BookReturnDialogProps) {
  const { t } = useTranslation(["returns", "shipments", "common"]);
  const navigate = useNavigate();
  const locale = useLocaleStore((state) => state.locale);
  const intlLocale = locale === "ar" ? "ar-EG" : "en-US";
  const formId = useId();

  const [connectionId, setConnectionId] = useState<string | undefined>();
  const [districtId, setDistrictId] = useState<string | undefined>();
  const [selectedDistrict, setSelectedDistrict] =
    useState<ShipmentDistrict | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [addressOpen, setAddressOpen] = useState(false);
  const [addressLine, setAddressLine] = useState("");
  const [buildingNumber, setBuildingNumber] = useState("");
  const [floor, setFloor] = useState("");
  const [apartment, setApartment] = useState("");
  const [phone, setPhone] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [skipRefund, setSkipRefund] = useState(false);

  const previewParams = useMemo(
    () =>
      open
        ? {
            orderId,
            connectionId,
            districtId,
          }
        : null,
    [open, orderId, connectionId, districtId],
  );

  const previewQuery = useReturnPreview(previewParams, { enabled: open });
  const orderQuery = useOrder(orderId, { enabled: open });
  const bookMutation = useBookReturn();
  const senderLocationsQuery = useSenderLocations({ size: 1 }, { enabled: open });
  const showDefaultPickupWarning =
    (senderLocationsQuery.data?.totalElements ?? 0) > 1;

  const preview = previewQuery.data;

  useEffect(() => {
    if (!open) {
      setConnectionId(undefined);
      setDistrictId(undefined);
      setSelectedDistrict(null);
      setQuantities({});
      setReason("");
      setNotes("");
      setRefundAmount("");
      setAddressOpen(false);
      setAddressLine("");
      setBuildingNumber("");
      setFloor("");
      setApartment("");
      setPhone("");
      setSubmitError(null);
      setSkipRefund(false);
      return;
    }
  }, [open, orderId]);

  useEffect(() => {
    if (!preview?.connection?.id) return;
    if (connectionId === undefined) {
      setConnectionId(preview.connection.id);
    }
  }, [preview?.connection?.id, connectionId]);

  useEffect(() => {
    if (!preview?.order.items.length) return;
    setQuantities((current) => {
      const next = { ...current };
      let changed = false;
      for (const item of preview.order.items) {
        if (item.returnable === 0) continue;
        if (next[item.id] === undefined) {
          next[item.id] = 0;
          changed = true;
        }
      }
      return changed ? next : current;
    });
  }, [preview?.order.items]);

  const refundable = preview?.order.refundable ?? 0;
  const schema = useMemo(
    () => buildReturnBookingSchema(t, refundable),
    [t, refundable],
  );

  const governorateId = orderQuery.data?.address.governorate.id ?? "";
  const activeConnectionId = connectionId ?? preview?.connection?.id ?? "";
  const address = preview?.address;
  const needsDistrict = address?.method === "NONE";
  const suggestions = address?.suggestions ?? [];
  const quota = preview?.quota ?? null;
  const quotaBlocked =
    quota != null && quota.remaining <= 0 && preview?.bookable === true;

  const handleConnectionChange = (nextId: string) => {
    setConnectionId(nextId);
    setDistrictId(undefined);
    setSelectedDistrict(null);
    setSubmitError(null);
  };

  const handleDistrictSelect = (district: ShipmentDistrict | null) => {
    setSelectedDistrict(district);
    setDistrictId(district?.id);
    setSubmitError(null);
  };

  const handleSubmit = async (forceWithoutRefund = false) => {
    if (!preview) return;
    setSubmitError(null);

    if (!hasReturnItemsSelected(quantities)) {
      setSubmitError(t("validation.selectItems"));
      return;
    }

    const parsed = schema.safeParse({
      reason,
      notes,
      refundAmount: forceWithoutRefund || skipRefund ? undefined : refundAmount,
      addressLine: addressLine || undefined,
      buildingNumber: buildingNumber || undefined,
      floor: floor || undefined,
      apartment: apartment || undefined,
      phone: phone || undefined,
    });

    if (!parsed.success) {
      setSubmitError(parsed.error.errors[0]?.message ?? t("validation.selectItems"));
      return;
    }

    if (needsDistrict && !districtId && !address?.district) {
      setSubmitError(t("validation.districtRequired"));
      return;
    }

    const items = preview.order.items
      .filter((item) => (quantities[item.id] ?? 0) > 0)
      .map((item) => ({
        orderItemId: item.id,
        quantity: quantities[item.id]!,
      }));

    const pickupAddress =
      addressOpen &&
      (addressLine || phone || buildingNumber || floor || apartment)
        ? {
            ...(addressLine ? { addressLine } : {}),
            ...(buildingNumber ? { buildingNumber } : {}),
            ...(floor ? { floor } : {}),
            ...(apartment ? { apartment } : {}),
            ...(phone ? { phone } : {}),
          }
        : undefined;

    let refund: number | undefined;
    if (!forceWithoutRefund && !skipRefund && refundAmount.trim()) {
      refund = Number(refundAmount);
    }

    try {
      const result = await bookMutation.mutateAsync({
        orderId,
        connectionId: activeConnectionId || null,
        districtId: districtId ?? null,
        items,
        reason: reason.trim() || undefined,
        notes: notes.trim() || undefined,
        refundAmount: refund,
        pickupAddress,
      });

      onOpenChange(false);
      if (onBooked) {
        onBooked(result.shipment.id);
      } else {
        navigate(`/shipments/${encodeURIComponent(result.shipment.id)}`);
      }
    } catch (error) {
      const parsedError = parseReturnBookingError(error);
      setSubmitError(parsedError.detail);
      if (parsedError.action === "retryWithoutRefund") {
        setSkipRefund(true);
      }
    }
  };

  const title = orderNumber
    ? t("dialog.titleForOrder", { orderNumber })
    : t("dialog.title");

  const isBusy = previewQuery.isFetching || bookMutation.isPending;
  const canSubmit =
    preview?.bookable &&
    !preview.existingReturn &&
    (preview.connections.length ?? 0) > 0 &&
    !quotaBlocked &&
    hasReturnItemsSelected(quantities) &&
    !bookMutation.isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (bookMutation.isPending) return;
        onOpenChange(next);
      }}
    >
      <DialogContent
        size="w5"
        className="gap-0 overflow-hidden p-0"
        showCloseButton={!bookMutation.isPending}
        closeLabel={t("common:common.close")}
      >
        <DialogHeader className="border-b border-border/60 pe-10">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{t("dialog.description")}</DialogDescription>
        </DialogHeader>

        <DialogBody className="max-h-[min(70vh,36rem)] space-y-4">
          {previewQuery.isLoading && !preview ? (
            <p
              className="flex items-center gap-2 py-10 text-sm text-muted-foreground"
              role="status"
            >
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              {t("common:common.loading")}
            </p>
          ) : null}

          {previewQuery.isError ? (
            <div
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm"
            >
              {parseApiError(previewQuery.error).detail}
            </div>
          ) : null}

          {preview?.existingReturn ? (
            <div
              role="status"
              className="rounded-lg border border-border bg-muted/40 p-4 text-sm"
            >
              <p className="font-medium">{t("dialog.existingReturn")}</p>
              <Button type="button" variant="link" className="mt-2 h-auto p-0" asChild>
                <Link
                  to={`/shipments/${encodeURIComponent(preview.existingReturn.shipmentId)}`}
                >
                  {preview.existingReturn.kind === "EXCHANGE"
                    ? t("dialog.viewExchange")
                    : t("dialog.viewReturn")}
                </Link>
              </Button>
            </div>
          ) : null}

          {preview && preview.connections.length === 0 ? (
            <div role="alert" className="space-y-3 rounded-lg border border-border p-4 text-sm">
              <p>{t("dialog.noConnections")}</p>
              <Button type="button" size="sm" variant="outline" asChild>
                <Link to="/shipping-partners">{t("dialog.connectPartner")}</Link>
              </Button>
            </div>
          ) : null}

          {preview &&
          !preview.existingReturn &&
          preview.connections.length > 0 &&
          !preview.bookable ? (
            <p role="status" className="text-sm text-muted-foreground">
              {t("dialog.nothingLeft")}
            </p>
          ) : null}

          {preview &&
          !preview.existingReturn &&
          preview.bookable &&
          preview.connections.length > 0 ? (
            <>
              <div className="rounded-lg border border-border/70 bg-muted/30 p-3 text-sm">
                <p className="font-medium">{preview.order.orderNumber}</p>
                <p className="mt-1 text-muted-foreground">
                  {preview.order.receiverName}
                  <span aria-hidden="true"> · </span>
                  <span dir="ltr" className="tabular-nums">
                    {preview.order.receiverPhone}
                  </span>
                </p>
                <p className="text-muted-foreground">{preview.order.area}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {preview.order.addressLine}
                </p>
              </div>

              {preview.pickup && activeConnectionId ? (
                <ShipmentPickupInfo
                  pickup={preview.pickup}
                  connectionId={activeConnectionId}
                  showDefaultWarning={showDefaultPickupWarning}
                />
              ) : null}

              <div className="space-y-2">
                <Label htmlFor={`${formId}-connection`}>
                  {t("shipments:bulkBooking.colConnection")}
                </Label>
                <Select
                  value={activeConnectionId}
                  onValueChange={handleConnectionChange}
                  disabled={isBusy}
                >
                  <SelectTrigger id={`${formId}-connection`} className="w-full">
                    <SelectValue
                      placeholder={t("shipments:bulkBooking.connectionPlaceholder")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {preview.connections.map((conn) => (
                      <SelectItem key={conn.id} value={conn.id}>
                        {conn.name} ({shipmentCarrierLabel(conn, locale)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {address?.district && address.method !== "NONE" ? (
                <div>
                  <p className="text-sm font-medium">
                    {t("shipments:booking.matchedDistrict")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {getShipmentDistrictLabel(address.district, locale)}
                  </p>
                </div>
              ) : null}

              {suggestions.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    {t("shipments:booking.suggestions")}
                  </p>
                  <ul className="flex flex-wrap gap-2">
                    {suggestions.map((district) => (
                      <li key={district.id}>
                        <Button
                          type="button"
                          size="sm"
                          variant={
                            selectedDistrict?.id === district.id
                              ? "default"
                              : "outline"
                          }
                          disabled={!activeConnectionId || isBusy}
                          onClick={() => handleDistrictSelect(district)}
                        >
                          {getShipmentDistrictLabel(district, locale)}
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {needsDistrict && activeConnectionId && governorateId ? (
                <ShipmentDistrictCombobox
                  id={`${formId}-district`}
                  connectionId={activeConnectionId}
                  governorateId={governorateId}
                  selectedDistrict={selectedDistrict}
                  onSelect={handleDistrictSelect}
                  disabled={isBusy}
                  kind="RETURN_PICKUP"
                />
              ) : null}

              {preview.problems.length > 0 ? (
                <div
                  role="alert"
                  className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm"
                >
                  <p className="font-medium text-destructive">
                    {t("shipments:booking.problemsTitle")}
                  </p>
                  <ul className="mt-2 list-disc space-y-1 ps-4 text-muted-foreground">
                    {preview.problems.map((problem) => (
                      <li key={problem.code}>{problem.message}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="space-y-2">
                <h3 className="text-sm font-semibold">{t("dialog.itemsTitle")}</h3>
                <p className="text-xs text-muted-foreground">{t("dialog.itemsHint")}</p>
                <ul className="space-y-2">
                  {preview.order.items
                    .filter((item) => item.returnable > 0)
                    .map((item) => (
                      <li key={item.id}>
                        <ReturnItemQuantityStepper
                          id={`${formId}-qty-${item.id}`}
                          label={`${item.name}${item.sku ? ` (${item.sku})` : ""}`}
                          value={quantities[item.id] ?? 0}
                          max={item.returnable}
                          disabled={isBusy}
                          decreaseLabel={t("stepper.decrease")}
                          increaseLabel={t("stepper.increase")}
                          onChange={(value) =>
                            setQuantities((current) => ({
                              ...current,
                              [item.id]: value,
                            }))
                          }
                        />
                      </li>
                    ))}
                </ul>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor={`${formId}-reason`}>{t("dialog.reasonLabel")}</Label>
                  <Input
                    id={`${formId}-reason`}
                    value={reason}
                    disabled={isBusy}
                    placeholder={t("dialog.reasonPlaceholder")}
                    onChange={(event) => setReason(event.target.value)}
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor={`${formId}-notes`}>{t("dialog.notesLabel")}</Label>
                  <Textarea
                    id={`${formId}-notes`}
                    value={notes}
                    disabled={isBusy}
                    rows={2}
                    placeholder={t("dialog.notesPlaceholder")}
                    onChange={(event) => setNotes(event.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`${formId}-refund`}>{t("dialog.refundLabel")}</Label>
                  <Input
                    id={`${formId}-refund`}
                    inputMode="decimal"
                    dir="ltr"
                    className="tabular-nums"
                    value={skipRefund ? "" : refundAmount}
                    disabled={isBusy || skipRefund}
                    placeholder="0.00"
                    onChange={(event) => {
                      setSkipRefund(false);
                      setRefundAmount(event.target.value);
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t("dialog.refundHint", {
                      max: refundable.toLocaleString(intlLocale, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }),
                    })}
                  </p>
                </div>
              </div>

              <Collapsible open={addressOpen} onOpenChange={setAddressOpen}>
                <CollapsibleTrigger asChild>
                  <Button type="button" variant="ghost" size="sm" className="px-0">
                    {t("dialog.customerMoved")}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 space-y-3 rounded-lg border border-border/60 p-3">
                  <p className="text-xs text-muted-foreground">
                    {t("dialog.customerMovedHint")}
                  </p>
                  <div className="space-y-1.5">
                    <Label htmlFor={`${formId}-address`}>
                      {t("dialog.addressLineLabel")}
                    </Label>
                    <Input
                      id={`${formId}-address`}
                      value={addressLine}
                      disabled={isBusy}
                      onChange={(event) => setAddressLine(event.target.value)}
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label htmlFor={`${formId}-building`}>
                        {t("dialog.buildingLabel")}
                      </Label>
                      <Input
                        id={`${formId}-building`}
                        value={buildingNumber}
                        disabled={isBusy}
                        onChange={(event) => setBuildingNumber(event.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`${formId}-floor`}>{t("dialog.floorLabel")}</Label>
                      <Input
                        id={`${formId}-floor`}
                        value={floor}
                        disabled={isBusy}
                        onChange={(event) => setFloor(event.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`${formId}-apartment`}>
                        {t("dialog.apartmentLabel")}
                      </Label>
                      <Input
                        id={`${formId}-apartment`}
                        value={apartment}
                        disabled={isBusy}
                        onChange={(event) => setApartment(event.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`${formId}-phone`}>{t("dialog.phoneLabel")}</Label>
                    <Input
                      id={`${formId}-phone`}
                      dir="ltr"
                      className="tabular-nums"
                      value={phone}
                      disabled={isBusy}
                      onChange={(event) => setPhone(event.target.value)}
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {submitError ? (
                <div
                  role="alert"
                  aria-live="polite"
                  className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
                >
                  {submitError}
                  {skipRefund ? (
                    <Button
                      type="button"
                      variant="link"
                      className="mt-2 h-auto p-0"
                      onClick={() => void handleSubmit(true)}
                    >
                      {t("dialog.retryWithoutRefund")}
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </>
          ) : null}
        </DialogBody>

        <DialogFooter className="flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 text-start text-xs text-muted-foreground" aria-live="polite">
            {quota ? (
              <p>
                {t("shipments:bulkBooking.quotaLine", {
                  needed: "1",
                  remaining: quota.remaining.toLocaleString(intlLocale),
                })}
              </p>
            ) : null}
            {quotaBlocked ? (
              <p role="alert" className="text-destructive">
                {t("shipments:bulkBooking.quotaWarning")}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={bookMutation.isPending}
              onClick={() => onOpenChange(false)}
            >
              {t("dialog.close")}
            </Button>
            {preview?.bookable &&
            !preview.existingReturn &&
            preview.connections.length > 0 ? (
              <Button
                type="button"
                disabled={!canSubmit || previewQuery.isFetching}
                aria-busy={bookMutation.isPending}
                onClick={() => void handleSubmit(false)}
              >
                {bookMutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin" aria-hidden="true" />
                    {t("dialog.submitting")}
                  </>
                ) : (
                  t("dialog.submit")
                )}
              </Button>
            ) : null}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
