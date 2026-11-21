import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { BulkBookingRow } from "@/features/shipments/components/bulk-booking-row";
import { OrderPackagesEditDialog } from "@/features/shipments/components/order-packages-edit-dialog";
import { useBatchShipmentLabels } from "@/features/shipments/hooks/use-shipment-label";
import { useBulkBookShipments } from "@/features/shipments/hooks/use-bulk-book-shipments";
import { useBulkShipmentPreview } from "@/features/shipments/hooks/use-bulk-shipment-preview";
import { heldBulkLine, type HeldBulkLine } from "@/features/shipments/lib/bulk-book-outcomes";
import { canPrintShipmentLabel } from "@/features/shipments/lib/shipment-actions";
import {
  canSubmitBulkBook,
  draftsToBulkBookPayload,
  unbookableOrderIds,
  MAX_BULK_BOOKING_LINES,
} from "@/features/shipments/lib/bulk-preview-lines";
import type {
  BulkBookingLineDraft,
  BulkPreviewLine,
  ShipmentDistrict,
} from "@/features/shipments/types";
import { useSenderLocations } from "@/features/locations/hooks/use-sender-locations";
import { useCarrierConnections } from "@/features/shipping-partners/hooks/use-carrier-connections";
import { parseApiError } from "@/shared/api/error-handler";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui";
import type { DialogContentSize } from "@/shared/components/ui/dialog";
import {
  MerchantPermission,
  useMerchantPermissions,
} from "@/shared/hooks/use-merchant-permissions";
import { useLocaleStore } from "@/stores/locale.store";

interface WithMyRatesBookingDialogProps {
  orderIds: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditOrder?: (orderId: string) => void;
  embedded?: boolean;
}

function initialDrafts(orderIds: string[]): BulkBookingLineDraft[] {
  return orderIds.slice(0, MAX_BULK_BOOKING_LINES).map((orderId) => ({
    orderId,
  }));
}

