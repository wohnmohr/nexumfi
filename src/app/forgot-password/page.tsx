"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { resetPassword } from "@/app/login/actions";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Per-field validation
  const [touched, setTouched] = useState({ email: false });
  const fieldErrors = {
    email: touched.email
      ? !email.trim()
        ? "Email is required"
        : !EMAIL_REGEX.test(email)
          ? "Please enter a valid email address"
          : null
      : null,
  };

  const hasFieldErrors = Object.values(fieldErrors).some(Boolean);

  const handleReset = () => {
    setError(null);
    setSuccess(null);

    // Touch all fields to reveal errors
    setTouched({ email: true });

    if (!EMAIL_REGEX.test(email)) {
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("email", email);
      const result = await resetPassword(formData);

      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setSuccess(result.message);
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-semibold">
            Reset password
          </CardTitle>
          <CardDescription>
            Enter your email and we&apos;ll send you a reset link
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400 flex items-start gap-2">
              <CheckCircle2 className="size-4 mt-0.5 shrink-0" />
              <span>{success}</span>
            </div>
          )}
          {!success && (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  onBlur={() => setTouched({ email: true })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && email.trim()) {
                      handleReset();
                    }
                  }}
                  aria-invalid={!!fieldErrors.email}
                  disabled={isPending}
                />
                {fieldErrors.email && (
                  <p className="text-xs text-destructive">{fieldErrors.email}</p>
                )}
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={handleReset}
                disabled={isPending || !email.trim() || hasFieldErrors}
              >
                {isPending ? <Loader2 className="animate-spin" /> : null}
                {isPending ? "Sending..." : "Send Reset Link"}
              </Button>
            </>
          )}
        </CardContent>
        <CardFooter>
          <Link
            href="/?auth=open"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
          >
            <ArrowLeft className="size-4" />
            Back to sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
