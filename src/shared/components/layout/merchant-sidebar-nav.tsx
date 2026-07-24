import type { ReactElement } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Badge, Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";
import type { MerchantNavItem } from "@/shared/components/layout/merchant-nav";

interface MerchantSidebarNavItemProps {
  item: MerchantNavItem;
  collapsed: boolean;
  tooltipSide: "left" | "right";
  onNavigate?: () => void;
}

function withCollapsedTooltip(
  node: ReactElement,
  label: string,
  collapsed: boolean,
  tooltipSide: "left" | "right",
) {
  if (!collapsed) return node;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="flex w-full justify-center">{node}</span>
      </TooltipTrigger>
      <TooltipContent side={tooltipSide}>{label}</TooltipContent>
    </Tooltip>
  );
}

export function MerchantSidebarNavItem({
  item,
  collapsed,
  tooltipSide,
  onNavigate,
}: MerchantSidebarNavItemProps) {
  const { t } = useTranslation("common");
  const label = t(`nav.${item.key}`);
  const tooltipLabel = item.enabled
    ? label
    : `${label} — ${t("comingSoon")}`;

  const itemClassName = cn(
    "relative flex w-full items-center rounded-lg text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-sidebar-ring/50",
    collapsed ? "size-10 justify-center px-0" : "gap-2.5 px-2.5 py-2",
    item.enabled
      ? "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      : "cursor-not-allowed text-muted-foreground/80",
  );

  const activeClassName =
    "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm hover:bg-sidebar-primary hover:text-sidebar-primary-foreground";

  const icon = <item.icon className="size-4 shrink-0" aria-hidden="true" />;

  if (!item.enabled) {
    return withCollapsedTooltip(
      <div
        className={itemClassName}
        aria-disabled="true"
        aria-label={tooltipLabel}
      >
        {icon}
        {!collapsed ? (
          <>
            <span className="min-w-0 flex-1 truncate">{label}</span>
            <Badge variant="muted" className="ms-auto shrink-0 text-[10px]">
              {t("comingSoon")}
            </Badge>
          </>
        ) : null}
      </div>,
      tooltipLabel,
      collapsed,
      tooltipSide,
    );
  }

  const link = (
    <NavLink
      to={item.href}
      end={item.href === "/"}
      onClick={onNavigate}
      aria-label={collapsed ? label : undefined}
      className={({ isActive }) =>
        cn(itemClassName, isActive && activeClassName, isActive && !collapsed && "font-semibold")
      }
    >
      {icon}
      {!collapsed ? <span className="min-w-0 flex-1 truncate">{label}</span> : null}
    </NavLink>
  );

  return withCollapsedTooltip(link, tooltipLabel, collapsed, tooltipSide);
}

interface MerchantSidebarNavListProps {
  collapsed: boolean;
  tooltipSide: "left" | "right";
  items: MerchantNavItem[];
  onNavigate?: () => void;
  className?: string;
  id?: string;
}

export function MerchantSidebarNavList({
  collapsed,
  tooltipSide,
  items,
  onNavigate,
  className,
  id = "merchant-sidebar-nav",
}: MerchantSidebarNavListProps) {
  const { t } = useTranslation("dashboard");

  return (
    <nav
      id={id}
      className={cn("flex-1 overflow-y-auto px-2 py-3", className)}
      aria-label={t("shell.sidebarLabel")}
    >
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.key}>
            <MerchantSidebarNavItem
              item={item}
              collapsed={collapsed}
              tooltipSide={tooltipSide}
              onNavigate={onNavigate}
            />
          </li>
        ))}
      </ul>
    </nav>
  );
}

interface MerchantSidebarPlanFooterProps {
  collapsed: boolean;
  planName?: string;
  tooltipSide: "left" | "right";
  className?: string;
}

export function MerchantSidebarPlanFooter({
  collapsed,
  planName,
  tooltipSide,
  className,
}: MerchantSidebarPlanFooterProps) {
  const { t } = useTranslation(["common", "dashboard"]);
  const resolvedPlan = planName ?? t("common:common.loading");
  const planTooltip = t("dashboard:shell.currentPlanValue", {
    plan: resolvedPlan,
  });
  const collapsedPlanLabel = planName
    ? planName.slice(0, 2).toUpperCase()
    : "…";

  if (collapsed) {
    return withCollapsedTooltip(
      <NavLink
        to="/billing"
        className={cn(
          "mx-auto grid size-10 place-items-center rounded-lg bg-sidebar-accent text-[11px] font-bold uppercase text-sidebar-accent-foreground ring-1 ring-sidebar-border outline-none transition-colors hover:bg-sidebar-accent focus-visible:ring-3 focus-visible:ring-sidebar-ring/50",
          className,
        )}
        aria-label={planTooltip}
      >
        {collapsedPlanLabel}
      </NavLink>,
      planTooltip,
      true,
      tooltipSide,
    );
  }

  return (
    <NavLink
      to="/billing"
      className={cn(
        "block rounded-lg bg-sidebar-accent/70 px-3 py-2.5 ring-1 ring-sidebar-border transition-colors outline-none hover:bg-sidebar-accent focus-visible:ring-3 focus-visible:ring-sidebar-ring/50",
        className,
      )}
      aria-label={planTooltip}
    >
      <p className="text-xs text-muted-foreground">
        {t("dashboard:shell.currentPlan")}
      </p>
      <p className="mt-0.5 truncate text-sm font-semibold">{resolvedPlan}</p>
    </NavLink>
  );
}
