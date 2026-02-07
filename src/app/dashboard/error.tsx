"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, RefreshCw, ServerCrash } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  // Try to detect common error types from the message
  const isNetworkError =
    error.message?.toLowerCase().includes("fetch") ||
    error.message?.toLowerCase().includes("network") ||
    error.message?.toLowerCase().includes("timeout");

  const isApiError =
    error.message?.toLowerCase().includes("api") ||
    error.message?.toLowerCase().includes("unauthorized") ||
    error.message?.toLowerCase().includes("forbidden") ||
    error.message?.toLowerCase().includes("500") ||
    error.message?.toLowerCase().includes("server");

  const title = isNetworkError
    ? "Connection Error"
    : isApiError
      ? "Server Error"
      : "Something went wrong";

  const description = isNetworkError
    ? "Unable to reach the server. Please check your internet connection and try again."
    : isApiError
      ? "The server encountered an error while processing your request. Please try again later."
      : "An unexpected error occurred while loading this page. You can retry or navigate away.";

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="size-20 rounded-2xl bg-destructive/10 flex items-center justify-center">
            <ServerCrash className="size-10 text-destructive" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
            {description}
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground/60 font-mono mt-2">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="size-4" />
            Go Back
          </Button>
          <Button variant="outline" onClick={reset}>
            <RefreshCw className="size-4" />
            Try Again
          </Button>
          <Button asChild>
            <Link href="/dashboard">
              <Home className="size-4" />
              Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
