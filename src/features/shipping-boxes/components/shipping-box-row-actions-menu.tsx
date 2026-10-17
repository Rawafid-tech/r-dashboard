import { Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ShippingBox } from "@/features/shipping-boxes/types";
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

export type ShippingBoxRowAction = "edit" | "delete";

interface ShippingBoxRowActionsMenuProps {
  box: ShippingBox;
  onAction: (action: ShippingBoxRowAction, box: ShippingBox) => void;
}

export function ShippingBoxRowActionsMenu({
  box,
  onAction,
}: ShippingBoxRowActionsMenuProps) {
  const { t } = useTranslation("shippingBoxes");
  const { hasPermission } = useMerchantPermissions();

  if (!hasPermission(MerchantPermission.SHIPPING_BOX_MANAGE)) {
    return null;
  }

  return (
    <TableRowActionsMenu>
      <TableRowActionsMenuTrigger
        ariaLabel={t("table.openMenu", { name: box.name })}
      />
      <TableRowActionsMenuContent>
        <TableRowActionsMenuItem
          icon={Pencil}
          onSelect={() => onAction("edit", box)}
        >
          {t("actions.edit")}
        </TableRowActionsMenuItem>
        <TableRowActionsMenuSeparator />
        <TableRowActionsMenuItem
          icon={Trash2}
          variant="destructive"
          onSelect={() => onAction("delete", box)}
        >
          {t("actions.delete")}
        </TableRowActionsMenuItem>
      </TableRowActionsMenuContent>
    </TableRowActionsMenu>
  );
}
