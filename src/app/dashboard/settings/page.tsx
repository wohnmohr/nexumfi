"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, ArrowLeft } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="p-4 md:p-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account and preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="size-5 text-primary" />
            Account
          </CardTitle>
          <CardDescription>
            View and update your profile information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href="/dashboard/profile">
              <User className="size-4" />
              View Profile
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Button variant="ghost" asChild>
        <Link href="/dashboard">
          <ArrowLeft className="size-4" />
          Back to Dashboard
        </Link>
      </Button>
    </div>
  );
}
