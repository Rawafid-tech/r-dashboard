import { useTranslation } from "react-i18next";
import { AdminConsoleMark } from "@/shared/components/layout/admin-console-mark";
import { RawafidLogoMark } from "@/shared/components/layout/rawafid-logo-mark";

export function MerchantAuthPageBrand() {
  const { t } = useTranslation(["auth", "common"]);

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <RawafidLogoMark className="size-11" />
      <div className="space-y-0.5">
        <p className="text-lg font-semibold tracking-tight text-foreground">
          {t("brand.eyebrow")}
        </p>
        <p className="text-sm text-muted-foreground">{t("common:app.tagline")}</p>
      </div>
    </div>
  );
}

export function AdminAuthPageBrand() {
  const { t } = useTranslation("admin");

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <AdminConsoleMark className="size-11" />
      <div className="space-y-0.5">
        <p className="text-lg font-semibold tracking-tight text-foreground">
          {t("brand.eyebrow")}
        </p>
        <p className="text-sm text-muted-foreground">{t("brand.badge")}</p>
      </div>
    </div>
  );
}
