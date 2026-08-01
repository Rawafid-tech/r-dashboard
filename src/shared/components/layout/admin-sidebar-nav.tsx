import type { ReactElement } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Badge, Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";
import type { AdminNavItem } from "@/shared/components/layout/admin-nav";
import {
  sidebarNavActiveClassName,
  sidebarNavItemClassName,
} from "@/shared/components/layout/sidebar-nav-styles";

interface AdminSidebarNavItemProps {
  item: AdminNavItem;
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

export function AdminSidebarNavItem({
  item,
  collapsed,
  tooltipSide,
  onNavigate,
}: AdminSidebarNavItemProps) {
  const { t } = useTranslation(["admin", "common"]);
  const label = t(`shell.nav.${item.key}`);
  const tooltipLabel = item.enabled
    ? label
    : `${label} — ${t("common:comingSoon")}`;

  const itemClassName = sidebarNavItemClassName(collapsed, item.enabled);

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
              {t("common:comingSoon")}
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
      end={item.end}
      onClick={onNavigate}
      aria-label={collapsed ? label : undefined}
      className={({ isActive }) =>
        cn(
          itemClassName,
          sidebarNavActiveClassName(isActive, collapsed),
        )
      }
    >
      {icon}
      {!collapsed ? <span className="min-w-0 flex-1 truncate">{label}</span> : null}
    </NavLink>
  );

  return withCollapsedTooltip(link, tooltipLabel, collapsed, tooltipSide);
}

interface AdminSidebarNavListProps {
  collapsed: boolean;
  tooltipSide: "left" | "right";
  items: AdminNavItem[];
  onNavigate?: () => void;
  className?: string;
  id?: string;
}

export function AdminSidebarNavList({
  collapsed,
  tooltipSide,
  items,
  onNavigate,
  className,
  id = "admin-sidebar-nav",
}: AdminSidebarNavListProps) {
  const { t } = useTranslation("admin");

  return (
    <nav
      id={id}
      className={cn("flex-1 overflow-y-auto px-2 py-3", className)}
      aria-label={t("shell.sidebarLabel")}
    >
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.key}>
            <AdminSidebarNavItem
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

interface AdminSidebarRoleFooterProps {
  collapsed: boolean;
  roleLabel?: string;
  tooltipSide: "left" | "right";
  className?: string;
}

export function AdminSidebarRoleFooter({
  collapsed,
  roleLabel,
  tooltipSide,
  className,
}: AdminSidebarRoleFooterProps) {
  const { t } = useTranslation("admin");
  const resolvedRole = roleLabel ?? t("shell.roleFallback");
  const roleTooltip = t("shell.currentRoleValue", { role: resolvedRole });
  const collapsedRoleLabel = roleLabel
    ? roleLabel.slice(0, 2).toUpperCase()
    : "AD";

  if (collapsed) {
    return withCollapsedTooltip(
      <div
        className={cn(
          "mx-auto grid size-9 place-items-center rounded-md border border-sidebar-border bg-sidebar-accent text-[10px] font-bold uppercase text-sidebar-accent-foreground",
          className,
        )}
        aria-label={roleTooltip}
      >
        {collapsedRoleLabel}
      </div>,
      roleTooltip,
      true,
      tooltipSide,
    );
  }

  return (
    <div
      className={cn(
        "rounded-md border border-sidebar-border bg-sidebar-accent/50 px-3 py-2",
        className,
      )}
      aria-label={roleTooltip}
    >
      <p className="text-xs text-muted-foreground">{t("shell.currentRole")}</p>
      <p className="mt-0.5 truncate text-sm font-semibold">{resolvedRole}</p>
    </div>
  );
}
