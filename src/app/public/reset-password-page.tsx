import { useTranslation } from "react-i18next";
import { AuthBrandPanel } from "@/features/auth/components/auth-brand-panel";
import { MerchantAuthPageBrand } from "@/features/auth/components/auth-page-brand";
import { AuthPageLayout } from "@/features/auth/components/auth-page-layout";
import { ResetPasswordForm } from "@/features/auth/reset-password";
import { useDocumentMeta } from "@/shared/hooks/use-document-meta";

export function ResetPasswordPage() {
  const { t } = useTranslation("auth");

  useDocumentMeta(t("resetPassword.metaTitle"), t("resetPassword.metaDescription"));

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
