import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { BulkBookingRow } from "@/features/shipments/components/bulk-booking-row";
import { OrderPackagesEditDialog } from "@/features/shipments/components/order-packages-edit-dialog";
import { useBatchShipmentLabels } from "@/features/shipments/hooks/use-shipment-label";
import { useBulkBookShipments } from "@/features/shipments/hooks/use-bulk-book-shipments";
import { useBulkShipmentPreview } from "@/features/shipments/hooks/use-bulk-shipment-preview";
import { groupBookedIdsByConnection } from "@/features/shipments/lib/bulk-book-outcomes";
import { canPrintShipmentLabel } from "@/features/shipments/lib/shipment-actions";
import {
  canSubmitBulkBook,
  draftsToBulkBookPayload,
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

  useEffect(() => {
    if (!open) {
      setDrafts(initialDrafts(orderIds));
      setDistrictByOrderId({});
      setPackagesEdit(null);
      setLastBookedIds([]);
      return;
    }
    setDrafts(initialDrafts(orderIds));
    setDistrictByOrderId({});
    setLastBookedIds([]);
  }, [open, orderIds]);

  const previewByOrderId = useMemo(() => {
    const map = new Map<string, BulkPreviewLine>();
    previewQuery.data?.lines.forEach((line) => {
      map.set(line.orderId, line);
    });
    return map;
  }, [previewQuery.data?.lines]);

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
    const payload = draftsToBulkBookPayload(drafts);
    if (payload.length === 0) return;

    try {
      const response = await bulkMutation.mutateAsync({ lines: payload });
      const bookedIds: string[] = [];

      setDrafts((current) =>
        current.map((line) => {
          const result = response.results.find((r) => r.orderId === line.orderId);
          if (!result) return line;
          if (result.outcome === "BOOKED" && result.shipment) {
            bookedIds.push(result.shipment.id);
            return { ...line, removed: true, bulkOutcome: "BOOKED", bulkError: null };
          }
          if (result.outcome === "BOOKING") {
            return {
              ...line,
              removed: true,
              bulkOutcome: "BOOKING",
              bulkError: null,
            };
          }
          if (result.outcome === "REJECTED") {
            const suggestions = result.error?.details?.suggestions;
            if (suggestions?.length) {
              const first = suggestions[0]!;
              setDistrictByOrderId((prev) => ({
                ...prev,
                [line.orderId]: first,
              }));
            }
            return {
              ...line,
              bulkOutcome: "REJECTED",
              bulkError: result.error?.message ?? t("bulkBooking.rowRejected"),
            };
          }
          return line;
        }),
      );

      setLastBookedIds(bookedIds);

      toast.success(
        t("bulkBooking.resultToast", {
          booked: response.booked,
          rejected: response.rejected,
        }),
      );
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
    if (groups.size === 0 && bulkMutation.data) {
      const byConnection = groupBookedIdsByConnection(bulkMutation.data);
      byConnection.forEach((ids) => {
        const printable = ids.filter((id) => {
          const row = bulkMutation.data?.results.find(
            (r) => r.shipment?.id === id,
          );
          return row?.shipment ? canPrintShipmentLabel(row.shipment) : false;
        });
        if (printable.length > 0) {
          void batchLabelsMutation.mutateAsync(printable);
        }
      });
      return;
    }
    if (groups.size > 1) {
      toast.error(t("toast.batchMixedConnections"));
      return;
    }
    void batchLabelsMutation.mutateAsync(printableLastBookedIds);
  };

  const isBusy =
    bulkMutation.isPending ||
    previewQuery.isFetching ||
    previewQuery.isDebouncing;
  const canSubmit =
    canSubmitBulkBook(drafts) &&
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
          {quota === null ? (
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
