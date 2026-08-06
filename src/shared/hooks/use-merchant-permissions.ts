import { useMemo } from "react";
import { useMe } from "@/features/account/hooks/use-me";
import { getPermissionCodesFromAccessToken } from "@/shared/lib/jwt";
import { MerchantRole } from "@/shared/types/enums";
import { useAuthStore } from "@/stores/auth.store";

export const MerchantPermission = {
  USER_READ: "user:read",
  USER_MANAGE: "user:manage",
  USER_INVITE_REVEAL: "user:invite:reveal",
  USER_PASSWORD_SET: "user:password:set",
  ROLE_READ: "role:read",
  SUBSCRIPTION_READ: "subscription:read",
} as const;

export type MerchantPermissionCode =
  (typeof MerchantPermission)[keyof typeof MerchantPermission];

export function useMerchantPermissions() {
  const meQuery = useMe();
  const accessToken = useAuthStore((state) => state.accessToken);

  const permissionSet = useMemo(() => {
    return new Set(getPermissionCodesFromAccessToken(accessToken));
  }, [accessToken]);

  const isOwner = meQuery.data?.role === MerchantRole.OWNER;

  const hasPermission = (code: MerchantPermissionCode | string): boolean => {
    if (isOwner) return true;
    return permissionSet.has(code);
  };

  return {
    isOwner,
    isLoading: meQuery.isLoading,
    hasPermission,
    canReadUsers: hasPermission(MerchantPermission.USER_READ),
    canManageUsers: hasPermission(MerchantPermission.USER_MANAGE),
    canRevealInvite: hasPermission(MerchantPermission.USER_INVITE_REVEAL),
    canSetUserPassword: hasPermission(MerchantPermission.USER_PASSWORD_SET),
    canReadRoles: hasPermission(MerchantPermission.ROLE_READ),
  };
}
