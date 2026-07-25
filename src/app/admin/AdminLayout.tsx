import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Sheet, SheetContent, SheetTitle, TooltipProvider } from "@/shared/components/ui";
import { AdminHeader } from "@/shared/components/layout/admin-header";
import {
  AdminMobileSidebar,
  AdminSidebar,
} from "@/shared/components/layout/admin-sidebar";
import {
  SidebarProvider,
  useSidebar,
} from "@/shared/components/layout/sidebar-provider";
import { useAdminMe } from "@/features/admin/auth/hooks/use-admin-me";

export function AdminLayout() {
  return (
    <SidebarProvider>
      <TooltipProvider delayDuration={300}>
        <AdminLayoutShell />
      </TooltipProvider>
    </SidebarProvider>
  );
}

function AdminLayoutShell() {
  const { t } = useTranslation("admin");
  const location = useLocation();
  const { mobileOpen, setMobileOpen, isMobile } = useSidebar();
  const { data: admin } = useAdminMe();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, setMobileOpen]);

  return (
    <div className="flex min-h-dvh w-full bg-background">
      <AdminSidebar userRole={admin?.role} />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader
          userName={admin?.fullName}
          userEmail={admin?.email}
          userRole={admin?.role}
        />

        <main id="admin-main" className="flex-1">
          <Outlet />
        </main>
      </div>

      {isMobile ? (
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent
            id="admin-mobile-nav"
            side="start"
            showCloseButton={false}
            className="w-[min(100vw-2rem,18rem)] border-sidebar-border bg-sidebar p-0 text-sidebar-foreground"
          >
            <SheetTitle className="sr-only">
              {t("shell.sidebarLabel")}
            </SheetTitle>
            <AdminMobileSidebar
              userRole={admin?.role}
              onNavigate={() => setMobileOpen(false)}
              onClose={() => setMobileOpen(false)}
            />
          </SheetContent>
        </Sheet>
      ) : null}
    </div>
  );
}
