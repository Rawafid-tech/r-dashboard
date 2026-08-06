import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LoadingSpinner } from "@/shared/components/feedback/LoadingSpinner";
import {
  useMerchantPermissions,
  type MerchantPermissionCode,
} from "@/shared/hooks/use-merchant-permissions";

interface PermissionGateProps {
  permission: MerchantPermissionCode | string;
  children: ReactNode;
  redirectTo?: string;
}

/**
 * Hides merchant routes the signed-in user cannot access (403 avoidance).
 * Company owners always pass.
 */
export function PermissionGate({
  permission,
  children,
  redirectTo = "/",
}: PermissionGateProps) {
  const { t } = useTranslation("common");
  const { isLoading, hasPermission } = useMerchantPermissions();

  if (isLoading) {
    return (
      <div
        className="flex min-h-[40vh] items-center justify-center"
        role="status"
        aria-label={t("common.loading")}
      >
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!hasPermission(permission)) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
