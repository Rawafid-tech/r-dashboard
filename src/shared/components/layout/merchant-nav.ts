import {
  ArrowLeftRight,
  Box,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  MapPin,
  Package,
  RefreshCcw,
  Truck,
  Settings,
  Shield,
  ShoppingBag,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import {
  MerchantPermission,
  type MerchantPermissionCode,
} from "@/shared/hooks/use-merchant-permissions";

/** Sidebar sections, rendered in this order. `overview` has no heading. */
export const MERCHANT_NAV_GROUPS = [
  "overview",
  "operations",
  "catalog",
  "shipping",
  "finance",
  "account",
] as const;

export type MerchantNavGroup = (typeof MERCHANT_NAV_GROUPS)[number];

export interface MerchantNavItem {
  key: string;
  href: string;
  icon: LucideIcon;
  enabled: boolean;
  group: MerchantNavGroup;
  /**
   * All required to show the item: the screen's `page:*` code plus the read
   * permission its PermissionGate checks, so a visible item always opens.
   */
  permissions?: MerchantPermissionCode[];
}

export interface MerchantNavSection {
  group: MerchantNavGroup;
  items: MerchantNavItem[];
}

export const MERCHANT_NAV_ITEMS: MerchantNavItem[] = [
  { key: "dashboard", href: "/", icon: LayoutDashboard, enabled: true, group: "overview" },

  {
    key: "orders",
    href: "/orders",
    icon: ClipboardList,
    enabled: true,
    group: "operations",
    permissions: [MerchantPermission.PAGE_ORDERS, MerchantPermission.ORDER_READ],
  },
  {
    key: "shipments",
    href: "/shipments",
    icon: Package,
    enabled: true,
    group: "operations",
    permissions: [MerchantPermission.PAGE_SHIPMENTS, MerchantPermission.SHIPMENT_READ],
  },
  {
    key: "returns",
    href: "/returns",
    icon: RefreshCcw,
    enabled: true,
    group: "operations",
    permissions: [MerchantPermission.PAGE_SHIPMENTS, MerchantPermission.SHIPMENT_READ],
  },
  {
    key: "exchanges",
    href: "/exchanges",
    icon: ArrowLeftRight,
    enabled: true,
    group: "operations",
    permissions: [MerchantPermission.PAGE_SHIPMENTS, MerchantPermission.SHIPMENT_READ],
  },

  {
    key: "products",
    href: "/products",
    icon: ShoppingBag,
    enabled: true,
    group: "catalog",
    permissions: [MerchantPermission.PAGE_PRODUCTS, MerchantPermission.PRODUCT_READ],
  },
  {
    key: "shippingBoxes",
    href: "/shipping-boxes",
    icon: Box,
    enabled: true,
    group: "catalog",
    permissions: [MerchantPermission.PAGE_SHIPPING_BOXES, MerchantPermission.SHIPPING_BOX_READ],
  },

  {
    key: "shippingPartners",
    href: "/shipping-partners",
    icon: Truck,
    enabled: true,
    group: "shipping",
    permissions: [MerchantPermission.PAGE_SHIPPING_PARTNERS, MerchantPermission.CARRIER_CONNECTION_READ],
  },
  {
    key: "locations",
    href: "/locations",
    icon: MapPin,
    enabled: true,
    group: "shipping",
    permissions: [MerchantPermission.PAGE_SENDER_LOCATIONS, MerchantPermission.SENDER_LOCATION_READ],
  },

  {
    key: "wallet",
    href: "/wallet",
    icon: Wallet,
    enabled: true,
    group: "finance",
    permissions: [MerchantPermission.PAGE_WALLET, MerchantPermission.WALLET_READ],
  },
  {
    key: "billing",
    href: "/billing",
    icon: CreditCard,
    enabled: true,
    group: "finance",
    permissions: [MerchantPermission.PAGE_SUBSCRIPTION, MerchantPermission.SUBSCRIPTION_READ],
  },

  {
    key: "users",
    href: "/users",
    icon: Users,
    enabled: true,
    group: "account",
    permissions: [MerchantPermission.PAGE_USERS, MerchantPermission.USER_READ],
  },
  {
    key: "roles",
    href: "/roles",
    icon: Shield,
    enabled: true,
    group: "account",
    permissions: [MerchantPermission.PAGE_ROLES, MerchantPermission.ROLE_READ],
  },
  { key: "settings", href: "/settings", icon: Settings, enabled: true, group: "account" },
];

/** Buckets items by group in MERCHANT_NAV_GROUPS order, dropping empty groups. */
export function groupMerchantNavItems(items: MerchantNavItem[]): MerchantNavSection[] {
  return MERCHANT_NAV_GROUPS.map((group) => ({
    group,
    items: items.filter((item) => item.group === group),
  })).filter((section) => section.items.length > 0);
}
