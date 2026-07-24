import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";

/**
 * Guest-only shell — login/register/pricing.
 * Authenticated users are redirected away (usually home).
 */
export function GuestRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  if (isAuthenticated) {
    const redirectTo =
      (location.state as { from?: { pathname?: string } } | null)?.from
        ?.pathname ?? "/";

    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
