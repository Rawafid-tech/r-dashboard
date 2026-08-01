import { cn } from "@/shared/lib/utils";

/** Shared sidebar nav item styles (merchant + admin). */
export function sidebarNavItemClassName(collapsed: boolean, enabled: boolean) {
  return cn(
    "relative flex w-full items-center rounded-md text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring/40",
    collapsed ? "size-9 justify-center px-0" : "gap-2 px-2.5 py-1.5",
    enabled
      ? "text-sidebar-foreground hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground"
      : "cursor-not-allowed text-muted-foreground/70",
  );
}

export function sidebarNavActiveClassName(isActive: boolean, collapsed: boolean) {
  if (!isActive) return undefined;

  return cn(
    "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
    "before:absolute before:inset-y-1 before:start-0 before:w-0.5 before:rounded-full before:bg-sidebar-primary",
    !collapsed && "font-medium",
  );
}
