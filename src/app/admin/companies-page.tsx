import { useTranslation } from "react-i18next";
import { CompaniesHome } from "@/features/admin/companies/components/companies-home";
import { useDocumentMeta } from "@/shared/hooks/use-document-meta";

export function AdminCompaniesPage() {
  const { t } = useTranslation("admin");

  useDocumentMeta(t("companies.metaTitle"), t("companies.metaDescription"));

  return <CompaniesHome />;
}
