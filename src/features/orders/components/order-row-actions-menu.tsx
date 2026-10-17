import {
  ArrowLeftRight,
  Eye,
  PackagePlus,
  Pencil,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { OrderListRow } from "@/features/orders/types";
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

export type OrderRowAction =
  | "view"
  | "edit"
  | "cancel"
  | "createShipment"
  | "bookReturn"
  | "bookExchange";

interface OrderRowActionsMenuProps {
  order: OrderListRow;
  onAction: (action: OrderRowAction, order: OrderListRow) => void;
}

export function OrderRowActionsMenu({
  order,
  onAction,
}: OrderRowActionsMenuProps) {
  const { t } = useTranslation("orders");
  const { hasPermission } = useMerchantPermissions();
  const canManage = hasPermission(MerchantPermission.ORDER_MANAGE);
  const canBookShipment = hasPermission(MerchantPermission.SHIPMENT_MANAGE);
  const canCreateShipment =
    order.status === "PENDING" || order.status === "RETURNED";
  const canBookReturn = order.status === "DELIVERED";
  const canEditOrCancel =
    order.status === "PENDING" || order.status === "RETURNED";
  return (
    <TableRowActionsMenu>
      <TableRowActionsMenuTrigger
        ariaLabel={t("table.openMenu", { number: order.orderNumber })}
      />
      <TableRowActionsMenuContent>
        <TableRowActionsMenuItem
          icon={Eye}
          onSelect={() => onAction("view", order)}
        >
          {t("actions.view")}
        </TableRowActionsMenuItem>
        {canBookShipment && canCreateShipment ? (
          <TableRowActionsMenuItem
            icon={PackagePlus}
            onSelect={() => onAction("createShipment", order)}
          >
            {t("actions.createShipment")}
          </TableRowActionsMenuItem>
        ) : null}
        {canBookShipment && canBookReturn ? (
          <TableRowActionsMenuItem
            icon={ArrowLeftRight}
            onSelect={() => onAction("bookExchange", order)}
          >
            {t("actions.bookExchange")}
          </TableRowActionsMenuItem>
        ) : null}
        {canBookShipment && canBookReturn ? (
          <TableRowActionsMenuItem
            icon={RotateCcw}
            onSelect={() => onAction("bookReturn", order)}
          >
            {t("actions.bookReturn")}
          </TableRowActionsMenuItem>
        ) : null}
        {canManage && canEditOrCancel ? (
          <TableRowActionsMenuItem
            icon={Pencil}
            onSelect={() => onAction("edit", order)}
          >
            {t("actions.edit")}
          </TableRowActionsMenuItem>
        ) : null}
        {canManage && canEditOrCancel ? (
          <>
            <TableRowActionsMenuSeparator />
            <TableRowActionsMenuItem
              icon={XCircle}
              variant="destructive"
              onSelect={() => onAction("cancel", order)}
            >
              {t("actions.cancel")}
            </TableRowActionsMenuItem>
          </>
        ) : null}
      </TableRowActionsMenuContent>
    </TableRowActionsMenu>
  );
}
