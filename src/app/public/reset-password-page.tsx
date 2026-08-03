import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AuthBrandPanel } from "@/features/auth/components/auth-brand-panel";
import { MerchantAuthPageBrand } from "@/features/auth/components/auth-page-brand";
import { AuthPageLayout } from "@/features/auth/components/auth-page-layout";
import { ResetPasswordForm } from "@/features/auth/reset-password";

export function ResetPasswordPage() {
  const { t } = useTranslation("auth");

  useEffect(() => {
    const previousTitle = document.title;
    document.title = t("resetPassword.metaTitle");

    const description = t("resetPassword.metaDescription");
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
      skipHref="#reset-password-form"
      skipLabel={t("resetPassword.title")}
      formPanelId="reset-password-form"
      brandPanel={<AuthBrandPanel />}
      mobileBrand={<MerchantAuthPageBrand />}
    >
      <ResetPasswordForm />
    </AuthPageLayout>
  );
}
