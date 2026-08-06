import type { RouteObject } from "react-router-dom";
import { MerchantLayout } from "@/app/merchant/MerchantLayout";
import { BillingPage } from "@/app/merchant/billing-page";
import { DashboardPage } from "@/app/merchant/dashboard-page";
import { RolesPage } from "@/app/merchant/roles-page";
import { SettingsPage } from "@/app/merchant/settings-page";
import { UsersPage } from "@/app/merchant/users-page";

export const merchantRoutes: RouteObject[] = [
  {
    element: <MerchantLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "billing",
        element: <BillingPage />,
      },
      {
        path: "roles",
        element: <RolesPage />,
      },
      {
        path: "users",
        element: <UsersPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
    ],
  },
];
