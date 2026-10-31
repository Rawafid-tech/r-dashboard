import { useTranslation } from "react-i18next";
import { AdminAuthBrandPanel } from "@/features/admin/auth/components/admin-auth-brand-panel";
import { AdminAuthPageBrand } from "@/features/auth/components/auth-page-brand";
import { AuthPageLayout } from "@/features/auth/components/auth-page-layout";
import { AdminLoginForm } from "@/features/admin/auth/login";
import { useDocumentMeta } from "@/shared/hooks/use-document-meta";

export function AdminLoginPage() {
  const { t } = useTranslation("admin");

  useDocumentMeta(t("login.metaTitle"), t("login.metaDescription"));

  return (
    <AuthPageLayout
      skipHref="#admin-login-form"
      skipLabel={t("login.title")}
      formPanelId="admin-login-form"
      brandPanel={<AdminAuthBrandPanel />}
      mobileBrand={<AdminAuthPageBrand />}
    >
      <AdminLoginForm />
    </AuthPageLayout>
  );
}
