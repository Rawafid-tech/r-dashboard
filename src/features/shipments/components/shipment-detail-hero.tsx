import { ArrowLeft, Printer } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ShipmentStatusBadge } from "@/features/shipments/components/shipment-status-badge";
import {
  canCancelShipment,
  canPrintShipmentLabel,
} from "@/features/shipments/lib/shipment-actions";
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
  const canPrint = canPrintShipmentLabel(shipment.status);
  const canCancel = canCancelShipment(shipment.status);

  return (
    <div className="space-y-4">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="-ms-2 w-fit text-muted-foreground hover:text-foreground"
      >
        <Link to="/shipments">
          <ArrowLeft aria-hidden="true" />
          {t("detail.backToList")}
        </Link>
      </Button>

      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-3">
            <span className="tabular-nums">
              {shipment.trackingNumber ?? t("detail.noTracking")}
            </span>
            <ShipmentStatusBadge status={shipment.status} />
            {isFetching ? (
              <span className="text-xs font-normal text-muted-foreground">
                {t("detail.refreshing")}
              </span>
            ) : null}
          </span>
        }
        description={
          shipment.carrierState?.label ? (
            <span className="text-sm text-muted-foreground">
              {t("detail.carrierState", {
                label: shipment.carrierState.label,
              })}
            </span>
          ) : undefined
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
