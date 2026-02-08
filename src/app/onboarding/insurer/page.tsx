"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiFetch } from "@/lib/api-fetch";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { AppLogo } from "@/components/layout/app-logo";
import {
  ShieldCheck,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  Pencil,
  Sparkles,
} from "lucide-react";
import {
  saveSimpleInsurer,
  generateSimpleInsurerId,
  maskValue,
  type SimpleInsurer,
} from "@/lib/insurers";

/* ------------------------------------------------------------------ */
/*  Form state types                                                   */
/* ------------------------------------------------------------------ */

interface FormData {
  country: "" | "IN" | "US";
  full_name: string;
  dob: string;
  identity_value: string; /* PAN for IN, SSN for US */
  email: string;
}

const INITIAL_FORM: FormData = {
  country: "",
  full_name: "",
  dob: "",
  identity_value: "",
  email: "",
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function InsurerOnboardingPage() {
  const router = useRouter();

  /* form state */
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  /* submission state */
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [insurerId, setInsurerId] = useState("");
  const [submitError, setSubmitError] = useState("");

  /* ---- helpers ---- */

  function updateField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function touchField(key: string) {
    setTouched((prev) => ({ ...prev, [key]: true }));
  }

  function touchAll(keys: string[]) {
    setTouched((prev) => {
      const next = { ...prev };
      keys.forEach((k) => {
        next[k] = true;
      });
      return next;
    });
  }

  /* ---- validation ---- */

  function getFieldError(key: string): string | null {
    if (!touched[key]) return null;
    const v = (form as unknown as Record<string, string>)[key];

    switch (key) {
      case "country":
        return !v ? "Please select a country" : null;
      case "full_name":
        return !v?.trim() ? "Full name is required" : null;
      case "dob":
        return !v?.trim() ? "Date of birth is required" : null;
      case "identity_value":
        if (form.country === "IN") {
          return !v?.trim()
            ? "PAN is required"
            : !/^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(v.trim())
              ? "Enter a valid 10-character PAN"
              : null;
        }
        if (form.country === "US") {
          return !v?.trim()
            ? "SSN is required"
            : !/^\d{9}$/.test(v.replace(/\D/g, ""))
              ? "Enter a valid 9-digit SSN (e.g. 123-45-6789)"
              : null;
        }
        return null;
      case "email":
        return !v?.trim()
          ? "Email is required"
          : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
            ? "Enter a valid email address"
            : null;
      default:
        return null;
    }
  }

  function isFormValid(): boolean {
    if (
      !form.country ||
      !form.full_name.trim() ||
      !form.dob.trim() ||
      !form.email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    )
      return false;

    if (form.country === "IN") {
      if (!form.identity_value.trim() || !/^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(form.identity_value.trim()))
        return false;
    }

    if (form.country === "US") {
      if (!form.identity_value.trim() || !/^\d{9}$/.test(form.identity_value.replace(/\D/g, "")))
        return false;
    }

    return true;
  }

  /* ---- review & submit ---- */

  function handleReview() {
    const allKeys = [
      "country",
      "full_name",
      "dob",
      "identity_value",
      "email",
    ];
    touchAll(allKeys);

    if (isFormValid()) {
      setShowReview(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setSubmitError("");

    const body: Record<string, unknown> = {
      country: form.country,
      full_name: form.full_name.trim(),
      dob: form.dob.trim(),
      identity_document_type: form.country === "IN" ? "PAN" : "SSN",
      email: form.email.trim().toLowerCase(),
    };

    if (form.country === "IN") {
      body.pan = form.identity_value.trim().toUpperCase();
    } else {
      body.ssn = form.identity_value.replace(/\D/g, "");
    }

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setSubmitError("Not authenticated. Please sign in and try again.");
        setIsSubmitting(false);
        return;
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (!baseUrl) {
        setSubmitError("API URL not configured. Please contact support.");
        setIsSubmitting(false);
        return;
      }

      const res = await apiFetch(`${baseUrl}/api/policy-holders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(
          errData?.detail?.[0]?.msg ??
            errData?.detail ??
            `Request failed (${res.status})`
        );
      }

      const data = (await res.json()) as {
        _id?: string;
        id?: string;
        status?: string;
        created_at?: string;
        updated_at?: string;
      };

      const id = data._id ?? data.id ?? generateSimpleInsurerId();

      saveSimpleInsurer({
        id,
        country: form.country as "IN" | "US",
        full_name: form.full_name.trim(),
        dob: form.dob.trim(),
        identity_document_type: form.country === "IN" ? "PAN" : "SSN",
        identity_value:
          form.country === "IN"
            ? form.identity_value.trim().toUpperCase()
            : form.identity_value.replace(/\D/g, ""),
        email: form.email.trim().toLowerCase(),
        status:
          data.status === "ACTIVE" || data.status === "VERIFIED"
            ? "verified"
            : "pending_verification",
        created_at: data.created_at ?? new Date().toISOString(),
        updated_at: data.updated_at ?? new Date().toISOString(),
      });

      setInsurerId(id);
      setIsComplete(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  /* ---- Success state ---- */
  if (isComplete) {
    return (
      <InsurerPageLayout>
        <div className="w-full max-w-6xl mx-auto px-6 py-8 md:py-12">
          <div className="w-full max-w-[600px] mx-auto space-y-6">
            <div>
              <h1 className="text-xl md:text-2xl font-semibold">
                Policy Holder KYC
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Claim pending? Don&apos;t wait. Get your funds now — bridge the
                gap until settlement. Minutes, not weeks.
              </p>
            </div>

            <Card className="border-emerald-500/20">
              <CardContent className="py-10 flex flex-col items-center text-center">
                <div className="size-14 rounded-2xl bg-emerald-500/15 flex items-center justify-center mb-4">
                  <CheckCircle2 className="size-7 text-emerald-500" />
                </div>
                <h2 className="text-lg font-semibold">Verification Submitted!</h2>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  {form.full_name} has been submitted. You&apos;ll be notified
                  once verification is complete — minutes, not weeks.
                </p>

                <div className="w-full max-w-xs mt-6 rounded-xl bg-muted/50 p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Reference ID
                    </span>
                    <span className="text-xs font-mono font-medium">
                      {insurerId}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Status</span>
                    <Badge
                      variant="secondary"
                      className="text-amber-500 text-[11px]"
                    >
                      Pending Verification
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Country</span>
                    <span className="text-xs">
                      {form.country === "IN" ? "India" : "United States"}
                    </span>
                  </div>
                </div>

                <Button
                  className="mt-6 w-full max-w-xs"
                  onClick={() => router.push("/dashboard")}
                >
                  Go to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </InsurerPageLayout>
    );
  }

  /* ---- Review state ---- */
  if (showReview) {
    return (
      <InsurerPageLayout>
        <div className="w-full max-w-6xl mx-auto px-6 py-8 md:py-12">
          <div className="w-full max-w-[600px] mx-auto space-y-6">
            <div>
              <h1 className="text-xl md:text-2xl font-semibold">
                Policy Holder KYC
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Review the details. Verify once, fund fast.
              </p>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Review Details</CardTitle>
                  <button
                    onClick={() => setShowReview(false)}
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <Pencil className="size-3" />
                    Edit
                  </button>
                </div>
                <CardDescription>
                  Please confirm all details are correct before submitting.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="rounded-xl bg-muted/50 p-4 space-y-3">
                  <ReviewRow
                    label="Country"
                    value={form.country === "IN" ? "India" : "United States"}
                  />
                  <ReviewRow label="Full Name" value={form.full_name} />
                  <ReviewRow label="Date of Birth" value={form.dob} />
                  <ReviewRow label="Email" value={form.email} />
                  <ReviewRow
                    label={form.country === "IN" ? "PAN" : "SSN"}
                    value={
                      form.country === "IN"
                        ? form.identity_value.toUpperCase()
                        : maskValue(form.identity_value.replace(/\D/g, ""))
                    }
                    mono
                  />
                </div>

                <div className="rounded-xl bg-muted/50 p-4">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    By submitting, you confirm that all the information provided
                    is accurate and complete. Sensitive data (PAN, SSN) will be
                    encrypted at rest and handled in accordance with applicable
                    data protection regulations.
                  </p>
                </div>

                {submitError && (
                  <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                    <p className="text-sm text-destructive">{submitError}</p>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowReview(false)}
                    disabled={isSubmitting}
                  >
                    <ArrowLeft className="size-4" />
                    Back to Edit
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="size-4" />
                    )}
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </InsurerPageLayout>
    );
  }

  /* ---- Main form ---- */
  return (
    <InsurerPageLayout>
      <div className="w-full max-w-6xl mx-auto px-6 py-8 md:py-12">
        <div className="w-full max-w-[600px] mx-auto space-y-6">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold">
              Policy Holder KYC
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Claim pending? Don&apos;t wait. Get your funds now — bridge the
              gap until settlement. Verify once, fund fast.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShieldCheck className="size-5 text-primary" />
                Your Details
              </CardTitle>
              <CardDescription>
                Enter your details for verification. No more waiting on slow
                payouts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Country */}
              <div className="space-y-2">
                <Label>Country</Label>
                <Select
                  value={form.country}
                  onValueChange={(v) => {
                    updateField("country", v as "IN" | "US");
                    updateField("identity_value", "");
                    touchField("country");
                  }}
                >
                  <SelectTrigger
                    className="w-full"
                    aria-invalid={!!getFieldError("country")}
                  >
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IN">India</SelectItem>
                    <SelectItem value="US">United States</SelectItem>
                  </SelectContent>
                </Select>
                {getFieldError("country") && (
                  <p className="text-xs text-destructive">
                    {getFieldError("country")}
                  </p>
                )}
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  placeholder="e.g. Jane Doe"
                  value={form.full_name}
                  onChange={(e) => updateField("full_name", e.target.value)}
                  onBlur={() => touchField("full_name")}
                  aria-invalid={!!getFieldError("full_name")}
                />
                {getFieldError("full_name") && (
                  <p className="text-xs text-destructive">
                    {getFieldError("full_name")}
                  </p>
                )}
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={form.dob}
                  onChange={(e) => updateField("dob", e.target.value)}
                  onBlur={() => touchField("dob")}
                  aria-invalid={!!getFieldError("dob")}
                />
                {getFieldError("dob") && (
                  <p className="text-xs text-destructive">
                    {getFieldError("dob")}
                  </p>
                )}
              </div>

              {/* Identity Document - PAN or SSN */}
              {form.country && (
                <div className="space-y-2">
                  <Label htmlFor="identity_value">
                    {form.country === "IN" ? "PAN" : "SSN"}
                  </Label>
                  <Input
                    id="identity_value"
                    placeholder={
                      form.country === "IN"
                        ? "e.g. ABCDE1234F"
                        : "e.g. 123-45-6789"
                    }
                    maxLength={form.country === "IN" ? 10 : 11}
                    value={form.identity_value}
                    onChange={(e) =>
                      updateField(
                        "identity_value",
                        form.country === "IN"
                          ? e.target.value.toUpperCase()
                          : e.target.value
                      )
                    }
                    onBlur={() => touchField("identity_value")}
                    aria-invalid={!!getFieldError("identity_value")}
                    className={form.country === "IN" ? "uppercase" : ""}
                  />
                  <p className="text-xs text-muted-foreground">
                    {form.country === "IN"
                      ? "10-character Permanent Account Number"
                      : "9-digit Social Security Number"}
                  </p>
                  {getFieldError("identity_value") && (
                    <p className="text-xs text-destructive">
                      {getFieldError("identity_value")}
                    </p>
                  )}
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="e.g. jane@example.com"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  onBlur={() => touchField("email")}
                  aria-invalid={!!getFieldError("email")}
                />
                {getFieldError("email") && (
                  <p className="text-xs text-destructive">
                    {getFieldError("email")}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push("/dashboard")}
                >
                  <ArrowLeft className="size-4" />
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleReview}
                  disabled={!form.country}
                >
                  Review &amp; Submit
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </InsurerPageLayout>
  );
}

/* ================================================================== */
/*  Layout with header and footer (matches landing page)               */
/* ================================================================== */

function InsurerPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ---- Top Banner ---- */}
      <div className="bg-gradient-to-r from-primary/90 via-primary to-primary/80 text-primary-foreground">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-center gap-2 text-sm font-medium">
          <Sparkles className="size-4 shrink-0" />
          <span>
            Your receivables. Your runway. — Built for vendors & policy holders
          </span>
        </div>
      </div>

      {/* ---- Header ---- */}
      <header className="flex items-center px-6 py-4 max-w-6xl mx-auto w-full">
        <AppLogo href="/" className="text-foreground" />
      </header>

      {/* ---- Main ---- */}
      <main className="flex-1 w-full flex flex-col">
        {children}
      </main>

      {/* ---- Footer ---- */}
      <footer className="border-t border-border bg-muted/30">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <AppLogo href="/" className="text-foreground" />
            <nav className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <Link
                href="/?auth=open"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/contact"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact
              </Link>
              <Link
                href="/privacy"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms
              </Link>
            </nav>
          </div>
          <p className="text-center sm:text-left text-xs text-muted-foreground mt-6">
            &copy; {new Date().getFullYear()} Nexum. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ================================================================== */
/*  Review helper component                                            */
/* ================================================================== */

function ReviewRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span
        className={cn("text-sm text-right truncate", mono && "font-mono")}
      >
        {value}
      </span>
    </div>
  );
}
