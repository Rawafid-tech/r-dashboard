import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import { GuestRoute } from "@/features/auth/components/guest-route";

const LoginPage = lazy(() =>
  import("@/app/public/login-page").then((m) => ({
    default: m.LoginPage,
  })),
);

const RegisterPage = lazy(() =>
  import("@/app/public/register-page").then((m) => ({
    default: m.RegisterPage,
  })),
);

const ForgotPasswordPage = lazy(() =>
  import("@/app/public/forgot-password-page").then((m) => ({
    default: m.ForgotPasswordPage,
  })),
);

const ResetPasswordPage = lazy(() =>
  import("@/app/public/reset-password-page").then((m) => ({
    default: m.ResetPasswordPage,
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
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/register",
        element: <RegisterPage />,
      },
      {
        path: "/forgot-password",
        element: <ForgotPasswordPage />,
      },
      {
        path: "/reset-password",
        element: <ResetPasswordPage />,
      },
    ],
  },
];
