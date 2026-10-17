import { Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ProductCategory } from "@/features/products/types";
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

export type CategoryRowAction = "edit" | "delete";

interface CategoryRowActionsMenuProps {
  category: ProductCategory;
  onAction: (action: CategoryRowAction, category: ProductCategory) => void;
}

export function CategoryRowActionsMenu({
  category,
  onAction,
}: CategoryRowActionsMenuProps) {
  const { t } = useTranslation("products");
  const { hasPermission } = useMerchantPermissions();

  if (!hasPermission(MerchantPermission.PRODUCT_MANAGE)) {
    return null;
  }

  return (
    <TableRowActionsMenu>
      <TableRowActionsMenuTrigger
        ariaLabel={t("categories.tree.openMenu", { name: category.name })}
      />
      <TableRowActionsMenuContent>
        <TableRowActionsMenuItem
          icon={Pencil}
          onSelect={() => onAction("edit", category)}
        >
          {t("categories.actions.rename")}
        </TableRowActionsMenuItem>
        <TableRowActionsMenuSeparator />
        <TableRowActionsMenuItem
          icon={Trash2}
          variant="destructive"
          onSelect={() => onAction("delete", category)}
        >
          {t("categories.actions.delete")}
        </TableRowActionsMenuItem>
      </TableRowActionsMenuContent>
    </TableRowActionsMenu>
  );
}
