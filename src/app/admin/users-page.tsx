import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { UsersHome } from "@/features/admin/users/components/users-home";

export function AdminUsersPage() {
  const { t } = useTranslation("admin");

  useEffect(() => {
    const previousTitle = document.title;
    document.title = t("users.metaTitle");

    let meta = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );

    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }

    const previousDescription = meta.content;
    meta.content = t("users.metaDescription");

    return () => {
      document.title = previousTitle;
      meta!.content = previousDescription;
    };
  }, [t]);

  return <UsersHome />;
}
