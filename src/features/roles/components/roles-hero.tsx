import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components/ui";
import { PageHeader } from "@/shared/components/layout/page-header";
import { PageStat } from "@/shared/components/layout/page-stat";
import { useLocaleStore } from "@/stores/locale.store";

interface RolesHeroProps {
  totalElements?: number;
  onCreate: () => void;
  canCreate?: boolean;
}

export function RolesHero({
  totalElements,
  onCreate,
  canCreate = false,
}: RolesHeroProps) {
  const { t } = useTranslation("roles");
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
          {canCreate ? (
            <Button type="button" className="w-full sm:w-auto" onClick={onCreate}>
              <Plus aria-hidden="true" />
              {t("hero.create")}
            </Button>
          ) : null}
        </div>
      }
    />
  );
}
