/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

/**
 * Error Boundary to catch component crashes
 * Prevents entire app from crashing if a child component fails
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to console in development
    console.error("❌ Error caught by boundary:", error, errorInfo);

    // Update state with error info
    this.setState({ errorInfo });

    // TODO: Send to error tracking service (Sentry, etc.)
    // if (process.env.NODE_ENV === 'production') {
    //   captureException(error, errorInfo);
    // }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-red-50">
          <div className="p-8 bg-white rounded-lg border border-red-300 space-y-4 max-w-md shadow-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-red-600" size={24} />
              <h2 className="text-lg font-bold text-red-800">
                Application Error
              </h2>
            </div>

            <div className="bg-red-50 p-4 rounded border border-red-200 space-y-2">
              <p className="text-sm text-red-700 font-mono">
                {this.state.error?.message ||
                  "An unexpected error occurred"}
              </p>

              {process.env.NODE_ENV === "development" &&
                this.state.errorInfo && (
                  <details className="text-xs text-red-600 cursor-pointer">
                    <summary className="font-semibold">Stack trace</summary>
                    <pre className="mt-2 p-2 bg-red-100 rounded overflow-auto max-h-40 text-[10px]">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
            </div>

            <p className="text-sm text-gray-600">
              We've encountered an issue. Please try refreshing the page or
              contact support if the problem persists.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-semibold transition-colors"
              >
                Reload Application
              </button>
              <button
                onClick={() =>
                  (window.location.href = "/")
                }
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 font-semibold transition-colors"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
