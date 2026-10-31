import { useTranslation } from "react-i18next";
import { UsersHome } from "@/features/admin/users/components/users-home";
import { useDocumentMeta } from "@/shared/hooks/use-document-meta";

export function AdminUsersPage() {
  const { t } = useTranslation("admin");

  useDocumentMeta(t("users.metaTitle"), t("users.metaDescription"));

  return <UsersHome />;
}
