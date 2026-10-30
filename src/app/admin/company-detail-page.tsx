import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { CompanyDetailHome } from "@/features/admin/companies/components/company-detail-home";
import { useAdminCompany } from "@/features/admin/companies/hooks/use-admin-company";
import { useDocumentMeta } from "@/shared/hooks/use-document-meta";

export function AdminCompanyDetailPage() {
  const { t } = useTranslation("admin");
  const { companyId } = useParams<{ companyId: string }>();
  const companyQuery = useAdminCompany(companyId);

  useDocumentMeta(companyQuery.data
      ? t("companies.detail.metaTitle", { name: companyQuery.data.name })
      : t("companies.detail.metaTitleFallback"), companyQuery.data
      ? t("companies.detail.metaDescription", {
          name: companyQuery.data.name,
        })
      : t("companies.detail.metaDescriptionFallback"));

  return <CompanyDetailHome />;
}
