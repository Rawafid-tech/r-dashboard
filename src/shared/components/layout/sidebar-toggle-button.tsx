import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";
import { useSidebar } from "@/shared/components/layout/sidebar-provider";
import { useLocaleStore } from "@/stores/locale.store";

interface SidebarToggleButtonProps {
  className?: string;
  controlsId?: string;
}

export function SidebarExpandButton({
  className,
  controlsId = "merchant-sidebar-nav",
}: SidebarToggleButtonProps) {
  const { t } = useTranslation("dashboard");
  const { toggleCollapsed } = useSidebar();
  const dir = useLocaleStore((state) => state.dir);
  const ExpandIcon = dir === "rtl" ? ChevronLeft : ChevronRight;

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      onClick={toggleCollapsed}
      aria-label={t("shell.expandSidebar")}
      aria-expanded={false}
      aria-controls={controlsId}
      className={cn("shrink-0", className)}
    >
      <ExpandIcon aria-hidden="true" />
    </Button>
  );
}

export function SidebarCollapseButton({
  className,
  controlsId = "merchant-sidebar-nav",
}: SidebarToggleButtonProps) {
  const { t } = useTranslation("dashboard");
  const { toggleCollapsed } = useSidebar();
  const dir = useLocaleStore((state) => state.dir);
  const CollapseIcon = dir === "rtl" ? ChevronRight : ChevronLeft;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={toggleCollapsed}
      aria-label={t("shell.collapseSidebar")}
      aria-expanded
      aria-controls={controlsId}
      className={cn("shrink-0 text-sidebar-foreground", className)}
    >
      <CollapseIcon aria-hidden="true" />
    </Button>
  );
}
