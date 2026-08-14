import { useCallback, useMemo } from "react";
import { useMe } from "@/features/account/hooks/use-me";
import { getPermissionCodesFromAccessToken } from "@/shared/lib/jwt";
import { MerchantRole } from "@/shared/types/enums";
import { useAuthStore } from "@/stores/auth.store";

export const MerchantPermission = {
  PAGE_USERS: "page:users",
  PAGE_ROLES: "page:roles",
  PAGE_SUBSCRIPTION: "page:subscription",
  PAGE_SENDER_LOCATIONS: "page:senderLocations",
  USER_READ: "user:read",
  USER_MANAGE: "user:manage",
  USER_INVITE_REVEAL: "user:invite:reveal",
  USER_PASSWORD_SET: "user:password:set",
  ROLE_READ: "role:read",
  SUBSCRIPTION_READ: "subscription:read",
  SENDER_LOCATION_READ: "senderLocation:read",
  SENDER_LOCATION_MANAGE: "senderLocation:manage",
} as const;

export type MerchantPermissionCode =
  (typeof MerchantPermission)[keyof typeof MerchantPermission];

function resolvePermissionSet(
  mePermissions: string[] | undefined,
  accessToken: string | null | undefined,
): Set<string> {
  if (mePermissions?.length) {
    return new Set(mePermissions);
  }

  return new Set(getPermissionCodesFromAccessToken(accessToken));
}

export function useMerchantPermissions() {
  const meQuery = useMe();
  const accessToken = useAuthStore((state) => state.accessToken);

  const permissionSet = useMemo(
    () => resolvePermissionSet(meQuery.data?.permissions, accessToken),
    [meQuery.data?.permissions, accessToken],
  );

  const isOwner = meQuery.data?.role === MerchantRole.OWNER;

  const hasPermission = useCallback(
    (code: MerchantPermissionCode | string): boolean => permissionSet.has(code),
    [permissionSet],
  );

  return {
    isOwner,
    isLoading: meQuery.isLoading,
    permissions: permissionSet,
    hasPermission,
    canReadUsers: hasPermission(MerchantPermission.USER_READ),
    canManageUsers: hasPermission(MerchantPermission.USER_MANAGE),
    canRevealInvite: hasPermission(MerchantPermission.USER_INVITE_REVEAL),
    canSetUserPassword: hasPermission(MerchantPermission.USER_PASSWORD_SET),
    canReadRoles: hasPermission(MerchantPermission.ROLE_READ),
    canManageRoles: isOwner,
    canReadSubscription: hasPermission(MerchantPermission.SUBSCRIPTION_READ),
    canReadSenderLocations: hasPermission(
      MerchantPermission.SENDER_LOCATION_READ,
    ),
    canManageSenderLocations: hasPermission(
      MerchantPermission.SENDER_LOCATION_MANAGE,
    ),
  };
}
