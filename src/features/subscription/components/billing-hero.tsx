import { useTranslation } from "react-i18next";
import { PageHeader } from "@/shared/components/layout/page-header";

interface BillingHeroProps {
  planName?: string;
}

export function BillingHero({ planName }: BillingHeroProps) {
  const { t } = useTranslation("billing");

  const description = planName ? (
    <>
      <span className="block font-medium text-foreground">{planName}</span>
      {t("hero.description")}
    </>
  ) : (
    t("hero.description")
  );

  return (
    <PageHeader title={t("hero.title")} description={description} />
  );
}
