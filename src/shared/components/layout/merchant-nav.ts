import {
  LayoutDashboard,
  Package,
  RefreshCcw,
  Settings,
  ShoppingBag,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export interface MerchantNavItem {
  key: string;
  href: string;
  icon: LucideIcon;
  enabled: boolean;
}

export const MERCHANT_NAV_ITEMS: MerchantNavItem[] = [
  { key: "dashboard", href: "/", icon: LayoutDashboard, enabled: true },
  { key: "shipments", href: "/shipments", icon: Package, enabled: false },
  { key: "returns", href: "/returns", icon: RefreshCcw, enabled: false },
  { key: "products", href: "/products", icon: ShoppingBag, enabled: false },
  { key: "wallet", href: "/wallet", icon: Wallet, enabled: false },
  { key: "settings", href: "/settings", icon: Settings, enabled: true },
];
