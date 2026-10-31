import { useTranslation } from "react-i18next";
import { AuthBrandPanel } from "@/features/auth/components/auth-brand-panel";
import { MerchantAuthPageBrand } from "@/features/auth/components/auth-page-brand";
import { AuthPageLayout } from "@/features/auth/components/auth-page-layout";
import { ForgotPasswordForm } from "@/features/auth/forgot-password";
import { useDocumentMeta } from "@/shared/hooks/use-document-meta";

export function ForgotPasswordPage() {
  const { t } = useTranslation("auth");

  useDocumentMeta(t("forgotPassword.metaTitle"), t("forgotPassword.metaDescription"));

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
