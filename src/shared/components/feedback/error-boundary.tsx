import { Component, type ErrorInfo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";

interface ErrorBoundaryProps {
  children: ReactNode;
  /** When this value changes (e.g. the route pathname), the boundary resets. */
  resetKey?: unknown;
  className?: string;
}

interface ErrorBoundaryState {
  error: Error | null;
  resetKey: unknown;
}

/**
 * Catches render errors and failed lazy-chunk loads (e.g. after a deploy) so
 * the user sees a recovery screen instead of a blank page.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null, resetKey: this.props.resetKey };

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { error };
  }

  static getDerivedStateFromProps(
    props: ErrorBoundaryProps,
    state: ErrorBoundaryState,
  ): Partial<ErrorBoundaryState> | null {
    if (props.resetKey !== state.resetKey) {
      return { error: null, resetKey: props.resetKey };
    }
    return null;
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error(error, info.componentStack);
    }
  }

  private retry = () => {
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <ErrorFallback
        className={this.props.className}
        onRetry={this.retry}
      />
    );
  }
}

export function ErrorFallback({
  onRetry,
  className,
}: {
  onRetry: () => void;
  className?: string;
}) {
  const { t } = useTranslation("common");

  return (
    <div
      role="alert"
      className={cn(
        "flex min-h-[50dvh] flex-col items-center justify-center gap-4 px-4 py-12 text-center",
        className,
      )}
    >
      <div className="grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-6" aria-hidden="true" />
      </div>
      <div className="max-w-md space-y-1.5">
        <h1 className="text-lg font-semibold text-foreground">
          {t("errorBoundary.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("errorBoundary.description")}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button type="button" onClick={() => window.location.reload()}>
          <RefreshCw aria-hidden="true" />
          {t("errorBoundary.reload")}
        </Button>
        <Button type="button" variant="outline" onClick={onRetry}>
          {t("errorBoundary.tryAgain")}
        </Button>
      </div>
    </div>
  );
}
