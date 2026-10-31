import { useTranslation } from "react-i18next";
import { AuthBrandPanel } from "@/features/auth/components/auth-brand-panel";
import { MerchantAuthPageBrand } from "@/features/auth/components/auth-page-brand";
import { AuthPageLayout } from "@/features/auth/components/auth-page-layout";
import { RegisterForm } from "@/features/auth/register";
import { useDocumentMeta } from "@/shared/hooks/use-document-meta";

export function RegisterPage() {
  const { t } = useTranslation("auth");

  useDocumentMeta(t("register.metaTitle"), t("register.metaDescription"));

  return (
    <AuthPageLayout
      skipHref="#register-form"
      skipLabel={t("register.title")}
      formPanelId="register-form"
      brandPanel={<AuthBrandPanel />}
      mobileBrand={<MerchantAuthPageBrand />}
      formMaxWidthClassName="max-w-lg"
    >
      <RegisterForm />
    </AuthPageLayout>
  );
}
