import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AuthBrandPanel } from "@/features/auth/components/auth-brand-panel";
import { MerchantAuthPageBrand } from "@/features/auth/components/auth-page-brand";
import { AuthPageLayout } from "@/features/auth/components/auth-page-layout";
import { RegisterForm } from "@/features/auth/register";

export function RegisterPage() {
  const { t } = useTranslation("auth");

  useEffect(() => {
    const previousTitle = document.title;
    document.title = t("register.metaTitle");

    const description = t("register.metaDescription");
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
