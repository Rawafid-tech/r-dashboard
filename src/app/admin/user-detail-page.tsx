import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { UserDetailHome } from "@/features/admin/users/components/user-detail-home";
import { useAdminUser } from "@/features/admin/users/hooks/use-admin-user";
import { useDocumentMeta } from "@/shared/hooks/use-document-meta";

export function AdminUserDetailPage() {
  const { t } = useTranslation("admin");
  const { userId } = useParams<{ userId: string }>();
  const userQuery = useAdminUser(userId);

  useDocumentMeta(userQuery.data
      ? t("users.detail.metaTitle", { name: userQuery.data.fullName })
      : t("users.detail.metaTitleFallback"), userQuery.data
      ? t("users.detail.metaDescription", { name: userQuery.data.fullName })
      : t("users.detail.metaDescriptionFallback"));

  return <UserDetailHome />;
}
