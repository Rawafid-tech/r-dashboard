import { useTranslation } from "react-i18next";
import { PageHeader } from "@/shared/components/layout/page-header";
import { PageStat } from "@/shared/components/layout/page-stat";
import { useLocaleStore } from "@/stores/locale.store";

interface UsersHeroProps {
  totalElements?: number;
}

export function UsersHero({ totalElements }: UsersHeroProps) {
  const { t } = useTranslation("admin");
  const locale = useLocaleStore((state) => state.locale);
  const intlLocale = locale === "ar" ? "ar-EG" : "en-US";

  return (
    <PageHeader
      title={t("users.hero.title")}
      description={t("users.hero.subtitle")}
      actions={
        typeof totalElements === "number" ? (
          <PageStat
            label={t("users.hero.totalLabel")}
            value={totalElements.toLocaleString(intlLocale)}
          />
        ) : undefined
      }
    />
  );
}
