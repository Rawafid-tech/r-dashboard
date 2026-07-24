import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { Suspense } from "react";
import { LoadingSpinner } from "@/shared/components/feedback/LoadingSpinner";

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
    <div className="flex h-screen w-screen items-center justify-center" style={{ background: "var(--bg-secondary)" }}>
      <LoadingSpinner size="lg" />
    </div>
  );
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex h-screen w-screen items-center justify-center" style={{ background: "var(--bg-secondary)" }}>
      <div
        className="rounded-2xl p-8 text-center"
        style={{
          background: "var(--bg-primary)",
          border: "1px solid var(--border-primary)",
          boxShadow: "var(--shadow-base)",
        }}
      >
        <h1
          className="mb-2 text-2xl font-bold "
          style={{ color: "var(--color-gray-900)" }}
        >
          {title}
        </h1>
        <p style={{ color: "var(--color-gray-500)" }}>
          Rawafid Dashboard — روافد
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<FullPageLoader />}>
          <Routes>
            <Route path="/" element={<PlaceholderPage title="🚀 Rawafid — روافد" />} />
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
