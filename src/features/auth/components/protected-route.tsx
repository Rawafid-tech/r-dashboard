import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";

/**
 * Auth-only shell — merchant/admin private pages.
 * Unauthenticated users are sent to login, preserving the intended URL.
 */
export function ProtectedRoute({
  loginPath = "/login",
}: {
  loginPath?: string;
}) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate to={loginPath} replace state={{ from: location }} />
    );
  }

  return <Outlet />;
}
