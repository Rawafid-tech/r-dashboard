import { Loader2, Printer } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ShipmentIssueBadge } from "@/features/shipments/components/shipment-issue-badge";
import { ShipmentKindBadge } from "@/features/shipments/components/shipment-kind-badge";
import { ShipmentStatusBadge } from "@/features/shipments/components/shipment-status-badge";
import { canPrintShipmentLabel } from "@/features/shipments/lib/shipment-actions";
import { getShipmentKind } from "@/features/shipments/lib/shipment-kind";
import { useShipmentLabel } from "@/features/shipments/hooks/use-shipment-label";
import { useShipments } from "@/features/shipments/hooks/use-shipments";
import {
  MerchantPermission,
  useMerchantPermissions,
} from "@/shared/hooks/use-merchant-permissions";
import { Button } from "@/shared/components/ui";

interface OrderShipmentsSectionProps {
  orderId: string;
}

export function OrderShipmentsSection({ orderId }: OrderShipmentsSectionProps) {
  const { t } = useTranslation(["orders", "shipments"]);
  const { hasPermission } = useMerchantPermissions();
  const canReadLabels = hasPermission(MerchantPermission.SHIPMENT_READ);

  const shipmentsQuery = useShipments(
    { orderId, size: 20, sort: "CREATED_AT", direction: "DESC" },
    { enabled: Boolean(orderId) },
  );
  const labelMutation = useShipmentLabel();

  const shipments = shipmentsQuery.data?.content ?? [];

  return (
    <section
      className="rounded-lg border border-border/70 bg-muted/20 p-4"
      aria-labelledby="order-shipments-heading"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 id="order-shipments-heading" className="text-sm font-semibold">
          {t("shipments:orderSection.title")}
        </h3>
        <Button type="button" variant="link" className="h-auto p-0" asChild>
          <Link to={`/shipments?order=${encodeURIComponent(orderId)}`}>
            {t("shipments:orderSection.viewAll")}
          </Link>
        </Button>
      </div>

      {shipmentsQuery.isLoading ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          {t("common:common.loading")}
        </p>
      ) : null}

      {shipmentsQuery.isError ? (
        <p className="text-sm text-destructive" role="alert">
          {t("shipments:orderSection.loadFailed")}
        </p>
      ) : null}

      {!shipmentsQuery.isLoading &&
      !shipmentsQuery.isError &&
      shipments.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {t("shipments:orderSection.empty")}
        </p>
      ) : null}

      {shipments.length > 0 ? (
        <ul className="space-y-2">
          {shipments.map((shipment) => (
            <li
              key={shipment.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/60 bg-background px-3 py-2 text-sm"
            >
              <div className="min-w-0 space-y-1">
                <Link
                  to={`/shipments/${encodeURIComponent(shipment.id)}`}
                  className="font-medium tabular-nums text-primary underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                >
                  {shipment.trackingNumber ?? t("shipments:table.viewShipment")}
                </Link>
                <div className="flex flex-wrap items-center gap-1.5">
                  <ShipmentKindBadge shipment={shipment} />
                  <ShipmentStatusBadge
                    status={shipment.status}
                    kind={getShipmentKind(shipment)}
                    swappedAt={shipment.exchange?.swappedAt}
                  />
                  {shipment.issue ? (
                    <ShipmentIssueBadge issue={shipment.issue} />
                  ) : null}
                </div>
              </div>
              {canReadLabels && canPrintShipmentLabel(shipment) ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={labelMutation.isPending}
                  onClick={() =>
                    void labelMutation.mutateAsync({
                      id: shipment.id,
                      trackingNumber: shipment.trackingNumber,
                    })
                  }
                >
                  <Printer aria-hidden="true" />
                  {t("shipments:actions.printLabel")}
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
