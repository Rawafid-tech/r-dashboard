import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import { GuestRoute } from "@/features/auth/components/guest-route";

const RegisterPage = lazy(() =>
  import("@/app/public/register-page").then((m) => ({
    default: m.RegisterPage,
  })),
);

/**
 * Public auth/marketing pages.
 * Page shells live under `app/public`; domain UI/logic stays in `features/*`.
 */
export const publicRoutes: RouteObject[] = [
  {
    element: <GuestRoute />,
    children: [
      {
        path: "/register",
        element: <RegisterPage />,
      },
    ],
  },
];
