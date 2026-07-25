import { Outlet } from "react-router-dom";
import { TooltipProvider } from "@/shared/components/ui";
import { AdminHeader } from "@/shared/components/layout/admin-header";
import { useAdminMe } from "@/features/admin/auth/hooks/use-admin-me";

export function AdminLayout() {
  return (
    <TooltipProvider delayDuration={300}>
      <AdminLayoutShell />
    </TooltipProvider>
  );
}

function AdminLayoutShell() {
  const { data: admin } = useAdminMe();

  return (
    <div className="flex min-h-dvh w-full flex-col bg-background">
      <AdminHeader
        userName={admin?.fullName}
        userEmail={admin?.email}
        userRole={admin?.role}
      />

      <main id="admin-main" className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
