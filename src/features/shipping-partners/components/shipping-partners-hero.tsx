import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components/ui";
import { PageHeader } from "@/shared/components/layout/page-header";
import { PageStat } from "@/shared/components/layout/page-stat";
import type { ShippingPartnersTab } from "@/features/shipping-partners/lib/list-params";
import { cn } from "@/shared/lib/utils";
import { useLocaleStore } from "@/stores/locale.store";

interface ShippingPartnersHeroProps {
  activeTab: ShippingPartnersTab;
  onTabChange: (tab: ShippingPartnersTab) => void;
  totalElements?: number;
}

const TABS: ShippingPartnersTab[] = ["available", "connected"];

export function ShippingPartnersHero({
  activeTab,
  onTabChange,
  totalElements,
}: ShippingPartnersHeroProps) {
  const { t } = useTranslation("shippingPartners");
  const locale = useLocaleStore((state) => state.locale);
  const intlLocale = locale === "ar" ? "ar-EG" : "en-US";

  return (
    <PageHeader
      title={t("hero.title")}
      description={t("hero.subtitle")}
      actions={
        activeTab === "connected" && typeof totalElements === "number" ? (
          <PageStat
            label={t("hero.totalLabel")}
            value={totalElements.toLocaleString(intlLocale)}
          />
        ) : null
      }
      footer={
        <div
          className="flex flex-wrap gap-2"
          role="tablist"
          aria-label={t("tabs.label")}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <Button
                key={tab}
                id={`shipping-partners-tab-${tab}`}
                type="button"
                size="sm"
                variant={isActive ? "default" : "outline"}
                role="tab"
                aria-selected={isActive}
                aria-controls="shipping-partners-main"
                tabIndex={isActive ? 0 : -1}
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
