import { Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Product } from "@/features/products/types";
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

export type ProductRowAction = "edit" | "delete";

interface ProductRowActionsMenuProps {
  product: Product;
  onAction: (action: ProductRowAction, product: Product) => void;
}

export function ProductRowActionsMenu({
  product,
  onAction,
}: ProductRowActionsMenuProps) {
  const { t } = useTranslation("products");
  const { hasPermission } = useMerchantPermissions();

  if (!hasPermission(MerchantPermission.PRODUCT_MANAGE)) {
    return null;
  }

  return (
    <TableRowActionsMenu>
      <TableRowActionsMenuTrigger
        ariaLabel={t("table.openMenu", { name: product.name })}
      />
      <TableRowActionsMenuContent>
        <TableRowActionsMenuItem
          icon={Pencil}
          onSelect={() => onAction("edit", product)}
        >
          {t("actions.edit")}
        </TableRowActionsMenuItem>
        <TableRowActionsMenuSeparator />
        <TableRowActionsMenuItem
          icon={Trash2}
          variant="destructive"
          onSelect={() => onAction("delete", product)}
        >
          {t("actions.delete")}
        </TableRowActionsMenuItem>
      </TableRowActionsMenuContent>
    </TableRowActionsMenu>
  );
}
