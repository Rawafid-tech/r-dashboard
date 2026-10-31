import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/shared/api/query-client";
import { Toaster } from "sonner";
import { ErrorBoundary } from "@/shared/components/feedback/error-boundary";
import { LoadingSpinner } from "@/shared/components/feedback/LoadingSpinner";
import { merchantRoutes } from "@/app/merchant/routes";
import { AdminRouteTree } from "@/app/admin/routes";
import { publicRoutes } from "@/app/public/routes";
import { ProtectedRoute } from "@/features/auth/components/protected-route";
import { useLocaleStore } from "@/stores/locale.store";
import { useThemeStore } from "@/stores/theme.store";

const AcceptInvitePage = lazy(() =>
  import("@/app/public/accept-invite-page").then((m) => ({
    default: m.AcceptInvitePage,
  })),
);

// Dev-only component showcase; never bundled into production routes.
const UiPlayground = import.meta.env.DEV
  ? lazy(() =>
      import("@/app/dev/UiPlayground").then((m) => ({
        default: m.UiPlayground,
      })),
    )
  : null;

function FullPageLoader() {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-background">
      <LoadingSpinner size="lg" />
    </div>
  );
}

export default function App() {
  const dir = useLocaleStore((state) => state.dir);
  const theme = useThemeStore((state) => state.theme);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ErrorBoundary>
          <Suspense fallback={<FullPageLoader />}>
            <Routes>
              <Route path="/accept-invite" element={<AcceptInvitePage />} />

              {/* Guest-only: register / login / pricing */}
              {publicRoutes.map((route, index) => (
                <Route key={route.path ?? `public-${index}`} element={route.element}>
                  {route.children?.map((child) => (
                    <Route
                      key={child.path}
                      path={child.path}
                      element={child.element}
                    />
                  ))}
                </Route>
              ))}

              {/* Auth-only app pages */}
              <Route element={<ProtectedRoute loginPath="/login" />}>
                {merchantRoutes.map((route, index) => (
                  <Route
                    key={route.path ?? `merchant-${index}`}
                    element={route.element}
                  >
                    {route.children?.map((child) => (
                      <Route
                        key={child.path ?? "index"}
                        index={child.index}
                        path={child.path}
                        element={child.element}
                      />
                    ))}
                  </Route>
                ))}
                {UiPlayground ? (
                  <Route path="/ui" element={<UiPlayground />} />
                ) : null}
              </Route>

              {AdminRouteTree()}

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </BrowserRouter>
      <Toaster
        position="top-center"
        richColors
        dir={dir}
        theme={theme}
        toastOptions={{
          style: {
            fontFamily: "var(--font-primary)",
          },
        }}
      />
    </QueryClientProvider>
  );
}
