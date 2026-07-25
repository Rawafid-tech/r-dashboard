import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { UserDetailHome } from "@/features/admin/users/components/user-detail-home";
import { useAdminUser } from "@/features/admin/users/hooks/use-admin-user";

export function AdminUserDetailPage() {
  const { t } = useTranslation("admin");
  const { userId } = useParams<{ userId: string }>();
  const userQuery = useAdminUser(userId);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = userQuery.data
      ? t("users.detail.metaTitle", { name: userQuery.data.fullName })
      : t("users.detail.metaTitleFallback");

    let meta = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );

    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }

    const previousDescription = meta.content;
    meta.content = userQuery.data
      ? t("users.detail.metaDescription", { name: userQuery.data.fullName })
      : t("users.detail.metaDescriptionFallback");

    return () => {
      document.title = previousTitle;
      meta!.content = previousDescription;
    };
  }, [t, userQuery.data]);

  return <UserDetailHome />;
}
