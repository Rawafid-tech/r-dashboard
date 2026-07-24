import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Sheet, SheetContent, SheetTitle, TooltipProvider } from "@/shared/components/ui";
import { MerchantHeader } from "@/shared/components/layout/merchant-header";
import {
  MerchantMobileSidebar,
  MerchantSidebar,
} from "@/shared/components/layout/merchant-sidebar";
import {
  SidebarProvider,
  useSidebar,
} from "@/shared/components/layout/sidebar-provider";
import { useMe } from "@/features/account/hooks/use-me";
import { useSubscription } from "@/features/subscription/hooks/use-subscription";

export function MerchantLayout() {
  return (
    <SidebarProvider>
      <TooltipProvider delayDuration={300}>
        <MerchantLayoutShell />
      </TooltipProvider>
    </SidebarProvider>
  );
}

function MerchantLayoutShell() {
  const { t } = useTranslation("dashboard");
  const location = useLocation();
  const { mobileOpen, setMobileOpen, isMobile } = useSidebar();
  const { data: user } = useMe();
  const { data: subscription } = useSubscription();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, setMobileOpen]);

  return (
    <div className="flex min-h-dvh w-full bg-background">
      <MerchantSidebar planName={subscription?.planName} />

      <div className="flex min-w-0 flex-1 flex-col">
        <MerchantHeader userName={user?.fullName} userEmail={user?.email} />

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>

      {isMobile ? (
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent
            id="merchant-mobile-nav"
            side="start"
            showCloseButton={false}
            className="w-[min(100vw-2rem,18rem)] border-sidebar-border bg-sidebar p-0 text-sidebar-foreground"
          >
            <SheetTitle className="sr-only">
              {t("shell.sidebarLabel")}
            </SheetTitle>
            <MerchantMobileSidebar
              planName={subscription?.planName}
              onNavigate={() => setMobileOpen(false)}
              onClose={() => setMobileOpen(false)}
            />
          </SheetContent>
        </Sheet>
      ) : null}
    </div>
  );
}
