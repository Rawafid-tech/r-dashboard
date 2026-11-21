import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/shared/components/ui";
import { useDocumentMeta } from "@/shared/hooks/use-document-meta";

/**
 * Unknown URLs used to redirect silently to "/", which hid broken links (and would hide a missing
 * page such as /connect). Say so instead, with a way home.
 */
export function NotFoundPage() {
  const { t } = useTranslation("common");
  useDocumentMeta(t("errors.notFound"), t("errors.notFound"));

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-5xl font-semibold text-muted-foreground" aria-hidden="true">
        404
      </p>
      <h1 className="text-lg font-medium text-foreground">{t("errors.notFound")}</h1>
      <Button asChild>
        <Link to="/">{t("notFound.home")}</Link>
      </Button>
    </main>
  );
}
