import { useTranslation } from "react-i18next";
import { NotificationsHome } from "@/features/notifications/components/notifications-home";
import { useDocumentMeta } from "@/shared/hooks/use-document-meta";

export function NotificationsPage() {
  const { t } = useTranslation("notifications");

  useDocumentMeta(t("metaTitle"), t("metaDescription"));

  return <NotificationsHome />;
}
