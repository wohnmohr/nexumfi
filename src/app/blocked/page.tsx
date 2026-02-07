"use client";

import { Suspense, useSearchParams } from "next/navigation";
import { ShieldAlert, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/app/login/actions";

export default function BlockedPage() {
  return (
    <Suspense fallback={<BlockedContent reason="ERROR" />}>
      <BlockedContentFromParams />
    </Suspense>
  );
}

function BlockedContentFromParams() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason") === "FLAGGED" ? "FLAGGED" : "ERROR";
  return <BlockedContent reason={reason} />;
}

function BlockedContent({ reason }: { reason: "FLAGGED" | "ERROR" }) {
  const isFlagged = reason === "FLAGGED";
  const title = isFlagged ? "Account is blocked" : "AML verification is pending";
  const description = isFlagged
    ? "Your account has been flagged due to an AML (Anti-Money Laundering) issue. Please contact support to resolve this before you can access the platform."
    : "Your AML (Anti-Money Laundering) verification is pending. You cannot access the platform until this is cleared. Please contact support if you need assistance.";

  async function handleSignOut() {
    await signOut();
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-background p-4">
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl text-center space-y-6">
        <div className="mx-auto size-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
          <ShieldAlert className="size-8 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-col gap-3 pt-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleSignOut}
          >
            <LogOut className="size-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
