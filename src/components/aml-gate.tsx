"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ShieldAlert, LogOut, Loader2, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/app/login/actions";
import { checkAmlStatus, type AmlBlockedReason } from "@/lib/aml-check";

export function AmlGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "blocked" | "allowed">(
    "loading"
  );
  const [blockedReason, setBlockedReason] = useState<AmlBlockedReason>("ERROR");

  useEffect(() => {
    checkAml();
  }, []);

  async function checkAml() {
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setStatus("allowed");
        return;
      }

      const aml = await checkAmlStatus(session.access_token);
      if (aml.blocked) {
        setBlockedReason(aml.reason ?? "ERROR");
        setStatus("blocked");
      } else {
        setStatus("allowed");
      }
    } catch {
      setStatus("allowed");
    }
  }

  async function handleSignOut() {
    await signOut();
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (status === "blocked") {
    const isFlagged = blockedReason === "FLAGGED";
    const title = isFlagged ? "Account is blocked" : "AML verification is pending";
    const description = isFlagged
      ? "Your account has been flagged due to an AML (Anti-Money Laundering) issue. Please contact support to resolve this before you can access the platform."
      : "Your AML (Anti-Money Laundering) verification is pending. You cannot access the platform until this is cleared. Please contact support if you need assistance.";

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background p-4">
        <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl text-center space-y-6">
          <div className="mx-auto size-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
            <ShieldAlert className="size-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-semibold">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <div className="flex flex-col gap-3 pt-2">
            {!isFlagged && (
              <Button
                className="w-full"
                onClick={() => router.push("/contact")}
              >
                <Headphones className="size-4" />
                Contact Support
              </Button>
            )}
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

  return <>{children}</>;
}
