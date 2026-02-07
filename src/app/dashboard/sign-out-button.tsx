"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "@/app/login/actions";
import { useTransition } from "react";
import { Loader2, LogOut } from "lucide-react";

export function SignOutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="lg"
      className="w-full"
      onClick={() => {
        startTransition(async () => {
          await signOut();
        });
      }}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="animate-spin" />
      ) : (
        <LogOut className="size-4" />
      )}
      {isPending ? "Signing out..." : "Sign Out"}
    </Button>
  );
}
