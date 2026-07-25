import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Building2, CreditCard, ShieldCheck, Users } from "lucide-react";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui";
import { useAdminMe } from "@/features/admin/auth/hooks/use-admin-me";
import { AdminRole } from "@/shared/types/enums";

const MODULES = [
  { key: "plans", icon: CreditCard },
  { key: "companies", icon: Building2 },
  { key: "users", icon: Users },
] as const;

export function AdminHomePage() {
  const { t } = useTranslation("admin");
  const { data: admin } = useAdminMe();

  useEffect(() => {
    const previousTitle = document.title;
    document.title = t("home.metaTitle");

    let meta = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );

    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }

    const previousDescription = meta.content;
    meta.content = t("home.metaDescription");

    return () => {
      document.title = previousTitle;
      meta!.content = previousDescription;
    };
  }, [t]);

  const isReadOnly = admin?.role === AdminRole.SUPPORT;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      <section
        className="relative overflow-hidden rounded-2xl bg-[linear-gradient(135deg,color-mix(in_oklab,var(--color-primary)_12%,transparent),color-mix(in_oklab,#7c3aed_10%,transparent))] px-5 py-6 ring-1 ring-foreground/8 sm:px-7 sm:py-8"
        aria-labelledby="admin-home-title"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <Badge variant="secondary" className="gap-1 uppercase">
              <ShieldCheck className="size-3" aria-hidden="true" />
              {t("shell.badge")}
            </Badge>
            <h1
              id="admin-home-title"
              className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
            >
              {t("home.title", { name: admin?.fullName ?? "" })}
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t("home.subtitle")}
            </p>
            {admin?.role ? (
              <p className="text-xs text-muted-foreground">
                {t("home.roleHint", { role: t(`roles.${admin.role}`) })}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section
        className="mt-8"
        aria-labelledby="admin-modules-title"
      >
        <div className="mb-4 space-y-1">
          <h2
            id="admin-modules-title"
            className="text-lg font-semibold text-foreground"
          >
            {t("home.modulesTitle")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("home.modulesSubtitle")}
          </p>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map(({ key, icon: Icon }) => (
            <li key={key}>
              <Card className="h-full border-dashed opacity-90">
                <CardHeader className="gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="grid size-9 place-items-center rounded-lg bg-violet-500/10 text-violet-700 ring-1 ring-violet-500/12 dark:text-violet-200">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <Badge variant="outline">{t("home.comingSoon")}</Badge>
                  </div>
                  <CardTitle className="text-base">
                    {t(`home.modules.${key}.title`)}
                  </CardTitle>
                  <CardDescription>
                    {t(`home.modules.${key}.description`)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    {isReadOnly
                      ? t("home.modules.readOnlyHint")
                      : t("home.modules.manageHint")}
                  </p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
