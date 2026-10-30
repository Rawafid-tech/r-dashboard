import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import { MerchantLayout } from "@/app/merchant/MerchantLayout";

const BillingPage = lazy(() =>
  import("@/app/merchant/billing-page").then((m) => ({ default: m.BillingPage })),
);

const DashboardPage = lazy(() =>
  import("@/app/merchant/dashboard-page").then((m) => ({ default: m.DashboardPage })),
);

const LocationsPage = lazy(() =>
  import("@/app/merchant/locations-page").then((m) => ({ default: m.LocationsPage })),
);

const OrdersPage = lazy(() =>
  import("@/app/merchant/orders-page").then((m) => ({ default: m.OrdersPage })),
);

const ProductsPage = lazy(() =>
  import("@/app/merchant/products-page").then((m) => ({ default: m.ProductsPage })),
);

const RolesPage = lazy(() =>
  import("@/app/merchant/roles-page").then((m) => ({ default: m.RolesPage })),
);

const ShippingBoxesPage = lazy(() =>
  import("@/app/merchant/shipping-boxes-page").then((m) => ({ default: m.ShippingBoxesPage })),
);

const ShippingPartnersPage = lazy(() =>
  import("@/app/merchant/shipping-partners-page").then((m) => ({ default: m.ShippingPartnersPage })),
);

const ShipmentDetailPage = lazy(() =>
  import("@/app/merchant/shipment-detail-page").then((m) => ({ default: m.ShipmentDetailPage })),
);

const ExchangesPage = lazy(() =>
  import("@/app/merchant/exchanges-page").then((m) => ({ default: m.ExchangesPage })),
);

const ReturnsPage = lazy(() =>
  import("@/app/merchant/returns-page").then((m) => ({ default: m.ReturnsPage })),
);

const ShipmentsPage = lazy(() =>
  import("@/app/merchant/shipments-page").then((m) => ({ default: m.ShipmentsPage })),
);

const NotificationsPage = lazy(() =>
  import("@/app/merchant/notifications-page").then((m) => ({ default: m.NotificationsPage })),
);

const SettingsPage = lazy(() =>
  import("@/app/merchant/settings-page").then((m) => ({ default: m.SettingsPage })),
);

const UsersPage = lazy(() =>
  import("@/app/merchant/users-page").then((m) => ({ default: m.UsersPage })),
);

const WalletPage = lazy(() =>
  import("@/app/merchant/wallet-page").then((m) => ({ default: m.WalletPage })),
);

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
        path: "shipping-partners",
        element: <ShippingPartnersPage />,
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
        path: "orders",
        element: <OrdersPage />,
      },
      {
        path: "shipments",
        element: <ShipmentsPage />,
      },
      {
        path: "returns",
        element: <ReturnsPage />,
      },
      {
        path: "exchanges",
        element: <ExchangesPage />,
      },
      {
        path: "shipments/:shipmentId",
        element: <ShipmentDetailPage />,
      },
      {
        path: "notifications",
        element: <NotificationsPage />,
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
