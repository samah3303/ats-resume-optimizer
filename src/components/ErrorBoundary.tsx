"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import Link from "next/link";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[Uncaught Client Exception]:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 font-sans">
          <div className="nordic-card max-w-md w-full p-6 sm:p-8 text-center space-y-4 rounded-2xl sm:rounded-[4px] border border-nordic-border shadow-lg">
            <div
              className="w-14 h-14 rounded-full bg-nordic-error/10 text-nordic-error mx-auto flex items-center justify-center font-bold text-2xl"
              aria-hidden="true"
            >
              ⚠
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-nordic-text">
                Something went wrong
              </h2>
              <p className="text-xs sm:text-sm text-nordic-text-secondary leading-relaxed">
                An unexpected interface error occurred. Your profile data and saved jobs are secure.
              </p>
            </div>

            {process.env.NODE_ENV !== "production" && this.state.error && (
              <div className="p-3 bg-nordic-bg border border-nordic-border rounded-[4px] text-[11px] font-mono text-left overflow-x-auto text-nordic-error">
                {this.state.error.message}
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="nordic-btn-primary h-10 px-5 text-xs font-bold uppercase tracking-wide cursor-pointer tap-active"
              >
                Reload Page
              </button>
              <Link
                href="/dashboard"
                onClick={this.handleReset}
                className="nordic-btn-outline h-10 px-5 text-xs font-semibold flex items-center justify-center tap-active"
              >
                Return to Overview
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
