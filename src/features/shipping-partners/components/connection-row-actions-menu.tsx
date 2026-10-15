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
import type { CarrierConnection } from "@/features/shipping-partners/types";

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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={t("table.openMenu", { name: connection.name })}
        >
          <MoreHorizontal aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem
          onSelect={() => onAction("pickupLocations", connection)}
        >
          {t("actions.pickupLocations")}
        </DropdownMenuItem>
        {canManage && canEdit ? <DropdownMenuSeparator /> : null}
        {canManage && canEdit ? (
          <DropdownMenuItem onSelect={() => onAction("edit", connection)}>
            {t("actions.edit")}
          </DropdownMenuItem>
        ) : null}
        {canManage ? <DropdownMenuSeparator /> : null}
        {canManage ? (
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => onAction("remove", connection)}
          >
            {t("actions.remove")}
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
