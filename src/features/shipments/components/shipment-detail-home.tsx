import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Navigate, useParams } from "react-router-dom";
import { ShipmentCancelDialog } from "@/features/shipments/components/shipment-cancel-dialog";
import { ShipmentDetailHero } from "@/features/shipments/components/shipment-detail-hero";
import { ShipmentDetailSkeleton } from "@/features/shipments/components/shipment-detail-skeleton";
import { ShipmentDetailSummary } from "@/features/shipments/components/shipment-detail-summary";
import { ShipmentFailureBanner } from "@/features/shipments/components/shipment-failure-banner";
import { ShipmentExchangeSection } from "@/features/shipments/components/shipment-exchange-section";
import { ShipmentReturnPickupSection } from "@/features/shipments/components/shipment-return-pickup-section";
import { ShipmentDetailTimeline } from "@/features/shipments/components/shipment-detail-timeline";
import { ShipmentsErrorState } from "@/features/shipments/components/shipments-error-state";
import { useShipmentLabel } from "@/features/shipments/hooks/use-shipment-label";
import { useShipment } from "@/features/shipments/hooks/use-shipment";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function ShipmentDetailHome() {
  const { t } = useTranslation("shipments");
  const { shipmentId } = useParams<{ shipmentId: string }>();
  const [cancelOpen, setCancelOpen] = useState(false);

  const isValidId = Boolean(shipmentId && UUID_PATTERN.test(shipmentId));

  const shipmentQuery = useShipment(isValidId ? shipmentId! : null, {
    live: true,
  });
  const labelMutation = useShipmentLabel();

  const orderNumber = shipmentQuery.data?.order.orderNumber;
  const trackingNumber = shipmentQuery.data?.trackingNumber;

  useEffect(() => {
    if (!orderNumber) return;
    const previousTitle = document.title;
    const heading = t("detail.titleForOrder", { orderNumber });
    document.title = trackingNumber
      ? `${heading} · ${trackingNumber} — ${t("hero.title")}`
      : `${heading} — ${t("hero.title")}`;
    return () => {
      document.title = previousTitle;
    };
  }, [orderNumber, trackingNumber, t]);

  if (!isValidId) {
    return <Navigate to="/shipments" replace />;
  }

  const isInitialLoading = shipmentQuery.isLoading && !shipmentQuery.data;
  const isNotFound =
    shipmentQuery.isError &&
    (shipmentQuery.error as { response?: { status?: number } })?.response
      ?.status === 404;

  if (isNotFound) {
    return <Navigate to="/shipments" replace />;
  }

  const shipment = shipmentQuery.data;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <a
        href="#shipment-detail-main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        {t("detail.skipToContent")}
      </a>

      {isInitialLoading ? <ShipmentDetailSkeleton /> : null}

      {shipmentQuery.isError && !isNotFound ? (
        <ShipmentsErrorState
          onRetry={() => void shipmentQuery.refetch()}
          isRetrying={shipmentQuery.isFetching}
        />
      ) : null}

      {shipment ? (
        <div id="shipment-detail-main" className="space-y-6">
          <ShipmentDetailHero
            shipment={shipment}
            isFetching={shipmentQuery.isFetching && !shipmentQuery.isLoading}
            isPrintPending={labelMutation.isPending}
            onPrintLabel={() =>
              void labelMutation.mutateAsync({
                id: shipment.id,
                trackingNumber: shipment.trackingNumber,
              })
            }
            onCancel={() => setCancelOpen(true)}
          />

          <ShipmentFailureBanner shipment={shipment} />
          <ShipmentReturnPickupSection shipment={shipment} />
          <ShipmentExchangeSection shipment={shipment} />

          <div className="grid min-w-0 gap-6 lg:grid-cols-2">
            <div className="min-w-0">
              <ShipmentDetailSummary shipment={shipment} />
            </div>
            <section
              className="min-w-0 rounded-lg border border-border/70 bg-muted/20 p-4 sm:p-5"
              aria-labelledby="shipment-timeline-heading"
            >
              <h2
                id="shipment-timeline-heading"
                className="mb-4 text-sm font-semibold"
              >
                {t("detail.timeline.heading")}
              </h2>
              <ShipmentDetailTimeline entries={shipment.timeline} />
            </section>
          </div>
        </div>
      ) : null}

      <ShipmentCancelDialog
        shipment={shipment ?? null}
        open={cancelOpen}
        onOpenChange={setCancelOpen}
      />
    </div>
  );
}
