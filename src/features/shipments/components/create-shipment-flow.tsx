import { useEffect, useId, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { getShipment } from "@/features/shipments/api/shipments.api";
import { ShipmentDistrictCombobox } from "@/features/shipments/components/shipment-district-combobox";
import {
  ShipmentPickupInfo,
  ShipmentPickupProblemLink,
} from "@/features/shipments/components/shipment-pickup-info";
import { useBookShipment } from "@/features/shipments/hooks/use-book-shipment";
import { shipmentKeys } from "@/features/shipments/hooks/query-keys";
import { useShipmentPreview } from "@/features/shipments/hooks/use-shipment-preview";
import { getShipmentDistrictLabel } from "@/features/shipments/lib/district-label";
import { parseShipmentBookingError } from "@/features/shipments/lib/shipment-booking-errors";
import type { ShipmentDistrict } from "@/features/shipments/types";
import { CarrierMark } from "@/features/shipping-partners/components/carrier-mark";
import { useSenderLocations } from "@/features/locations/hooks/use-sender-locations";
import { useCarrierConnections } from "@/features/shipping-partners/hooks/use-carrier-connections";
import { carrierDisplayName } from "@/features/shipping-partners/lib/carrier-label";
import type { CarrierConnection } from "@/features/shipping-partners/types";
import type { OrderListRow } from "@/features/orders/types";
import { orderKeys } from "@/features/orders/hooks/use-orders";
import { parseApiError } from "@/shared/api/error-handler";
import { formatCurrency } from "@/shared/lib/formatters";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui";
import { useLocaleStore } from "@/stores/locale.store";

const BOOKING_POLL_MS = 5_000;
const BOOKING_MAX_POLLS = 24;

type FlowStep = "connection" | "confirm" | "polling";

interface CreateShipmentFlowProps {
  order: OrderListRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditOrder: (order: OrderListRow) => void;
}

export function CreateShipmentFlow({
  order,
  open,
  onOpenChange,
  onEditOrder,
}: CreateShipmentFlowProps) {
  const { t } = useTranslation(["shipments", "common"]);
  const locale = useLocaleStore((state) => state.locale);
  const intlLocale = locale === "ar" ? "ar-EG" : "en-US";
  const formId = useId();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<FlowStep>("connection");
  const [connection, setConnection] = useState<CarrierConnection | null>(null);
  const [pickedDistrict, setPickedDistrict] = useState<ShipmentDistrict | null>(
    null,
  );
  const [pollingShipmentId, setPollingShipmentId] = useState<string | null>(
    null,
  );
  const [pollingStatus, setPollingStatus] = useState<string>("BOOKING");
  const [bookError, setBookError] = useState<string | null>(null);

  const connectionsQuery = useCarrierConnections(
    { active: true, size: 100 },
    { enabled: open },
  );
  const senderLocationsQuery = useSenderLocations({ size: 1 }, { enabled: open });
  const showDefaultPickupWarning =
    (senderLocationsQuery.data?.totalElements ?? 0) > 1;
  const bookMutation = useBookShipment();

  const previewParams = useMemo(() => {
    if (!order || !connection) return null;
    return {
      orderId: order.id,
      connectionId: connection.id,
      districtId: pickedDistrict?.id,
    };
  }, [order, connection, pickedDistrict?.id]);

  const previewQuery = useShipmentPreview(previewParams, {
    enabled: open && step === "confirm" && Boolean(previewParams),
  });

  const preview = previewQuery.data;
  const needsDistrictPicker = preview?.address.method === "NONE";

  useEffect(() => {
    if (!open) {
      setStep("connection");
      setConnection(null);
      setPickedDistrict(null);
      setPollingShipmentId(null);
      setPollingStatus("BOOKING");
      setBookError(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open || !pollingShipmentId || step !== "polling") return;

    let pollCount = 0;
    let cancelled = false;
    let timer: number | null = null;

    const finishPolling = () => {
      if (timer !== null) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    const tick = async () => {
      if (cancelled) return;
      pollCount += 1;

      try {
        const shipment = await queryClient.fetchQuery({
          queryKey: shipmentKeys.detail(pollingShipmentId),
          queryFn: ({ signal }) => getShipment(pollingShipmentId, signal),
        });
        setPollingStatus(shipment.status);

        if (shipment.status !== "BOOKING") {
          finishPolling();
          void queryClient.invalidateQueries({ queryKey: shipmentKeys.all });
          void queryClient.invalidateQueries({ queryKey: orderKeys.all });

          if (shipment.status === "BOOKED") {
            onOpenChange(false);
          } else if (shipment.status === "FAILED") {
            setBookError(shipment.failure?.message ?? t("toast.cancelFailed"));
            setStep("confirm");
            setPollingShipmentId(null);
          }
          return;
        }
      } catch {
        // Keep polling until max attempts.
      }

      if (pollCount >= BOOKING_MAX_POLLS) {
        finishPolling();
        setBookError(t("booking.confirmingDescription"));
        setStep("confirm");
        setPollingShipmentId(null);
      }
    };

    void tick();
    timer = window.setInterval(() => {
      void tick();
    }, BOOKING_POLL_MS);

    return () => {
      cancelled = true;
      finishPolling();
    };
  }, [open, pollingShipmentId, step, queryClient, onOpenChange, t]);

  const handleClose = (next: boolean) => {
    if (bookMutation.isPending) return;
    if (step === "polling") return;
    onOpenChange(next);
  };

  const handleBook = async () => {
    if (!order || !connection || !preview?.bookable) return;
    setBookError(null);

    try {
      const result = await bookMutation.mutateAsync({
        orderId: order.id,
        connectionId: connection.id,
        districtId: pickedDistrict?.id ?? null,
      });

      if (result.status === 202 || result.shipment.status === "BOOKING") {
        setPollingShipmentId(result.shipment.id);
        setPollingStatus("BOOKING");
        setStep("polling");
        return;
      }

      onOpenChange(false);
    } catch (error) {
      const parsed = parseShipmentBookingError(error);
      setBookError(parsed.detail || parseApiError(error).detail);
    }
  };

  const connections = connectionsQuery.data?.content ?? [];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        size="w2"
        className="gap-0 overflow-hidden"
        showCloseButton={step !== "polling"}
        closeLabel={t("common:common.close")}
      >
        {step === "connection" ? (
          <>
            <DialogHeader className="border-b border-border/60 pe-10">
              <DialogTitle>{t("booking.connectionTitle")}</DialogTitle>
              <DialogDescription>
                {order
                  ? t("booking.connectionDescription")
                  : t("booking.connectionDescription")}
              </DialogDescription>
            </DialogHeader>

            <div className="max-h-[min(60vh,28rem)] overflow-y-auto px-6 py-4">
              {connectionsQuery.isLoading ? (
                <p className="text-sm text-muted-foreground" role="status">
                  {t("common:common.loading")}
                </p>
              ) : connections.length === 0 ? (
                <div className="space-y-3">
                  <p className="font-medium">{t("booking.noConnectionsTitle")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("booking.noConnectionsDescription")}
                  </p>
                  <Button type="button" variant="outline" asChild>
                    <Link to="/shipping-partners">
                      {t("booking.goToPartners")}
                    </Link>
                  </Button>
                </div>
              ) : (
                <ul className="space-y-2">
                  {connections.map((item) => {
                    const carrierName = carrierDisplayName(
                      item.carrier,
                      locale,
                    );
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          className="flex w-full items-center gap-3 rounded-lg border border-border/70 px-3 py-3 text-start transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                          onClick={() => {
                            setConnection(item);
                            setPickedDistrict(null);
                            setStep("confirm");
                          }}
                        >
                          <CarrierMark code={item.carrier.code} name={carrierName} />
                          <span className="min-w-0 flex-1">
                            <span className="block font-medium">{item.name}</span>
                            <span className="block text-xs text-muted-foreground">
                              {carrierName}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleClose(false)}>
                {t("booking.close")}
              </Button>
            </DialogFooter>
          </>
        ) : null}

        {step === "confirm" && order && connection ? (
          <>
            <DialogHeader className="border-b border-border/60 pe-10">
              <DialogTitle>{t("booking.confirmTitle")}</DialogTitle>
              <DialogDescription>{t("booking.confirmDescription")}</DialogDescription>
            </DialogHeader>

            <div className="max-h-[min(65vh,32rem)] space-y-4 overflow-y-auto px-6 py-4">
              <div className="rounded-lg border border-border/70 bg-muted/30 p-3 text-sm">
                <p className="font-medium">{order.orderNumber}</p>
                <p className="text-muted-foreground">
                  {order.receiverName} · {order.receiverPhone}
                </p>
                <p className="text-muted-foreground">
                  {order.area} ·{" "}
                  {formatCurrency(order.codAmount ?? 0, order.currency, intlLocale)}
                </p>
              </div>

              {previewQuery.isLoading ? (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  {t("common:common.loading")}
                </p>
              ) : null}

              {previewQuery.isError ? (
                <div
                  role="alert"
                  className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm"
                >
                  <p className="font-medium text-destructive">
                    {t("errors.loadFailed")}
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    {parseApiError(previewQuery.error).detail}
                  </p>
                </div>
              ) : null}

              {preview ? (
                <>
                  {preview.quota === null ? (
                    <div className="rounded-lg border border-border/70 bg-muted/40 p-3 text-sm">
                      <p className="font-medium">{t("booking.subscriptionRequired")}</p>
                      <div className="mt-2">
                        <Button type="button" size="sm" variant="outline" asChild>
                          <Link to="/billing">{t("booking.upgradePlan")}</Link>
                        </Button>
                      </div>
                    </div>
                  ) : preview.quota.remaining === 0 ? (
                    <div
                      role="alert"
                      className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm"
                    >
                      <p className="font-medium text-destructive">
                        {t("booking.quotaExceeded")}
                      </p>
                      <p className="mt-1 text-muted-foreground">
                        {t("booking.quota", {
                          used: preview.quota.used,
                          limit: preview.quota.limit,
                        })}
                      </p>
                      <div className="mt-2">
                        <Button type="button" size="sm" variant="outline" asChild>
                          <Link to="/billing">{t("booking.upgradePlan")}</Link>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {t("booking.quota", {
                        used: preview.quota.used,
                        limit: preview.quota.limit,
                      })}
                    </p>
                  )}

                  {preview.pickup ? (
                    <ShipmentPickupInfo
                      pickup={preview.pickup}
                      connectionId={connection.id}
                      showDefaultWarning={showDefaultPickupWarning}
                    />
                  ) : null}

                  {preview.address.district &&
                  preview.address.method !== "NONE" ? (
                    <div>
                      <p className="text-sm font-medium">
                        {t("booking.matchedDistrict")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {getShipmentDistrictLabel(
                          preview.address.district,
                          locale,
                        )}
                      </p>
                    </div>
                  ) : null}

                  {preview.address.suggestions.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">
                        {t("booking.suggestions")}
                      </p>
                      <ul className="flex flex-wrap gap-2">
                        {preview.address.suggestions.map((district) => (
                          <li key={district.id}>
                            <Button
                              type="button"
                              size="sm"
                              variant={
                                pickedDistrict?.id === district.id
                                  ? "default"
                                  : "outline"
                              }
                              onClick={() => setPickedDistrict(district)}
                            >
                              {getShipmentDistrictLabel(district, locale)}
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {needsDistrictPicker ? (
                    <ShipmentDistrictCombobox
                      id={`${formId}-district`}
                      connectionId={connection.id}
                      governorateId={order.governorate.id}
                      selectedDistrict={pickedDistrict}
                      onSelect={setPickedDistrict}
                      disabled={bookMutation.isPending}
                    />
                  ) : null}

                  {preview.problems.length > 0 ? (
                    <div
                      role="alert"
                      className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm"
                    >
                      <p className="font-medium text-destructive">
                        {t("booking.problemsTitle")}
                      </p>
                      <ul className="mt-2 list-disc space-y-1 ps-4 text-muted-foreground">
                        {preview.problems.map((problem) => (
                          <li key={problem.code}>
                            {problem.message}
                            {problem.code === "PICKUP_LOCATION" ? (
                              <>
                                {" "}
                                <ShipmentPickupProblemLink
                                  connectionId={connection.id}
                                />
                              </>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {bookError ? (
                    <div
                      role="alert"
                      className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
                    >
                      {bookError}
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>

            <DialogFooter className="flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={bookMutation.isPending}
                onClick={() => {
                  setStep("connection");
                  setBookError(null);
                }}
              >
                {t("booking.back")}
              </Button>
              {preview?.problems.length ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    onEditOrder(order);
                    onOpenChange(false);
                  }}
                >
                  {t("booking.editOrder")}
                </Button>
              ) : null}
              <Button
                type="button"
                disabled={
                  !preview?.bookable ||
                  bookMutation.isPending ||
                  previewQuery.isFetching
                }
                onClick={() => void handleBook()}
              >
                {bookMutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin" aria-hidden="true" />
                    {t("booking.booking")}
                  </>
                ) : (
                  t("booking.book")
                )}
              </Button>
            </DialogFooter>
          </>
        ) : null}

        {step === "polling" ? (
          <>
            <DialogHeader className="border-b border-border/60 pe-10">
              <DialogTitle>{t("booking.confirmingTitle")}</DialogTitle>
              <DialogDescription>
                {t("booking.confirmingDescription")}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 px-6 py-6">
              <p className="flex items-center gap-2 text-sm">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                {t("booking.bookAgainBlocked")}
              </p>
              <p className="sr-only" aria-live="polite" aria-atomic="true">
                {t("booking.confirmingLive", { status: pollingStatus })}
              </p>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
