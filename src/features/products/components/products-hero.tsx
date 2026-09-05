import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components/ui";
import { PageHeader } from "@/shared/components/layout/page-header";
import { PageStat } from "@/shared/components/layout/page-stat";
import { useLocaleStore } from "@/stores/locale.store";
import { cn } from "@/shared/lib/utils";
import type { ProductsTab } from "@/features/products/types";

interface ProductsHeroProps {
  totalElements?: number;
  activeTab: ProductsTab;
  onTabChange: (tab: ProductsTab) => void;
  onAddProduct: () => void;
  onAddCategory: () => void;
  canManage?: boolean;
}

export function ProductsHero({
  totalElements,
  activeTab,
  onTabChange,
  onAddProduct,
  onAddCategory,
  canManage = true,
}: ProductsHeroProps) {
  const { t } = useTranslation("products");
  const locale = useLocaleStore((state) => state.locale);
  const intlLocale = locale === "ar" ? "ar-EG" : "en-US";

  const tabs: ProductsTab[] = canManage
    ? ["products", "categories", "import"]
    : ["products", "categories"];

  return (
    <PageHeader
      title={t("hero.title")}
      description={t("hero.subtitle")}
      actions={
        <div className="flex flex-col items-stretch gap-3 sm:items-end">
          {activeTab === "products" && typeof totalElements === "number" ? (
            <PageStat
              label={t("hero.totalLabel")}
              value={totalElements.toLocaleString(intlLocale)}
            />
          ) : null}
          {canManage && activeTab !== "import" ? (
            <Button
              type="button"
              className="w-full sm:w-auto"
              onClick={
                activeTab === "categories" ? onAddCategory : onAddProduct
              }
            >
              <Plus aria-hidden="true" />
              {activeTab === "categories"
                ? t("categories.hero.add")
                : t("hero.add")}
            </Button>
          ) : null}
        </div>
      }
      footer={
        <div
          className="flex flex-wrap gap-2"
          role="tablist"
          aria-label={t("tabs.label")}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <Button
                key={tab}
                id={`products-tab-${tab}`}
                type="button"
                size="sm"
                variant={isActive ? "default" : "outline"}
                role="tab"
                aria-selected={isActive}
                aria-controls="products-main"
                className={cn(isActive && "pointer-events-none")}
                onClick={() => onTabChange(tab)}
              >
                {t(`tabs.${tab}`)}
              </Button>
            );
          })}
        </div>
      }
    />
  );
}
