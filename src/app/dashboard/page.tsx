import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignOutButton } from "./sign-out-button";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold">Dashboard</CardTitle>
          <p className="text-sm text-muted-foreground">
            You are signed in successfully
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted/50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">User ID</span>
              <span className="text-sm font-mono">{user.id.slice(0, 8)}...</span>
            </div>
            {user.email && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Email</span>
                <span className="text-sm">{user.email}</span>
              </div>
            )}
            {user.phone && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Phone</span>
                <span className="text-sm">{user.phone}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Provider</span>
              <span className="text-sm capitalize">
                {user.app_metadata?.provider || "email"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Last sign in</span>
              <span className="text-sm">
                {user.last_sign_in_at
                  ? new Date(user.last_sign_in_at).toLocaleString()
                  : "N/A"}
              </span>
            </div>
          </div>
          <SignOutButton />
        </CardContent>
      </Card>
    </div>
  );
}
