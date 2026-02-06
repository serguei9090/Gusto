import { AlertCircle, RefreshCw } from "lucide-react";
import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { errorManager } from "@/services/error/ErrorManager";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  errorDetail: Error | null;
}

/**
 * GlobalErrorBarrier
 * A high-level safety net to catch UI rendering crashes and provide a recovery UI.
 */
export class GlobalErrorBarrier extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorDetail: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, errorDetail: error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to our central manager
    errorManager.handleError(error, "UI_REDUNDANCY_CRASH", false);
    console.error("Uncaught UI Error:", error, errorInfo);
  }

  private readonly handleReset = () => {
    // Try to recover by reloading the app or clearing state
    globalThis.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6 text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-6 text-destructive">
            <AlertCircle size={32} />
          </div>

          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-muted-foreground max-w-md mb-8">
            The application encountered an unexpected UI crash. A technical
            report has been saved to your local logs.
          </p>

          <div className="flex gap-4">
            <Button onClick={this.handleReset} className="gap-2">
              <RefreshCw size={16} />
              Restart App
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                globalThis.location.href = "/";
              }}
            >
              Go Home
            </Button>
          </div>

          {process.env.NODE_ENV === "development" && (
            <div className="mt-12 p-4 bg-muted rounded-md text-left max-w-2xl w-full overflow-auto">
              <p className="font-mono text-xs text-destructive mb-2 font-bold uppercase">
                Dev Debug Info:
              </p>
              <pre className="font-mono text-[10px] leading-tight">
                {this.state.errorDetail?.message}
                {"\n\n"}
                {this.state.errorDetail?.stack}
              </pre>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
