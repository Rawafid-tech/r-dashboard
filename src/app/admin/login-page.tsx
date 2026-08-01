import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AdminAuthBrandPanel } from "@/features/admin/auth/components/admin-auth-brand-panel";
import { AdminAuthPageBrand } from "@/features/auth/components/auth-page-brand";
import { AuthPageLayout } from "@/features/auth/components/auth-page-layout";
import { AdminLoginForm } from "@/features/admin/auth/login";

export function AdminLoginPage() {
  const { t } = useTranslation("admin");

  useEffect(() => {
    const previousTitle = document.title;
    document.title = t("login.metaTitle");

    const description = t("login.metaDescription");
    let meta = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );

    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }

    const previousDescription = meta.content;
    meta.content = description;

    return () => {
      document.title = previousTitle;
      meta!.content = previousDescription;
    };
  }, [t]);

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
