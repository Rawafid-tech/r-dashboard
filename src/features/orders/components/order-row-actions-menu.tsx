import { MoreHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";
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
import type { OrderListRow } from "@/features/orders/types";

export type OrderRowAction = "view" | "edit" | "cancel";

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
  const isCancelled = order.status === "CANCELLED";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={t("table.openMenu", { number: order.orderNumber })}
        >
          <MoreHorizontal aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onSelect={() => onAction("view", order)}>
          {t("actions.view")}
        </DropdownMenuItem>
        {canManage && !isCancelled ? (
          <DropdownMenuItem onSelect={() => onAction("edit", order)}>
            {t("actions.edit")}
          </DropdownMenuItem>
        ) : null}
        {canManage && !isCancelled ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => onAction("cancel", order)}
            >
              {t("actions.cancel")}
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
