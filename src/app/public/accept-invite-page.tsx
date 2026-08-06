import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { AuthBrandPanel } from "@/features/auth/components/auth-brand-panel";
import { MerchantAuthPageBrand } from "@/features/auth/components/auth-page-brand";
import { AuthPageLayout } from "@/features/auth/components/auth-page-layout";
import { AcceptInviteForm } from "@/features/auth/accept-invite";

export function AcceptInvitePage() {
  const { t } = useTranslation("auth");
  const [searchParams] = useSearchParams();

  const userId = searchParams.get("u")?.trim() ?? "";
  const token = searchParams.get("t")?.trim() ?? "";
  const paramsValid = userId.length > 0 && token.length > 0;

  useEffect(() => {
    const previousTitle = document.title;
    document.title = t("acceptInvite.metaTitle");

    let meta = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    let robots = document.querySelector<HTMLMetaElement>(
      'meta[name="robots"]',
    );

    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }

    if (!robots) {
      robots = document.createElement("meta");
      robots.name = "robots";
      document.head.appendChild(robots);
    }

    const previousDescription = meta.content;
    const previousRobots = robots.content;
    meta.content = t("acceptInvite.metaDescription");
    robots.content = "noindex, nofollow";

    return () => {
      document.title = previousTitle;
      meta!.content = previousDescription;
      robots!.content = previousRobots;
    };
  }, [t]);

  const invalidMessage = useMemo(
    () => t("acceptInvite.errors.invalidLink"),
    [t],
  );

  return (
    <AuthPageLayout
      skipHref="#accept-invite-form"
      skipLabel={t("acceptInvite.title")}
      formPanelId="accept-invite-form"
      brandPanel={<AuthBrandPanel />}
      mobileBrand={<MerchantAuthPageBrand />}
    >
      {paramsValid ? (
        <AcceptInviteForm userId={userId} token={token} />
      ) : (
        <div
          className="flex flex-col gap-4"
          role="alert"
          id="accept-invite-form"
        >
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("acceptInvite.title")}
          </h1>
          <p className="text-sm text-muted-foreground">{invalidMessage}</p>
          <Link
            to="/login"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            {t("acceptInvite.loginLink")}
          </Link>
        </div>
      )}
    </AuthPageLayout>
  );
}
