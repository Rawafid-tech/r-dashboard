import { MoreHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  canCancelShipment,
  canPrintShipmentLabel,
} from "@/features/shipments/lib/shipment-actions";
import type { Shipment } from "@/features/shipments/types";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui";
import {
  MerchantPermission,
  useMerchantPermissions,
} from "@/shared/hooks/use-merchant-permissions";

export type ShipmentRowAction = "view" | "print" | "cancel";

interface ShipmentRowActionsMenuProps {
  shipment: Shipment;
  onAction: (action: ShipmentRowAction, shipment: Shipment) => void;
}

export function ShipmentRowActionsMenu({
  shipment,
  onAction,
}: ShipmentRowActionsMenuProps) {
  const { t } = useTranslation("shipments");
  const { hasPermission } = useMerchantPermissions();
  const canRead = hasPermission(MerchantPermission.SHIPMENT_READ);
  const canManage = hasPermission(MerchantPermission.SHIPMENT_MANAGE);
  const canPrint = canPrintShipmentLabel(shipment);
  const canCancel = canCancelShipment(shipment.status);

  if (!canRead && !canManage) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={t("table.openMenu", {
            number: shipment.order.orderNumber,
          })}
        >
          <MoreHorizontal aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {canRead ? (
          <DropdownMenuItem onSelect={() => onAction("view", shipment)}>
            {t("actions.viewDetails")}
          </DropdownMenuItem>
        ) : null}
        {canRead && canPrint ? (
          <DropdownMenuItem onSelect={() => onAction("print", shipment)}>
            {t("actions.printLabel")}
          </DropdownMenuItem>
        ) : null}
        {canManage && canCancel ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => onAction("cancel", shipment)}
            >
              {t("actions.cancel")}
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
