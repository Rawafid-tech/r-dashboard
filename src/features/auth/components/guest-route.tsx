import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { returnPathFrom } from "@/features/auth/lib/return-to";

/**
 * Guest-only shell — login/register/pricing.
 * Authenticated users are redirected away (usually home).
 */
export function GuestRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  if (isAuthenticated) {
    return <Navigate to={returnPathFrom(location.state, location.search)} replace />;
  }

  return <Outlet />;
}
