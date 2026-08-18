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
import type { ProductCategory } from "@/features/products/types";

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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={t("categories.tree.openMenu", { name: category.name })}
        >
          <MoreHorizontal aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onSelect={() => onAction("edit", category)}>
          {t("categories.actions.rename")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onSelect={() => onAction("delete", category)}
        >
          {t("categories.actions.delete")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
