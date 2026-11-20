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
  /** False when the carrier has no pickup location to map. */
  hasPickup: boolean;
  onAction: (action: ConnectionRowAction, connection: CarrierConnection) => void;
}

export function ConnectionRowActionsMenu({
  connection,
  canEdit,
  canManage,
  hasPickup,
  onAction,
}: ConnectionRowActionsMenuProps) {
  const { t } = useTranslation("shippingPartners");
  const showEdit = canManage && canEdit;
  if (!hasPickup && !canManage) return null;

  return (
    <TableRowActionsMenu>
      <TableRowActionsMenuTrigger
        ariaLabel={t("table.openMenu", { name: connection.name })}
      />
      <TableRowActionsMenuContent>
        {hasPickup ? (
          <TableRowActionsMenuItem
            icon={MapPin}
            onSelect={() => onAction("pickupLocations", connection)}
          >
            {t("actions.pickupLocations")}
          </TableRowActionsMenuItem>
        ) : null}
        {hasPickup && showEdit ? <TableRowActionsMenuSeparator /> : null}
        {showEdit ? (
          <TableRowActionsMenuItem
            icon={Pencil}
            onSelect={() => onAction("edit", connection)}
          >
            {t("actions.edit")}
          </TableRowActionsMenuItem>
        ) : null}
        {canManage && (hasPickup || showEdit) ? (
          <TableRowActionsMenuSeparator />
        ) : null}
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
