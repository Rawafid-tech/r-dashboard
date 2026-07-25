import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import { Route } from "react-router-dom";
import { AdminLayout } from "@/app/admin/AdminLayout";
import { AdminGuestRoute } from "@/features/admin/auth/components/admin-guest-route";
import { AdminProtectedRoute } from "@/features/admin/auth/components/admin-protected-route";

const AdminLoginPage = lazy(() =>
  import("@/app/admin/login-page").then((m) => ({
    default: m.AdminLoginPage,
  })),
);

const AdminHomePage = lazy(() =>
  import("@/app/admin/home-page").then((m) => ({
    default: m.AdminHomePage,
  })),
);

export const adminRoutes: RouteObject[] = [
  {
    element: <AdminGuestRoute />,
    children: [
      {
        path: "/admin/login",
        element: <AdminLoginPage />,
      },
    ],
  },
  {
    element: <AdminProtectedRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            path: "/admin",
            element: <AdminHomePage />,
          },
        ],
      },
    ],
  },
];

function renderRouteObjects(routes: RouteObject[], keyPrefix = "") {
  return routes.map((route, index) => {
    const key = `${keyPrefix}${route.path ?? `route-${index}`}`;

    return (
      <Route key={key} path={route.path} element={route.element}>
        {route.children ? renderRouteObjects(route.children, `${key}-`) : null}
      </Route>
    );
  });
}

export function AdminRouteTree() {
  return <>{renderRouteObjects(adminRoutes)}</>;
}
