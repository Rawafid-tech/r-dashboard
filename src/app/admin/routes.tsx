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

const AdminCompaniesPage = lazy(() =>
  import("@/app/admin/companies-page").then((m) => ({
    default: m.AdminCompaniesPage,
  })),
);

const AdminCompanyDetailPage = lazy(() =>
  import("@/app/admin/company-detail-page").then((m) => ({
    default: m.AdminCompanyDetailPage,
  })),
);

const AdminPlansPage = lazy(() =>
  import("@/app/admin/plans-page").then((m) => ({
    default: m.AdminPlansPage,
  })),
);

const AdminPlanCreatePage = lazy(() =>
  import("@/app/admin/plan-create-page").then((m) => ({
    default: m.AdminPlanCreatePage,
  })),
);

const AdminPlanDetailPage = lazy(() =>
  import("@/app/admin/plan-detail-page").then((m) => ({
    default: m.AdminPlanDetailPage,
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
          {
            path: "/admin/companies",
            element: <AdminCompaniesPage />,
          },
          {
            path: "/admin/companies/:companyId",
            element: <AdminCompanyDetailPage />,
          },
          {
            path: "/admin/plans",
            element: <AdminPlansPage />,
          },
          {
            path: "/admin/plans/new",
            element: <AdminPlanCreatePage />,
          },
          {
            path: "/admin/plans/:planId",
            element: <AdminPlanDetailPage />,
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
