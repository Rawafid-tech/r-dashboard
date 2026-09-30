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

export type ConnectionRowAction = "edit" | "remove";

interface ConnectionRowActionsMenuProps {
  connection: CarrierConnection;
  canEdit: boolean;
  onAction: (action: ConnectionRowAction, connection: CarrierConnection) => void;
}

export function ConnectionRowActionsMenu({
  connection,
  canEdit,
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
      <DropdownMenuContent align="end" className="w-44">
        {canEdit ? (
          <DropdownMenuItem onSelect={() => onAction("edit", connection)}>
            {t("actions.edit")}
          </DropdownMenuItem>
        ) : null}
        {canEdit ? <DropdownMenuSeparator /> : null}
        <DropdownMenuItem
          variant="destructive"
          onSelect={() => onAction("remove", connection)}
        >
          {t("actions.remove")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
