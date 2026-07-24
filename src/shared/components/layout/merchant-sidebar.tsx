import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { Button } from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";
import { MERCHANT_NAV_ITEMS } from "@/shared/components/layout/merchant-nav";
import {
  MerchantSidebarNavList,
  MerchantSidebarPlanFooter,
} from "@/shared/components/layout/merchant-sidebar-nav";
import { RawafidLogoMark } from "@/shared/components/layout/rawafid-logo-mark";
import { SidebarCollapseButton } from "@/shared/components/layout/sidebar-toggle-button";
import { useSidebar } from "@/shared/components/layout/sidebar-provider";
import { useLocaleStore } from "@/stores/locale.store";

interface MerchantSidebarProps {
  planName?: string;
  className?: string;
}

export function MerchantSidebar({
  planName,
  className,
}: MerchantSidebarProps) {
  const { t } = useTranslation(["common", "dashboard"]);
  const { collapsed } = useSidebar();
  const dir = useLocaleStore((state) => state.dir);
  const tooltipSide = dir === "rtl" ? "left" : "right";

  return (
    <aside
      id="merchant-sidebar"
      className={cn(
        "hidden h-dvh shrink-0 flex-col border-e border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-300 ease-in-out md:flex",
        collapsed ? "w-(--sidebar-width-collapsed)" : "w-(--sidebar-width)",
        className,
      )}
      aria-label={t("dashboard:shell.sidebarLabel")}
    >
      <div
        className={cn(
          "flex items-center border-b border-sidebar-border",
          collapsed ? "h-14 justify-center px-2" : "h-14 justify-between gap-2 px-3",
        )}
      >
        {collapsed ? (
          <NavLink
            to="/"
            end
            aria-label={t("common:nav.dashboard")}
            className="rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-sidebar-ring/50"
          >
            <RawafidLogoMark className="size-8" />
          </NavLink>
        ) : (
          <>
            <div className="flex min-w-0 flex-1 items-center gap-2.5">
              <RawafidLogoMark />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{t("common:app.name")}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {t("common:app.tagline")}
                </p>
              </div>
            </div>
            <SidebarCollapseButton />
          </>
        )}
      </div>

      <MerchantSidebarNavList
        collapsed={collapsed}
        tooltipSide={tooltipSide}
        items={MERCHANT_NAV_ITEMS}
      />

      <div className="border-t border-sidebar-border p-3">
        <MerchantSidebarPlanFooter
          collapsed={collapsed}
          planName={planName}
          tooltipSide={tooltipSide}
        />
      </div>
    </aside>
  );
}

export function MerchantMobileSidebar({
  planName,
  onNavigate,
  onClose,
}: {
  planName?: string;
  onNavigate?: () => void;
  onClose?: () => void;
}) {
  const { t } = useTranslation(["common", "dashboard"]);
  const dir = useLocaleStore((state) => state.dir);
  const tooltipSide = dir === "rtl" ? "left" : "right";

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-4">
        <RawafidLogoMark />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{t("common:app.name")}</p>
          <p className="truncate text-xs text-muted-foreground">
            {t("common:app.tagline")}
          </p>
        </div>
        {onClose ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label={t("dashboard:shell.closeNavigation")}
            className="shrink-0 text-sidebar-foreground"
          >
            <X aria-hidden="true" />
          </Button>
        ) : null}
      </div>

      <MerchantSidebarNavList
        collapsed={false}
        tooltipSide={tooltipSide}
        items={MERCHANT_NAV_ITEMS}
        onNavigate={onNavigate}
        className="px-3 py-4"
      />

      <div className="border-t border-sidebar-border p-4">
        <MerchantSidebarPlanFooter
          collapsed={false}
          planName={planName}
          tooltipSide={tooltipSide}
        />
      </div>
    </div>
  );
}
