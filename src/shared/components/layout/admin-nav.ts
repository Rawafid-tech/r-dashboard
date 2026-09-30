import {
  Building2,
  CreditCard,
  LayoutDashboard,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavItem {
  key: string;
  href: string;
  icon: LucideIcon;
  enabled: boolean;
  end?: boolean;
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { key: "home", href: "/admin", icon: LayoutDashboard, enabled: true, end: true },
  { key: "companies", href: "/admin/companies", icon: Building2, enabled: true },
  { key: "plans", href: "/admin/plans", icon: CreditCard, enabled: true },
  { key: "carriers", href: "/admin/carriers", icon: Truck, enabled: true },
  { key: "users", href: "/admin/users", icon: Users, enabled: true },
];
