import type { RouteObject } from "react-router-dom";
import { MerchantLayout } from "@/app/merchant/MerchantLayout";
import { DashboardPage } from "@/app/merchant/dashboard-page";
import { SettingsPage } from "@/app/merchant/settings-page";

export const merchantRoutes: RouteObject[] = [
  {
    element: <MerchantLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
    ],
  },
];
