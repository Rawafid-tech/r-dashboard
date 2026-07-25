import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { CompanyDetailHome } from "@/features/admin/companies/components/company-detail-home";
import { useAdminCompany } from "@/features/admin/companies/hooks/use-admin-company";

export function AdminCompanyDetailPage() {
  const { t } = useTranslation("admin");
  const { companyId } = useParams<{ companyId: string }>();
  const companyQuery = useAdminCompany(companyId);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = companyQuery.data
      ? t("companies.detail.metaTitle", { name: companyQuery.data.name })
      : t("companies.detail.metaTitleFallback");

    let meta = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );

    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }

    const previousDescription = meta.content;
    meta.content = companyQuery.data
      ? t("companies.detail.metaDescription", {
          name: companyQuery.data.name,
        })
      : t("companies.detail.metaDescriptionFallback");

    return () => {
      document.title = previousTitle;
      meta!.content = previousDescription;
    };
  }, [t, companyQuery.data]);

  return <CompanyDetailHome />;
}
