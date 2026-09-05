import {
  Box,
  CreditCard,
  LayoutDashboard,
  MapPin,
  Package,
  RefreshCcw,
  Settings,
  Shield,
  ShoppingBag,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export interface MerchantNavItem {
  key: string;
  href: string;
  icon: LucideIcon;
  enabled: boolean;
  /** PAGE permission from GET /api/auth/me → permissions (e.g. page:users). */
  permissionCode?: string;
}

export const MERCHANT_NAV_ITEMS: MerchantNavItem[] = [
  { key: "dashboard", href: "/", icon: LayoutDashboard, enabled: true },
  {
    key: "billing",
    href: "/billing",
    icon: CreditCard,
    enabled: true,
    permissionCode: "page:subscription",
  },
  {
    key: "users",
    href: "/users",
    icon: Users,
    enabled: true,
    permissionCode: "page:users",
  },
  {
    key: "roles",
    href: "/roles",
    icon: Shield,
    enabled: true,
    permissionCode: "page:roles",
  },
  {
    key: "products",
    href: "/products",
    icon: ShoppingBag,
    enabled: true,
    permissionCode: "page:products",
  },
  {
    key: "shippingBoxes",
    href: "/shipping-boxes",
    icon: Box,
    enabled: true,
    permissionCode: "page:shippingBoxes",
  },
  {
    key: "locations",
    href: "/locations",
    icon: MapPin,
    enabled: true,
    permissionCode: "page:senderLocations",
  },
  { key: "shipments", href: "/shipments", icon: Package, enabled: false },
  { key: "returns", href: "/returns", icon: RefreshCcw, enabled: false },
  {
    key: "wallet",
    href: "/wallet",
    icon: Wallet,
    enabled: true,
    permissionCode: "page:wallet",
  },
  { key: "settings", href: "/settings", icon: Settings, enabled: true },
];
