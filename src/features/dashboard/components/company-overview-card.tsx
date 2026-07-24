import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui";
import type { Company } from "@/features/company/types";

interface CompanyOverviewCardProps {
  company?: Company;
}

export function CompanyOverviewCard({ company }: CompanyOverviewCardProps) {
  const { t } = useTranslation("dashboard");

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{t("cards.company.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-xs text-muted-foreground">
            {t("cards.company.name")}
          </p>
          <p className="font-medium">{company?.name ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">
            {t("cards.company.accountNumber")}
          </p>
          <p className="font-medium" dir="ltr">
            {company ? `#${company.identifier}` : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">
            {t("cards.company.shipFromCountry")}
          </p>
          <p className="font-medium">{company?.shipFromCountry ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">
            {t("cards.company.monthlyVolume")}
          </p>
          <p className="font-medium">
            {company
              ? t(`monthlyShipmentVolume.${company.monthlyShipmentVolume}`)
              : "—"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
