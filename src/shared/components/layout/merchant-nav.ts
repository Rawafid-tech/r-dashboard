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
  /** PAGE permission from GET /api/auth/me → permissions (e.g. page:users). */
  permissionCode?: string;
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
    permissionCode: "page:orders",
  },
  {
    key: "shipments",
    href: "/shipments",
    icon: Package,
    enabled: true,
    group: "operations",
    permissionCode: "page:shipments",
  },
  {
    key: "returns",
    href: "/returns",
    icon: RefreshCcw,
    enabled: true,
    group: "operations",
    permissionCode: "page:shipments",
  },
  {
    key: "exchanges",
    href: "/exchanges",
    icon: ArrowLeftRight,
    enabled: true,
    group: "operations",
    permissionCode: "page:shipments",
  },

  {
    key: "products",
    href: "/products",
    icon: ShoppingBag,
    enabled: true,
    group: "catalog",
    permissionCode: "page:products",
  },
  {
    key: "shippingBoxes",
    href: "/shipping-boxes",
    icon: Box,
    enabled: true,
    group: "catalog",
    permissionCode: "page:shippingBoxes",
  },

  {
    key: "shippingPartners",
    href: "/shipping-partners",
    icon: Truck,
    enabled: true,
    group: "shipping",
    permissionCode: "page:shippingPartners",
  },
  {
    key: "locations",
    href: "/locations",
    icon: MapPin,
    enabled: true,
    group: "shipping",
    permissionCode: "page:senderLocations",
  },

  {
    key: "wallet",
    href: "/wallet",
    icon: Wallet,
    enabled: true,
    group: "finance",
    permissionCode: "page:wallet",
  },
  {
    key: "billing",
    href: "/billing",
    icon: CreditCard,
    enabled: true,
    group: "finance",
    permissionCode: "page:subscription",
  },

  {
    key: "users",
    href: "/users",
    icon: Users,
    enabled: true,
    group: "account",
    permissionCode: "page:users",
  },
  {
    key: "roles",
    href: "/roles",
    icon: Shield,
    enabled: true,
    group: "account",
    permissionCode: "page:roles",
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
