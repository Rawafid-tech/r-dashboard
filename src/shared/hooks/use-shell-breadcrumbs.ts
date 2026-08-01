import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

export interface ShellBreadcrumb {
  label: string;
  href?: string;
}

const UUID_SEGMENT =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isDynamicId(segment: string) {
  return UUID_SEGMENT.test(segment) || /^\d+$/.test(segment);
}

export function useMerchantShellBreadcrumbs(): ShellBreadcrumb[] {
  const { pathname } = useLocation();
  const { t } = useTranslation("common");

  return useMemo(() => {
    const home = { label: t("nav.dashboard"), href: "/" as const };

    if (pathname === "/" || pathname === "") {
      return [{ label: t("nav.dashboard") }];
    }

    if (pathname.startsWith("/billing")) {
      return [home, { label: t("nav.billing") }];
    }

    if (pathname.startsWith("/settings")) {
      return [home, { label: t("nav.settings") }];
    }

    return [{ label: t("nav.dashboard") }];
  }, [pathname, t]);
}

export function useAdminShellBreadcrumbs(): ShellBreadcrumb[] {
  const { pathname } = useLocation();
  const { t } = useTranslation(["admin", "common"]);

  return useMemo(() => {
    const overview = {
      label: t("admin:shell.nav.home"),
      href: "/admin" as const,
    };
    const detailLabel = t("common:breadcrumb.detail");

    if (pathname === "/admin" || pathname === "/admin/") {
      return [{ label: t("admin:shell.nav.home") }];
    }

    const segments = pathname.replace(/^\/admin\/?/, "").split("/").filter(Boolean);

    if (segments[0] === "companies") {
      const crumbs: ShellBreadcrumb[] = [
        overview,
        { label: t("admin:shell.nav.companies"), href: "/admin/companies" },
      ];
      if (segments[1] && isDynamicId(segments[1])) {
        crumbs.push({ label: detailLabel });
      }
      return crumbs;
    }

    if (segments[0] === "plans") {
      const crumbs: ShellBreadcrumb[] = [
        overview,
        { label: t("admin:shell.nav.plans"), href: "/admin/plans" },
      ];
      if (segments[1] === "new") {
        crumbs.push({ label: t("common:common.create") });
      } else if (segments[1] && isDynamicId(segments[1])) {
        crumbs.push({ label: detailLabel });
      }
      return crumbs;
    }

    if (segments[0] === "users") {
      const crumbs: ShellBreadcrumb[] = [
        overview,
        { label: t("admin:shell.nav.users"), href: "/admin/users" },
      ];
      if (segments[1] && isDynamicId(segments[1])) {
        crumbs.push({ label: detailLabel });
      }
      return crumbs;
    }

    return [{ label: t("admin:shell.nav.home") }];
  }, [pathname, t]);
}