export function WithMyRatesBookingDialog({
  orderIds,
  open,
  onOpenChange,
  onEditOrder,
  embedded = false,
}: WithMyRatesBookingDialogProps) {
  const { t } = useTranslation(["shipments", "common"]);
  const locale = useLocaleStore((state) => state.locale);
  const intlLocale = locale === "ar" ? "ar-EG" : "en-US";
  const formId = useId();
  const { hasPermission } = useMerchantPermissions();
  const canEditPackages = hasPermission(MerchantPermission.ORDER_MANAGE);

  const [drafts, setDrafts] = useState<BulkBookingLineDraft[]>(() =>
    initialDrafts(orderIds),
  );
  const [districtByOrderId, setDistrictByOrderId] = useState<
    Record<string, ShipmentDistrict | null>
  >({});
  const [packagesEdit, setPackagesEdit] = useState<{
    orderId: string;
    orderNumber?: string;
  } | null>(null);
  const [lastBookedIds, setLastBookedIds] = useState<string[]>([]);
  const [heldLines, setHeldLines] = useState<
    (HeldBulkLine & { orderNumber: string })[]
  >([]);
  /** Bookings the carrier has not confirmed yet (202 / BOOKING): shown, never offered again. */
  const [confirmingLines, setConfirmingLines] = useState<
    { orderId: string; orderNumber: string; shipmentId: string | null }[]
  >([]);

  const connectionsQuery = useCarrierConnections(
    { active: true, size: 100 },
    { enabled: open },
  );
  const senderLocationsQuery = useSenderLocations({ size: 1 }, { enabled: open });
  const showDefaultPickupWarning =
    (senderLocationsQuery.data?.totalElements ?? 0) > 1;
  const previewQuery = useBulkShipmentPreview(drafts, { enabled: open });
  const bulkMutation = useBulkBookShipments();
  const batchLabelsMutation = useBatchShipmentLabels();

  // Reset only when the dialog opens/closes or the set of orders really changes. Callers often pass
  // a new array on every render (e.g. `orderIds={[orderId]}`); keying on the array itself wiped the
  // merchant's carrier and district picks, the booked rows and "Print labels" on any parent re-render.
  const orderIdsKey = orderIds.join(",");
  useEffect(() => {
    const ids = orderIdsKey ? orderIdsKey.split(",") : [];
    if (!open) {
      setDrafts(initialDrafts(ids));
      setDistrictByOrderId({});
      setPackagesEdit(null);
      setLastBookedIds([]);
      setHeldLines([]);
      setConfirmingLines([]);
      return;
    }
    setDrafts(initialDrafts(ids));
    setDistrictByOrderId({});
    setLastBookedIds([]);
    setHeldLines([]);
    setConfirmingLines([]);
  }, [open, orderIdsKey]);

  const previewByOrderId = useMemo(() => {
    const map = new Map<string, BulkPreviewLine>();
    previewQuery.data?.lines.forEach((line) => {
      map.set(line.orderId, line);
    });
    return map;
  }, [previewQuery.data?.lines]);

  const skippedOrderIds = useMemo(
    () => unbookableOrderIds(drafts, previewByOrderId),
    [drafts, previewByOrderId],
  );
  const activeDrafts = drafts.filter((line) => !line.removed);
  const showIndex = activeDrafts.length > 1;
  const quota = previewQuery.data?.quota ?? null;
  const quotaExceeded =
    quota != null && quota.needed > quota.remaining && quota.remaining >= 0;

  const updateDraft = useCallback(
    (orderId: string, patch: Partial<BulkBookingLineDraft>) => {
      setDrafts((current) =>
        current.map((line) =>
          line.orderId === orderId ? { ...line, ...patch } : line,
        ),
      );
    },
    [],
  );

  const handleConnectionChange = (orderId: string, connectionId: string) => {
    updateDraft(orderId, {
      connectionId,
      districtId: undefined,
      bulkError: null,
      bulkOutcome: null,
    });
    setDistrictByOrderId((current) => ({ ...current, [orderId]: null }));
  };

  const handleDistrictChange = (
    orderId: string,
    district: ShipmentDistrict | null,
  ) => {
    setDistrictByOrderId((current) => ({ ...current, [orderId]: district }));
    updateDraft(orderId, {
      districtId: district?.id,
      bulkError: null,
    });
  };

  const handleRemove = (orderId: string) => {
    updateDraft(orderId, { removed: true });
  };

  const handleBulkBook = async () => {
    const payload = draftsToBulkBookPayload(drafts, skippedOrderIds);
    if (payload.length === 0) return;

    try {
      const response = await bulkMutation.mutateAsync({ lines: payload });
      const held = response.results.flatMap((row) => {
        const line = heldBulkLine(row);
        if (!line) return [];
        // Read now: the line leaves the preview once it is removed.
        const orderNumber =
          previewByOrderId.get(line.orderId)?.order?.orderNumber ?? line.orderId;
        return [{ ...line, orderNumber }];
      });
      const heldOrderIds = new Set(held.map((line) => line.orderId));
      const heldFromRejected = response.results.filter(
        (row) => row.outcome === "REJECTED" && heldOrderIds.has(row.orderId),
      ).length;

      // Worked out from the response first: state updaters must stay free of side effects (they
      // can run twice in development) and must not depend on running in a particular order.
      const bookedIds = response.results
        .filter((row) => !heldOrderIds.has(row.orderId) && row.outcome === "BOOKED" && row.shipment)
        .map((row) => row.shipment!.id);
      const confirming = response.results
        .filter((row) => !heldOrderIds.has(row.orderId) && row.outcome === "BOOKING")
        .map((row) => ({
          orderId: row.orderId,
          orderNumber: previewByOrderId.get(row.orderId)?.order?.orderNumber ?? row.orderId,
          shipmentId: row.shipment?.id ?? null,
        }));
      // A district the carrier suggested after refusing the area: shown selected AND sent with the
      // next booking, so what the merchant sees is what gets booked.
      const suggestedDistricts = new Map<string, ShipmentDistrict>();
      for (const row of response.results) {
        const first = row.outcome === "REJECTED" ? row.error?.details?.suggestions?.[0] : undefined;
        if (first) suggestedDistricts.set(row.orderId, first);
      }

      setDrafts((current) =>
        current.map((line) => {
          const result = response.results.find((r) => r.orderId === line.orderId);
          if (!result) return line;
          // Held lines exist at the carrier: never offer to book them again.
          if (heldOrderIds.has(line.orderId)) {
            return { ...line, removed: true, bulkOutcome: "HELD", bulkError: null };
          }
          if (result.outcome === "BOOKED" && result.shipment) {
            return { ...line, removed: true, bulkOutcome: "BOOKED", bulkError: null };
          }
          if (result.outcome === "BOOKING") {
            // Listed under "confirming" below; booking it again would be refused (409).
            return { ...line, removed: true, bulkOutcome: "BOOKING", bulkError: null };
          }
          if (result.outcome === "REJECTED") {
            const suggested = suggestedDistricts.get(line.orderId);
            return {
              ...line,
              ...(suggested ? { districtId: suggested.id } : {}),
              bulkOutcome: "REJECTED",
              bulkError: result.error?.message ?? t("bulkBooking.rowRejected"),
            };
          }
          return line;
        }),
      );
      if (suggestedDistricts.size > 0) {
        setDistrictByOrderId((prev) => ({ ...prev, ...Object.fromEntries(suggestedDistricts) }));
      }

      setLastBookedIds(bookedIds);
      if (held.length > 0) {
        setHeldLines((current) => [...current, ...held]);
      }
      if (confirming.length > 0) {
        setConfirmingLines((current) => [...current, ...confirming]);
      }

      toast.success(
        t("bulkBooking.resultToast", {
          booked: response.booked,
          rejected: Math.max(0, response.rejected - heldFromRejected),
        }),
      );
      if (confirming.length > 0) {
        toast.info(t("bulkBooking.resultToastConfirming", { count: confirming.length }));
      }
      if (held.length > 0) {
        toast.warning(t("bulkBooking.resultToastHeld", { count: held.length }));
      }
    } catch (error) {
      toast.error(parseApiError(error).detail || t("bulkBooking.bookFailed"));
    }
  };

  const printableLastBookedIds = useMemo(() => {
    if (!bulkMutation.data) return [];
    return lastBookedIds.filter((id) => {
      const row = bulkMutation.data.results.find((r) => r.shipment?.id === id);
      return row?.shipment ? canPrintShipmentLabel(row.shipment) : false;
    });
  }, [bulkMutation.data, lastBookedIds]);

  const handlePrintLabels = () => {
    if (printableLastBookedIds.length === 0) return;
    // Rawafid prints one connection per request (bulk-booking.md §2): one PDF per carrier account.
    const groups = new Map<string, string[]>();
    for (const id of printableLastBookedIds) {
      const row = bulkMutation.data?.results.find(
        (r) => r.shipment?.id === id,
      );
      if (!row?.shipment) continue;
      const connectionId = row.shipment.connection.id;
      const list = groups.get(connectionId) ?? [];
      list.push(id);
      groups.set(connectionId, list);
    }
    groups.forEach((ids) => {
      void batchLabelsMutation.mutateAsync(ids);
    });
  };

  const isBusy =
    bulkMutation.isPending ||
    previewQuery.isFetching ||
    previewQuery.isDebouncing;
  const canSubmit =
    canSubmitBulkBook(drafts, skippedOrderIds) &&
    !bulkMutation.isPending &&
    quota !== null;

  const connections = connectionsQuery.data?.content ?? [];
  const remainingActive = activeDrafts.length;

  const dialogSize: DialogContentSize =
    orderIds.length <= 1 ? "w4" : orderIds.length <= 3 ? "w5" : "w6";

  const dialogBody = (
    <>
      {!embedded ? (
        <DialogHeader className="border-b border-border/60 pe-10">
          <DialogTitle>{t("bulkBooking.title")}</DialogTitle>
          <DialogDescription>{t("bulkBooking.description")}</DialogDescription>
        </DialogHeader>
      ) : null}

      <DialogBody className="max-h-[min(65vh,32rem)] space-y-4">
        {showIndex ? (
          <p className="text-xs text-muted-foreground">
            {t("bulkBooking.summaryLine", { count: remainingActive })}
            {isBusy && previewQuery.data ? (
              <span className="ms-2 inline-flex items-center gap-1">
                <Loader2 className="size-3 animate-spin" aria-hidden="true" />
                {t("bulkBooking.refreshing")}
              </span>
            ) : null}
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

        {confirmingLines.length > 0 ? (
          <section
            role="status"
            aria-labelledby={`${formId}-confirming`}
            className="flex gap-3 rounded-lg border border-border bg-muted/40 p-3 text-sm"
          >
            <Loader2 className="mt-0.5 size-4 shrink-0 animate-spin text-muted-foreground" aria-hidden="true" />
            <div className="min-w-0 space-y-2">
              <h3 id={`${formId}-confirming`} className="font-medium text-foreground">
                {t("bulkBooking.confirmingTitle", { count: confirmingLines.length })}
              </h3>
              <p className="text-muted-foreground">{t("bulkBooking.confirmingDescription")}</p>
              <ul className="space-y-1.5">
                {confirmingLines.map((line) => (
                  <li key={line.orderId}>
                    {line.shipmentId ? (
                      <Link
                        to={`/shipments/${encodeURIComponent(line.shipmentId)}`}
                        onClick={() => onOpenChange(false)}
                        className="font-medium text-primary underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                      >
                        {t("bulkBooking.heldRow", { order: line.orderNumber })}
                      </Link>
                    ) : (
                      <span className="font-medium text-foreground">
                        {t("bulkBooking.heldRow", { order: line.orderNumber })}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        {heldLines.length > 0 ? (
          <section
            role="status"
            aria-labelledby={`${formId}-held`}
            className="flex gap-3 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm"
          >
            <AlertTriangle
              className="mt-0.5 size-4 shrink-0 text-amber-700 dark:text-amber-400"
              aria-hidden="true"
            />
            <div className="min-w-0 space-y-2">
              <h3 id={`${formId}-held`} className="font-medium text-foreground">
                {t("bulkBooking.heldTitle", { count: heldLines.length })}
              </h3>
              <p className="text-muted-foreground">{t("booking.heldDescription")}</p>
              <ul className="space-y-1.5">
                {heldLines.map((line) => {
                  const orderNumber = line.orderNumber;
                  return (
                    <li key={line.orderId} className="space-y-0.5">
                      {line.shipmentId ? (
                        <Link
                          to={`/shipments/${encodeURIComponent(line.shipmentId)}`}
                          onClick={() => onOpenChange(false)}
                          className="font-medium text-primary underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                        >
                          {t("bulkBooking.heldRow", { order: orderNumber })}
                        </Link>
                      ) : (
                        <span className="font-medium text-foreground">
                          {t("bulkBooking.heldRow", { order: orderNumber })}
                        </span>
                      )}
                      {line.message ? (
                        <p dir="auto" className="text-xs text-muted-foreground">
                          {line.message}
                        </p>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        ) : null}

        {previewQuery.isLoading && !previewQuery.data ? (
          <p className="flex items-center gap-2 py-8 text-sm text-muted-foreground" role="status">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            {t("common:common.loading")}
          </p>
        ) : null}

        {previewQuery.data && remainingActive > 0 ? (
          <ul
            className={
              showIndex
                ? "divide-y divide-border/60 rounded-lg border border-border/70"
                : "list-none"
            }
            aria-label={t("bulkBooking.tableCaption")}
          >
            {activeDrafts.map((draft, index) => {
              const previewLine = previewByOrderId.get(draft.orderId);
              return (
                <BulkBookingRow
                  key={draft.orderId}
                  index={index}
                  showIndex={showIndex}
                  draft={draft}
                  previewLine={previewLine}
                  connections={connections}
                  selectedDistrict={districtByOrderId[draft.orderId] ?? null}
                  connectionSelectId={`${formId}-conn-${draft.orderId}`}
                  districtSelectId={`${formId}-dist-${draft.orderId}`}
                  canEditPackages={canEditPackages}
                  showDefaultPickupWarning={showDefaultPickupWarning}
                  disabled={bulkMutation.isPending}
                  onConnectionChange={(connectionId) =>
                    handleConnectionChange(draft.orderId, connectionId)
                  }
                  onDistrictChange={(district) =>
                    handleDistrictChange(draft.orderId, district)
                  }
                  onSuggestionPick={(district) =>
                    handleDistrictChange(draft.orderId, district)
                  }
                  onEditPackages={() =>
                    setPackagesEdit({
                      orderId: draft.orderId,
                      orderNumber: previewLine?.order?.orderNumber,
                    })
                  }
                  onRemove={() => handleRemove(draft.orderId)}
                  onEditOrder={() => onEditOrder?.(draft.orderId)}
                />
              );
            })}
          </ul>
        ) : null}

        {remainingActive === 0 && !bulkMutation.isPending && previewQuery.data ? (
          <p className="py-6 text-center text-sm text-muted-foreground" role="status">
            {t("bulkBooking.allDone")}
          </p>
        ) : null}
      </DialogBody>

      <DialogFooter className="flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1 text-start sm:flex-1" aria-live="polite">
          {/* "No subscription" only once the preview has answered with quota: null; while it loads
              or after it failed, there is simply no quota line yet. */}
          {!previewQuery.data ? null : quota === null ? (
            <>
              <p className="text-sm font-medium">{t("booking.subscriptionRequired")}</p>
              <Button type="button" size="sm" variant="outline" asChild className="mt-1">
                <Link to="/billing">{t("booking.upgradePlan")}</Link>
              </Button>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">
              {t("bulkBooking.quotaLine", {
                needed: quota.needed.toLocaleString(intlLocale),
                remaining: quota.remaining.toLocaleString(intlLocale),
              })}
            </p>
          )}
          {quotaExceeded ? (
            <p role="alert" className="text-xs text-destructive">
              {t("bulkBooking.quotaWarning")}
            </p>
          ) : null}
          {skippedOrderIds.size > 0 ? (
            <p className="text-xs text-amber-700 dark:text-amber-400">
              {t("bulkBooking.skippedRows", { count: skippedOrderIds.size })}
            </p>
          ) : null}
          {bulkMutation.isPending ? (
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
              {t("bulkBooking.bookingInProgress")}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2 sm:justify-end">
          {printableLastBookedIds.length > 0 ? (
            <Button
              type="button"
              variant="outline"
              disabled={batchLabelsMutation.isPending}
              onClick={handlePrintLabels}
            >
              {t("bulkBooking.printLabels")}
            </Button>
          ) : null}
          {!embedded ? (
            <Button
              type="button"
              variant="outline"
              disabled={bulkMutation.isPending}
              onClick={() => onOpenChange(false)}
            >
              {t("booking.close")}
            </Button>
          ) : null}
          <Button
            type="button"
            disabled={!canSubmit || isBusy || quota === null || remainingActive === 0}
            onClick={() => void handleBulkBook()}
          >
            {bulkMutation.isPending ? (
              <>
                <Loader2 className="animate-spin" aria-hidden="true" />
                {t("bulkBooking.submitting")}
              </>
            ) : (
              t("bulkBooking.submit")
            )}
          </Button>
        </div>
      </DialogFooter>

      <OrderPackagesEditDialog
        orderId={packagesEdit?.orderId ?? null}
        orderNumber={packagesEdit?.orderNumber}
        open={packagesEdit !== null}
        onOpenChange={(next) => {
          if (!next) setPackagesEdit(null);
        }}
        onSaved={() => void previewQuery.refetchNow()}
      />
    </>
  );

  if (embedded) {
    return open ? <div className="flex flex-col gap-0">{dialogBody}</div> : null;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (bulkMutation.isPending) return;
        onOpenChange(next);
      }}
    >
      <DialogContent
        size={dialogSize}
        className="gap-0 overflow-hidden p-0"
        showCloseButton={!bulkMutation.isPending}
        closeLabel={t("common:common.close")}
      >
        {dialogBody}
      </DialogContent>
    </Dialog>
  );
}
