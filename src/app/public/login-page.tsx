import { useTranslation } from "react-i18next";
import { AuthBrandPanel } from "@/features/auth/components/auth-brand-panel";
import { MerchantAuthPageBrand } from "@/features/auth/components/auth-page-brand";
import { AuthPageLayout } from "@/features/auth/components/auth-page-layout";
import { LoginForm } from "@/features/auth/login";
import { useDocumentMeta } from "@/shared/hooks/use-document-meta";

export function LoginPage() {
  const { t } = useTranslation("auth");

  useDocumentMeta(t("login.metaTitle"), t("login.metaDescription"));

  return (
    <AuthPageLayout
      skipHref="#login-form"
      skipLabel={t("login.title")}
      formPanelId="login-form"
      brandPanel={<AuthBrandPanel />}
      mobileBrand={<MerchantAuthPageBrand />}
    >
      <LoginForm />
    </AuthPageLayout>
  );
}
