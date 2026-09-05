import { useTranslation } from "react-i18next";
import { PageHeader } from "@/shared/components/layout/page-header";

export function WalletHero() {
  const { t } = useTranslation("wallet");

  return (
    <PageHeader title={t("hero.title")} description={t("hero.description")} />
  );
}
