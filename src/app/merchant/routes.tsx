import type { RouteObject } from "react-router-dom";
import { MerchantLayout } from "@/app/merchant/MerchantLayout";
import { BillingPage } from "@/app/merchant/billing-page";
import { DashboardPage } from "@/app/merchant/dashboard-page";
import { LocationsPage } from "@/app/merchant/locations-page";
import { ProductsPage } from "@/app/merchant/products-page";
import { RolesPage } from "@/app/merchant/roles-page";
import { ShippingBoxesPage } from "@/app/merchant/shipping-boxes-page";
import { SettingsPage } from "@/app/merchant/settings-page";
import { UsersPage } from "@/app/merchant/users-page";
import { WalletPage } from "@/app/merchant/wallet-page";

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
        path: "products",
        element: <ProductsPage />,
      },
      {
        path: "shipping-boxes",
        element: <ShippingBoxesPage />,
      },
      {
        path: "users",
        element: <UsersPage />,
      },
      {
        path: "locations",
        element: <LocationsPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
      {
        path: "wallet",
        element: <WalletPage />,
      },
    ],
  },
];
