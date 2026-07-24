import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { Suspense } from "react";
import { LoadingSpinner } from "@/shared/components/feedback/LoadingSpinner";
import { UiPlayground } from "@/app/dev/UiPlayground";

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
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<FullPageLoader />}>
          <Routes>
            <Route path="/" element={<UiPlayground />} />
            <Route path="/ui" element={<UiPlayground />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Toaster
        position="top-center"
        richColors
        dir="auto"
        toastOptions={{
          style: {
            fontFamily: "var(--font-primary)",
          },
        }}
      />
    </QueryClientProvider>
  );
}
