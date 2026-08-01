import { useTranslation } from "react-i18next";
import { PageHeader } from "@/shared/components/layout/page-header";
import { PageStat } from "@/shared/components/layout/page-stat";
import { useLocaleStore } from "@/stores/locale.store";

interface CompaniesHeroProps {
  totalElements?: number;
}

export function CompaniesHero({ totalElements }: CompaniesHeroProps) {
  const { t } = useTranslation("admin");
  const locale = useLocaleStore((state) => state.locale);
  const intlLocale = locale === "ar" ? "ar-EG" : "en-US";

  return (
    <PageHeader
      title={t("companies.hero.title")}
      description={t("companies.hero.subtitle")}
      actions={
        typeof totalElements === "number" ? (
          <PageStat
            label={t("companies.hero.totalLabel")}
            value={totalElements.toLocaleString(intlLocale)}
          />
        ) : undefined
      }
    />
  );
}
