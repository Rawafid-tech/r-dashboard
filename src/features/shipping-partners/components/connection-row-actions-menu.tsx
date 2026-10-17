import { MapPin, Pencil, Unplug } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { CarrierConnection } from "@/features/shipping-partners/types";
import {
  TableRowActionsMenu,
  TableRowActionsMenuContent,
  TableRowActionsMenuItem,
  TableRowActionsMenuSeparator,
  TableRowActionsMenuTrigger,
} from "@/shared/components/data-display/table-row-actions-menu";

export type ConnectionRowAction = "edit" | "remove" | "pickupLocations";

interface ConnectionRowActionsMenuProps {
  connection: CarrierConnection;
  canEdit: boolean;
  canManage: boolean;
  onAction: (action: ConnectionRowAction, connection: CarrierConnection) => void;
}

export function ConnectionRowActionsMenu({
  connection,
  canEdit,
  canManage,
  onAction,
}: ConnectionRowActionsMenuProps) {
  const { t } = useTranslation("shippingPartners");

  return (
    <TableRowActionsMenu>
      <TableRowActionsMenuTrigger
        ariaLabel={t("table.openMenu", { name: connection.name })}
      />
      <TableRowActionsMenuContent>
        <TableRowActionsMenuItem
          icon={MapPin}
          onSelect={() => onAction("pickupLocations", connection)}
        >
          {t("actions.pickupLocations")}
        </TableRowActionsMenuItem>
        {canManage && canEdit ? <TableRowActionsMenuSeparator /> : null}
        {canManage && canEdit ? (
          <TableRowActionsMenuItem
            icon={Pencil}
            onSelect={() => onAction("edit", connection)}
          >
            {t("actions.edit")}
          </TableRowActionsMenuItem>
        ) : null}
        {canManage ? <TableRowActionsMenuSeparator /> : null}
        {canManage ? (
          <TableRowActionsMenuItem
            icon={Unplug}
            variant="destructive"
            onSelect={() => onAction("remove", connection)}
          >
            {t("actions.remove")}
          </TableRowActionsMenuItem>
        ) : null}
      </TableRowActionsMenuContent>
    </TableRowActionsMenu>
  );
}
