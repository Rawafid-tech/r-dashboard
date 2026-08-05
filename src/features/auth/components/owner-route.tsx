import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useMe } from "@/features/account/hooks/use-me";
import { LoadingSpinner } from "@/shared/components/feedback/LoadingSpinner";
import { MerchantRole } from "@/shared/types/enums";

/**
 * Merchant OWNER-only gate. Agents are redirected home so they never hit 403 APIs.
 */
export function OwnerGate({ children }: { children: ReactNode }) {
  const meQuery = useMe();

  if (meQuery.isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (meQuery.isError || meQuery.data?.role !== MerchantRole.OWNER) {
    return <Navigate to="/" replace />;
  }

  return children;
}
