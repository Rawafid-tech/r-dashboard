import { ArrowLeft, Printer } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ShipmentStatusBadge } from "@/features/shipments/components/shipment-status-badge";
import {
  canCancelShipment,
  canPrintShipmentLabel,
} from "@/features/shipments/lib/shipment-actions";
import { ShipmentKindBadge } from "@/features/shipments/components/shipment-kind-badge";
import { getShipmentKind } from "@/features/shipments/lib/shipment-kind";
import type { Shipment } from "@/features/shipments/types";
import { PageHeader } from "@/shared/components/layout/page-header";
import { Button } from "@/shared/components/ui";
import {
  MerchantPermission,
  useMerchantPermissions,
} from "@/shared/hooks/use-merchant-permissions";

interface ShipmentDetailHeroProps {
  shipment: Shipment;
  isFetching?: boolean;
  onPrintLabel: () => void;
  onCancel: () => void;
  isPrintPending?: boolean;
}

export function ShipmentDetailHero({
  shipment,
  isFetching = false,
  onPrintLabel,
  onCancel,
  isPrintPending = false,
}: ShipmentDetailHeroProps) {
  const { t } = useTranslation("shipments");
  const { hasPermission } = useMerchantPermissions();
  const canRead = hasPermission(MerchantPermission.SHIPMENT_READ);
  const canManage = hasPermission(MerchantPermission.SHIPMENT_MANAGE);
  const canPrint = canPrintShipmentLabel(shipment);
  const kind = getShipmentKind(shipment);
  const canCancel = canCancelShipment(shipment);

  return (
    <div className="space-y-4">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="-ms-2 w-fit text-muted-foreground hover:text-foreground"
      >
        <Link to="/shipments">
          <ArrowLeft className="rtl:-scale-x-100" aria-hidden="true" />
          {t("detail.backToList")}
        </Link>
      </Button>

      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-3">
            {/* Waybill numbers can be reused by the carrier, so the order leads. */}
            <span className="tabular-nums">
              {t("detail.titleForOrder", {
                orderNumber: shipment.order.orderNumber,
              })}
            </span>
            <ShipmentStatusBadge
              status={shipment.status}
              kind={kind}
              swappedAt={shipment.exchange?.swappedAt}
            />
            <ShipmentKindBadge shipment={shipment} />
            {isFetching ? (
              <span className="text-xs font-normal text-muted-foreground">
                {t("detail.refreshing")}
              </span>
            ) : null}
          </span>
        }
        description={
          <span className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>
              {shipment.trackingNumber ? (
                <>
                  {t("detail.waybill")}{" "}
                  <span dir="ltr" className="font-medium tabular-nums text-foreground">
                    {shipment.trackingNumber}
                  </span>
                </>
              ) : (
                t("detail.noTracking")
              )}
            </span>
            {shipment.carrierState?.label ? (
              <span>
                {t("detail.carrierState", {
                  label: shipment.carrierState.label,
                })}
              </span>
            ) : null}
          </span>
        }
        actions={
          <div className="flex flex-wrap gap-2">
            {canRead && canPrint ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isPrintPending}
                onClick={onPrintLabel}
              >
                <Printer aria-hidden="true" />
                {t("actions.printLabel")}
              </Button>
            ) : null}
            {canManage && canCancel ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={onCancel}
              >
                {t("actions.cancel")}
              </Button>
            ) : null}
          </div>
        }
      />
    </div>
  );
}
