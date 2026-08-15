import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components/ui";
import { PageHeader } from "@/shared/components/layout/page-header";
import { PageStat } from "@/shared/components/layout/page-stat";
import { useLocaleStore } from "@/stores/locale.store";

interface ShippingBoxesHeroProps {
  totalElements?: number;
  onAdd: () => void;
  canManage?: boolean;
}

export function ShippingBoxesHero({
  totalElements,
  onAdd,
  canManage = true,
}: ShippingBoxesHeroProps) {
  const { t } = useTranslation("shippingBoxes");
  const locale = useLocaleStore((state) => state.locale);
  const intlLocale = locale === "ar" ? "ar-EG" : "en-US";

  return (
    <PageHeader
      title={t("hero.title")}
      description={t("hero.subtitle")}
      actions={
        <div className="flex flex-col items-stretch gap-3 sm:items-end">
          {typeof totalElements === "number" ? (
            <PageStat
              label={t("hero.totalLabel")}
              value={totalElements.toLocaleString(intlLocale)}
            />
          ) : null}
          {canManage ? (
            <Button
              type="button"
              className="w-full sm:w-auto"
              onClick={onAdd}
            >
              <Plus aria-hidden="true" />
              {t("hero.add")}
            </Button>
          ) : null}
        </div>
      }
    />
  );
}
