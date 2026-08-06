import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { LoadingSpinner } from "@/shared/components/feedback/LoadingSpinner";
import { UiPlayground } from "@/app/dev/UiPlayground";
import { merchantRoutes } from "@/app/merchant/routes";
import { AdminRouteTree } from "@/app/admin/routes";
import { publicRoutes } from "@/app/public/routes";
import { ProtectedRoute } from "@/features/auth/components/protected-route";
import { useLocaleStore } from "@/stores/locale.store";

const AcceptInvitePage = lazy(() =>
  import("@/app/public/accept-invite-page").then((m) => ({
    default: m.AcceptInvitePage,
  })),
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function FullPageLoader() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <LoadingSpinner size="lg" />
    </div>
  );
}

export default function App() {
  const dir = useLocaleStore((state) => state.dir);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
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
              <Route path="/ui" element={<UiPlayground />} />
            </Route>

            {AdminRouteTree()}

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Toaster
        position="top-center"
        richColors
        dir={dir}
        toastOptions={{
          style: {
            fontFamily: "var(--font-primary)",
          },
        }}
      />
    </QueryClientProvider>
  );
}
