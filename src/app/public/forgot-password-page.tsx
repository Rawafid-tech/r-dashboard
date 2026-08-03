import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AuthBrandPanel } from "@/features/auth/components/auth-brand-panel";
import { MerchantAuthPageBrand } from "@/features/auth/components/auth-page-brand";
import { AuthPageLayout } from "@/features/auth/components/auth-page-layout";
import { ForgotPasswordForm } from "@/features/auth/forgot-password";

export function ForgotPasswordPage() {
  const { t } = useTranslation("auth");

  useEffect(() => {
    const previousTitle = document.title;
    document.title = t("forgotPassword.metaTitle");

    const description = t("forgotPassword.metaDescription");
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
      skipHref="#forgot-password-form"
      skipLabel={t("forgotPassword.title")}
      formPanelId="forgot-password-form"
      brandPanel={<AuthBrandPanel />}
      mobileBrand={<MerchantAuthPageBrand />}
    >
      <ForgotPasswordForm />
    </AuthPageLayout>
  );
}
