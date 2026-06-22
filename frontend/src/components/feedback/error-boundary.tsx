import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: (error: Error, reset: () => void) => React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/** Top-level safety net so a render-time exception in any feature module
 * shows a recoverable screen instead of a blank white app. */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    // In production this would forward to an observability sink
    // (Sentry, Datadog, etc). Kept as console output for the portfolio build.
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  reset = (): void => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    if (this.props.fallback) {
      return this.props.fallback(error, this.reset);
    }

    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 p-8 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-priority-high-bg)]">
          <AlertTriangle className="h-6 w-6 text-[var(--color-priority-high)]" />
        </span>
        <h2 className="font-display text-base font-semibold text-[var(--color-text-primary)]">
          Something broke on this screen
        </h2>
        <p className="max-w-sm text-sm text-[var(--color-text-muted)]">
          {error.message || "An unexpected error occurred while rendering this view."}
        </p>
        <Button variant="secondary" size="sm" onClick={this.reset}>
          Try again
        </Button>
      </div>
    );
  }
}
