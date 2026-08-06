import {
  CreditCard,
  LayoutDashboard,
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
  /** When true, item is shown only for company OWNER. */
  ownerOnly?: boolean;
  /** Fine-grained permission code required (owners always pass). */
  permissionCode?: string;
}

export const MERCHANT_NAV_ITEMS: MerchantNavItem[] = [
  { key: "dashboard", href: "/", icon: LayoutDashboard, enabled: true },
  { key: "billing", href: "/billing", icon: CreditCard, enabled: true },
  {
    key: "users",
    href: "/users",
    icon: Users,
    enabled: true,
    permissionCode: "user:read",
  },
  {
    key: "roles",
    href: "/roles",
    icon: Shield,
    enabled: true,
    ownerOnly: true,
  },
  { key: "shipments", href: "/shipments", icon: Package, enabled: false },
  { key: "returns", href: "/returns", icon: RefreshCcw, enabled: false },
  { key: "products", href: "/products", icon: ShoppingBag, enabled: false },
  { key: "wallet", href: "/wallet", icon: Wallet, enabled: false },
  { key: "settings", href: "/settings", icon: Settings, enabled: true },
];
