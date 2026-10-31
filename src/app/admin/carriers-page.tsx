import { useTranslation } from "react-i18next";
import { AdminCarriersHome } from "@/features/admin/carriers/components/carriers-home";
import { useDocumentMeta } from "@/shared/hooks/use-document-meta";

export function AdminCarriersPage() {
  const { t } = useTranslation("admin");

  useDocumentMeta(t("carriers.metaTitle"), t("carriers.metaDescription"));

  return <AdminCarriersHome />;
}
