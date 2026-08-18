import { Fragment } from "react";
import { FolderTree } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocaleStore } from "@/stores/locale.store";
import type { CategoryRowAction } from "@/features/products/components/category-row-actions-menu";
import { CategoryRowActionsMenu } from "@/features/products/components/category-row-actions-menu";
import type { ProductCategory } from "@/features/products/types";

interface CategoriesTabProps {
  categories: ProductCategory[];
  canManage?: boolean;
  onAction: (action: CategoryRowAction, category: ProductCategory) => void;
}

export function CategoriesTab({
  categories,
  canManage = false,
  onAction,
}: CategoriesTabProps) {
  const { t } = useTranslation("products");
  const locale = useLocaleStore((state) => state.locale);
  const intlLocale = locale === "ar" ? "ar-EG" : "en-US";

  if (categories.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/15 px-6 py-14 text-center"
        role="status"
      >
        <span
          className="grid size-12 place-items-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15"
          aria-hidden="true"
        >
          <FolderTree className="size-5" />
        </span>
        <h3 className="mt-4 text-base font-semibold text-foreground">
          {t("categories.tree.emptyTitle")}
        </h3>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          {t("categories.tree.emptyDescription")}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
      <table className="w-full text-sm">
        <caption className="sr-only">{t("categories.tree.caption")}</caption>
        <thead className="border-b border-border/60 bg-muted/30">
          <tr>
            <th scope="col" className="px-4 py-3 text-start font-medium">
              {t("categories.tree.name")}
            </th>
            <th
              scope="col"
              className="hidden px-4 py-3 text-end font-medium sm:table-cell"
            >
              {t("categories.tree.products")}
            </th>
            {canManage ? (
              <th scope="col" className="px-4 py-3 text-end">
                <span className="sr-only">{t("categories.tree.actions")}</span>
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {categories.map((parent) => (
            <Fragment key={parent.id}>
              <CategoryRow
                category={parent}
                intlLocale={intlLocale}
                canManage={canManage}
                onAction={onAction}
              />
              {parent.children.map((child) => (
                <CategoryRow
                  key={child.id}
                  category={child}
                  intlLocale={intlLocale}
                  canManage={canManage}
                  onAction={onAction}
                  isChild
                  parentName={parent.name}
                />
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface CategoryRowProps {
  category: ProductCategory;
  intlLocale: string;
  canManage: boolean;
  onAction: (action: CategoryRowAction, category: ProductCategory) => void;
  isChild?: boolean;
  parentName?: string;
}

function CategoryRow({
  category,
  intlLocale,
  canManage,
  onAction,
  isChild,
  parentName,
}: CategoryRowProps) {
  const { t } = useTranslation("products");

  return (
    <tr className="border-b border-border/40 last:border-b-0">
      <td className="px-4 py-3">
        <div
          className={isChild ? "ps-6 border-s-2 border-border/50 ms-2" : ""}
        >
          <span className="font-medium text-foreground">{category.name}</span>
          {isChild && parentName ? (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t("categories.tree.subCategory", { parent: parentName })}
            </p>
          ) : null}
        </div>
      </td>
      <td className="hidden px-4 py-3 text-end tabular-nums sm:table-cell">
        {category.productCount.toLocaleString(intlLocale)}
      </td>
      {canManage ? (
        <td className="px-4 py-3 text-end">
          <CategoryRowActionsMenu category={category} onAction={onAction} />
        </td>
      ) : null}
    </tr>
  );
}
