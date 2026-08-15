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
import type { ShippingBox } from "@/features/shipping-boxes/types";

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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={t("table.openMenu", { name: box.name })}
        >
          <MoreHorizontal aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onSelect={() => onAction("edit", box)}>
          {t("actions.edit")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onSelect={() => onAction("delete", box)}
        >
          {t("actions.delete")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
