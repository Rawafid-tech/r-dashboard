import { useTranslation } from "react-i18next";
import { PageHeader } from "@/shared/components/layout/page-header";

export function BillingHero() {
  const { t } = useTranslation("billing");

  return (
    <PageHeader
      title={t("hero.title")}
      description={t("hero.description")}
      className="text-start"
    />
  );
}
