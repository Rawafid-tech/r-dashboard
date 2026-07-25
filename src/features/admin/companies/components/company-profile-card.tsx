import type { ReactNode } from "react";
import { ExternalLink, Globe2, Package, Users2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui";
import { formatDate } from "@/shared/lib/formatters";
import type { AdminCompany } from "@/features/admin/companies/types";

interface CompanyProfileCardProps {
  company: AdminCompany;
}

interface DetailItemProps {
  label: string;
  value: ReactNode;
}

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <div className="space-y-1">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}

export function CompanyProfileCard({ company }: CompanyProfileCardProps) {
  const { t } = useTranslation(["admin", "settings"]);

  return (
    <Card className="h-full border-border/80">
      <CardHeader>
        <CardTitle>{t("companies.detail.profile.title")}</CardTitle>
        <CardDescription>{t("companies.detail.profile.subtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 sm:grid-cols-2">
          <DetailItem
            label={t("companies.detail.profile.accountNumber")}
            value={
              <span dir="ltr" className="font-mono">
                #{company.identifier}
              </span>
            }
          />
          <DetailItem
            label={t("companies.detail.profile.country")}
            value={t(`settings:countries.${company.shipFromCountry}`, {
              defaultValue: company.shipFromCountry,
            })}
          />
          <DetailItem
            label={t("companies.detail.profile.volume")}
            value={t(
              `settings:monthlyShipmentVolume.${company.monthlyShipmentVolume}`,
            )}
          />
          <DetailItem
            label={t("companies.detail.profile.size")}
            value={
              company.size
                ? t(`settings:companySize.${company.size}`)
                : t("companies.detail.profile.notProvided")
            }
          />
          <DetailItem
            label={t("companies.detail.profile.industry")}
            value={company.industry ?? t("companies.detail.profile.notProvided")}
          />
          <DetailItem
            label={t("companies.detail.profile.website")}
            value={
              company.website ? (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  <Globe2 className="size-3.5" aria-hidden="true" />
                  {t("companies.detail.profile.visitWebsite")}
                  <ExternalLink className="size-3" aria-hidden="true" />
                </a>
              ) : (
                t("companies.detail.profile.notProvided")
              )
            }
          />
          <DetailItem
            label={t("companies.detail.profile.registeredAt")}
            value={
              <time dir="ltr" dateTime={company.createdAt} className="tabular-nums">
                {formatDate(company.createdAt)}
              </time>
            }
          />
          <DetailItem
            label={t("companies.detail.profile.updatedAt")}
            value={
              <time dir="ltr" dateTime={company.updatedAt} className="tabular-nums">
                {formatDate(company.updatedAt)}
              </time>
            }
          />
        </dl>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border/60 bg-muted/15 p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Package className="size-4" aria-hidden="true" />
              <p className="text-xs font-medium">
                {t("companies.detail.profile.logisticsHint")}
              </p>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t("companies.detail.profile.logisticsDescription")}
            </p>
          </div>
          <div className="rounded-xl border border-border/60 bg-muted/15 p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users2 className="size-4" aria-hidden="true" />
              <p className="text-xs font-medium">
                {t("companies.detail.profile.tenantHint")}
              </p>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t("companies.detail.profile.tenantDescription")}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
