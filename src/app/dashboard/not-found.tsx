"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, SearchX } from "lucide-react";

export default function DashboardNotFound() {
  const router = useRouter();

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="size-20 rounded-2xl bg-primary/10 flex items-center justify-center">
            <SearchX className="size-10 text-primary" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <p className="text-5xl font-bold text-primary/20 tracking-tight">
            404
          </p>
          <h1 className="text-xl font-semibold text-foreground">
            Page not found
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
            This dashboard page doesn&apos;t exist or may have been removed.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="size-4" />
            Go Back
          </Button>
          <Button asChild>
            <Link href="/dashboard">
              <Home className="size-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
