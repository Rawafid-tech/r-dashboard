import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAdminAuthStore } from "@/stores/admin-auth.store";

/**
 * Auth-only shell — admin console pages.
 * Unauthenticated users are sent to admin login, preserving the intended URL.
 */
export function AdminProtectedRoute() {
  const isAuthenticated = useAdminAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate to="/admin/login" replace state={{ from: location }} />
    );
  }

  return <Outlet />;
}
