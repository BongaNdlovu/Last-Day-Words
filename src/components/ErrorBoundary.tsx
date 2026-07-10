import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Optional label for logs (e.g. screen name). */
  name?: string;
}

interface State {
  hasError: boolean;
  message: string;
}

/**
 * Catches render errors so a single screen failure does not white-screen the app.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error?.message || "Something went wrong.",
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    const scope = this.props.name ? `[${this.props.name}] ` : "";
    console.error(`${scope}ErrorBoundary caught:`, error, info.componentStack);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, message: "" });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        className="min-h-[50vh] flex items-center justify-center p-6"
        role="alert"
        aria-live="assertive"
      >
        <div className="pcard max-w-md w-full rounded-2xl p-8 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 mx-auto rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-800 flex items-center justify-center text-xl font-bold">
            !
          </div>
          <h2 className="text-xl font-display font-bold text-[#f4f1ea]">Something went wrong</h2>
          <p className="text-sm text-[#c9c2b4] leading-relaxed">
            This screen hit an unexpected error. Your local progress is usually still saved in this
            browser — try again or reload the app.
          </p>
          {this.state.message && (
            <p className="text-[11px] font-mono text-[#a49b8d] bg-white/[0.06] border border-white/10 rounded-lg px-3 py-2 break-words">
              {this.state.message}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              type="button"
              onClick={this.handleReset}
              className="flex-1 py-2.5 border border-white/10 bg-white/[0.06] hover:bg-white/10 text-[#f4f1ea] rounded-lg text-xs font-semibold cursor-pointer"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={this.handleReload}
              className="flex-1 py-2.5 bg-[#101014] hover:bg-black text-[#f8f1e3] rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Reload app
            </button>
          </div>
        </div>
      </div>
    );
  }
}
