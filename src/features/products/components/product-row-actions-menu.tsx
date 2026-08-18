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
import type { Product } from "@/features/products/types";

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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={t("table.openMenu", { name: product.name })}
        >
          <MoreHorizontal aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onSelect={() => onAction("edit", product)}>
          {t("actions.edit")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onSelect={() => onAction("delete", product)}
        >
          {t("actions.delete")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
