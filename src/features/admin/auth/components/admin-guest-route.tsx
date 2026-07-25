import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAdminAuthStore } from "@/stores/admin-auth.store";

/**
 * Guest-only shell — admin login.
 * Authenticated admins are redirected to the console home.
 */
export function AdminGuestRoute() {
  const isAuthenticated = useAdminAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  if (isAuthenticated) {
    const redirectTo =
      (location.state as { from?: { pathname?: string } } | null)?.from
        ?.pathname ?? "/admin";

    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
