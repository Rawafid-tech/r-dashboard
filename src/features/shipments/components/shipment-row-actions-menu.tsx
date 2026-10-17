import { Ban, Eye, Printer } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  canCancelShipment,
  canPrintShipmentLabel,
} from "@/features/shipments/lib/shipment-actions";
import type { Shipment } from "@/features/shipments/types";
import {
  TableRowActionsMenu,
  TableRowActionsMenuContent,
  TableRowActionsMenuItem,
  TableRowActionsMenuSeparator,
  TableRowActionsMenuTrigger,
} from "@/shared/components/data-display/table-row-actions-menu";
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
    <TableRowActionsMenu>
      <TableRowActionsMenuTrigger
        ariaLabel={t("table.openMenu", {
          number: shipment.order.orderNumber,
        })}
      />
      <TableRowActionsMenuContent>
        {canRead ? (
          <TableRowActionsMenuItem
            icon={Eye}
            onSelect={() => onAction("view", shipment)}
          >
            {t("actions.viewDetails")}
          </TableRowActionsMenuItem>
        ) : null}
        {canRead && canPrint ? (
          <TableRowActionsMenuItem
            icon={Printer}
            onSelect={() => onAction("print", shipment)}
          >
            {t("actions.printLabel")}
          </TableRowActionsMenuItem>
        ) : null}
        {canManage && canCancel ? (
          <>
            <TableRowActionsMenuSeparator />
            <TableRowActionsMenuItem
              icon={Ban}
              variant="destructive"
              onSelect={() => onAction("cancel", shipment)}
            >
              {t("actions.cancel")}
            </TableRowActionsMenuItem>
          </>
        ) : null}
      </TableRowActionsMenuContent>
    </TableRowActionsMenu>
  );
}
