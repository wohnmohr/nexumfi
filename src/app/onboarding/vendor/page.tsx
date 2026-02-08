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
  Building2,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  Pencil,
  Sparkles,
} from "lucide-react";
import {
  COUNTRY_OPTIONS,
  INDIA_ENTITY_TYPES,
  US_ENTITY_TYPES,
  US_STATES,
  saveVendor,
  getEntityLabel,
  maskValue,
  type Country,
} from "@/lib/vendors";

/* ------------------------------------------------------------------ */
/*  Form state types                                                   */
/* ------------------------------------------------------------------ */

interface FormData {
  buyer_country: "" | Country;
  legal_name: string;
  contact_email: string;
  entity_type: string;
  /* India KYC */
  pan: string;
  cin_or_llpin: string;
  /* US KYC */
  ein: string;
  state_of_incorporation: string;
}

const INITIAL_FORM: FormData = {
  buyer_country: "",
  legal_name: "",
  contact_email: "",
  entity_type: "",
  pan: "",
  cin_or_llpin: "",
  ein: "",
  state_of_incorporation: "",
};

/* ---- CIN/LLPIN is only required for company & llp ---- */
function needsCinOrLlpin(entityType: string): boolean {
  return entityType === "company" || entityType === "llp";
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function VendorOnboardingPage() {
  const router = useRouter();

  /* form state */
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  /* submission state */
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [vendorId, setVendorId] = useState("");
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
      case "buyer_country":
        return !v ? "Please select a country" : null;
      case "legal_name":
        return !v?.trim() ? "Legal name is required" : null;
      case "contact_email":
        return !v?.trim()
          ? "Contact email is required"
          : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
            ? "Enter a valid email address"
            : null;
      case "entity_type":
        return !v ? "Please select an entity type" : null;
      case "pan":
        return !v?.trim()
          ? "PAN is required"
          : !/^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(v.trim())
            ? "Enter a valid 10-character PAN"
            : null;
      case "cin_or_llpin":
        if (!needsCinOrLlpin(form.entity_type)) return null;
        return !v?.trim() ? "CIN / LLPIN is required for this entity type" : null;
      case "ein":
        return !v?.trim()
          ? "EIN is required"
          : !/^\d{2}-?\d{7}$/.test(v.trim())
            ? "Enter a valid EIN (e.g. 12-3456789)"
            : null;
      case "state_of_incorporation":
        return !v ? "State of incorporation is required" : null;
      default:
        return null;
    }
  }

  function isFormValid(): boolean {
    if (
      !form.buyer_country ||
      !form.legal_name.trim() ||
      !form.contact_email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_email.trim()) ||
      !form.entity_type
    )
      return false;

    if (form.buyer_country === "IN") {
      if (!form.pan.trim() || !/^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(form.pan.trim()))
        return false;
      if (needsCinOrLlpin(form.entity_type) && !form.cin_or_llpin.trim())
        return false;
    }

    if (form.buyer_country === "US") {
      if (!form.ein.trim() || !/^\d{2}-?\d{7}$/.test(form.ein.trim()))
        return false;
      if (!form.state_of_incorporation) return false;
    }

    return true;
  }

  /* ---- review & submit ---- */

  function handleReview() {
    const allKeys = [
      "buyer_country",
      "legal_name",
      "contact_email",
      "entity_type",
      ...(form.buyer_country === "IN"
        ? ["pan", ...(needsCinOrLlpin(form.entity_type) ? ["cin_or_llpin"] : [])]
        : []),
      ...(form.buyer_country === "US" ? ["ein", "state_of_incorporation"] : []),
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

    /* Build the request body matching the API schema */
    const body: Record<string, unknown> = {
      buyer_country: form.buyer_country,
      legal_name: form.legal_name.trim(),
      contact_email: form.contact_email.trim().toLowerCase(),
    };

    if (form.buyer_country === "IN") {
      body.kyc_india = {
        entity_type: form.entity_type,
        pan: form.pan.trim().toUpperCase(),
        ...(needsCinOrLlpin(form.entity_type) && form.cin_or_llpin.trim()
          ? { cin_or_llpin: form.cin_or_llpin.trim().toUpperCase() }
          : {}),
      };
    }

    if (form.buyer_country === "US") {
      body.kyc_us = {
        entity_type: form.entity_type,
        ein: form.ein.trim(),
        state_of_incorporation: form.state_of_incorporation,
      };
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
      const res = await apiFetch(`${baseUrl}/api/vendors`, {
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
          errData?.detail?.[0]?.msg ?? errData?.detail ?? `Request failed (${res.status})`
        );
      }

      const data = await res.json();

      /* Save to localStorage for the profile page */
      saveVendor({
        id: data._id ?? data.id,
        buyer_country: form.buyer_country as Country,
        legal_name: form.legal_name.trim(),
        contact_email: form.contact_email.trim().toLowerCase(),
        ...(form.buyer_country === "IN" && {
          kyc_india: {
            entity_type: form.entity_type,
            pan: form.pan.trim().toUpperCase(),
            ...(needsCinOrLlpin(form.entity_type) && form.cin_or_llpin.trim()
              ? { cin_or_llpin: form.cin_or_llpin.trim().toUpperCase() }
              : {}),
          },
        }),
        ...(form.buyer_country === "US" && {
          kyc_us: {
            entity_type: form.entity_type,
            ein: form.ein.trim(),
            state_of_incorporation: form.state_of_incorporation,
          },
        }),
        status: data.kyc_status === "VERIFIED" ? "verified" : "pending_verification",
        created_at: data.created_at ?? new Date().toISOString(),
        updated_at: data.updated_at ?? new Date().toISOString(),
      });

      setVendorId(data._id ?? data.id ?? "");
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
      <VendorPageLayout>
      <div className="w-full max-w-6xl mx-auto px-6 py-8 md:py-12">
        <div className="w-full max-w-[600px] mx-auto space-y-6">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold">
              Add Company
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Turn invoices into cash. Add companies to get credit against what
              you&apos;re owed — minutes, not weeks.
            </p>
          </div>

          <Card className="border-emerald-500/20">
            <CardContent className="py-10 flex flex-col items-center text-center">
              <div className="size-14 rounded-2xl bg-emerald-500/15 flex items-center justify-center mb-4">
                <CheckCircle2 className="size-7 text-emerald-500" />
              </div>
              <h2 className="text-lg font-semibold">Company Added!</h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                {form.legal_name} has been submitted. You&apos;ll be notified once
                verification is complete — minutes, not weeks.
              </p>

              <div className="w-full max-w-xs mt-6 rounded-xl bg-muted/50 p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Vendor ID
                  </span>
                  <span className="text-xs font-mono font-medium">
                    {vendorId}
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
                    {form.buyer_country === "IN" ? "India" : "United States"}
                  </span>
                </div>
              </div>

              <Button
                className="mt-6 w-full max-w-xs"
                onClick={() => router.push("/dashboard/profile")}
              >
                View Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      </VendorPageLayout>
    );
  }

  /* ---- Review state ---- */
  if (showReview) {
    return (
      <VendorPageLayout>
      <div className="w-full max-w-6xl mx-auto px-6 py-8 md:py-12">
        <div className="w-full max-w-[600px] mx-auto space-y-6">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold">
              Add Company
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Review the company details. Transparent. No hidden fees.
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
                  value={form.buyer_country === "IN" ? "India" : "United States"}
                />
                <ReviewRow label="Legal Name" value={form.legal_name} />
                <ReviewRow label="Contact Email" value={form.contact_email} />
                <ReviewRow
                  label="Entity Type"
                  value={getEntityLabel(
                    form.buyer_country as Country,
                    form.entity_type
                  )}
                />

                <div className="border-t border-border pt-3 space-y-3">
                  {form.buyer_country === "IN" && (
                    <>
                      <ReviewRow
                        label="PAN"
                        value={form.pan.toUpperCase()}
                        mono
                      />
                      {needsCinOrLlpin(form.entity_type) &&
                        form.cin_or_llpin && (
                          <ReviewRow
                            label="CIN / LLPIN"
                            value={form.cin_or_llpin.toUpperCase()}
                            mono
                          />
                        )}
                    </>
                  )}

                  {form.buyer_country === "US" && (
                    <>
                      <ReviewRow
                        label="EIN"
                        value={maskValue(form.ein.replace(/\D/g, ""))}
                        mono
                      />
                      <ReviewRow
                        label="State of Incorporation"
                        value={form.state_of_incorporation}
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Disclaimer */}
              <div className="rounded-xl bg-muted/50 p-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  By submitting, you confirm that all the information provided
                  is accurate and complete. Sensitive data (PAN, EIN) will be
                  encrypted at rest and handled in accordance with applicable
                  data protection regulations.
                </p>
              </div>

              {/* Error message */}
              {submitError && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                  <p className="text-sm text-destructive">{submitError}</p>
                </div>
              )}

              {/* Actions */}
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
                  {isSubmitting ? "Submitting..." : "Submit Company"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </VendorPageLayout>
    );
  }

  /* ---- Main form ---- */
  return (
    <VendorPageLayout>
    <div className="w-full max-w-6xl mx-auto px-6 py-8 md:py-12">
      <div className="w-full max-w-[600px] mx-auto space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">Add Company</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Turn invoices into cash. Add companies to get credit against what
            you&apos;re owed — minutes, not weeks.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="size-5 text-primary" />
              Company Details
            </CardTitle>
            <CardDescription>
              Enter the company&apos;s business details. Same-day credit, no more
              chasing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Country */}
            <div className="space-y-2">
              <Label>Country</Label>
              <Select
                value={form.buyer_country}
                onValueChange={(v) => {
                  updateField("buyer_country", v as Country);
                  updateField("entity_type", "");
                  /* Reset KYC fields on country change */
                  updateField("pan", "");
                  updateField("cin_or_llpin", "");
                  updateField("ein", "");
                  updateField("state_of_incorporation", "");
                  touchField("buyer_country");
                }}
              >
                <SelectTrigger
                  className="w-full"
                  aria-invalid={!!getFieldError("buyer_country")}
                >
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRY_OPTIONS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getFieldError("buyer_country") && (
                <p className="text-xs text-destructive">
                  {getFieldError("buyer_country")}
                </p>
              )}
            </div>

            {/* Legal Name */}
            <div className="space-y-2">
              <Label htmlFor="legal_name">Legal Name</Label>
              <Input
                id="legal_name"
                placeholder="e.g. Acme Technologies Pvt. Ltd."
                value={form.legal_name}
                onChange={(e) => updateField("legal_name", e.target.value)}
                onBlur={() => touchField("legal_name")}
                aria-invalid={!!getFieldError("legal_name")}
              />
              {getFieldError("legal_name") && (
                <p className="text-xs text-destructive">
                  {getFieldError("legal_name")}
                </p>
              )}
            </div>

            {/* Contact Email */}
            <div className="space-y-2">
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input
                id="contact_email"
                type="email"
                placeholder="e.g. accounts@company.com"
                value={form.contact_email}
                onChange={(e) => updateField("contact_email", e.target.value)}
                onBlur={() => touchField("contact_email")}
                aria-invalid={!!getFieldError("contact_email")}
              />
              {getFieldError("contact_email") && (
                <p className="text-xs text-destructive">
                  {getFieldError("contact_email")}
                </p>
              )}
            </div>

            {/* Entity Type — only shown after country is selected */}
            {form.buyer_country && (
              <div className="space-y-2">
                <Label>Entity Type</Label>
                <Select
                  value={form.entity_type}
                  onValueChange={(v) => {
                    updateField("entity_type", v);
                    touchField("entity_type");
                    /* Reset CIN/LLPIN if entity type no longer needs it */
                    if (!needsCinOrLlpin(v)) {
                      updateField("cin_or_llpin", "");
                    }
                  }}
                >
                  <SelectTrigger
                    className="w-full"
                    aria-invalid={!!getFieldError("entity_type")}
                  >
                    <SelectValue placeholder="Select entity type" />
                  </SelectTrigger>
                  <SelectContent>
                    {(form.buyer_country === "IN"
                      ? INDIA_ENTITY_TYPES
                      : US_ENTITY_TYPES
                    ).map((e) => (
                      <SelectItem key={e.value} value={e.value}>
                        {e.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {getFieldError("entity_type") && (
                  <p className="text-xs text-destructive">
                    {getFieldError("entity_type")}
                  </p>
                )}
              </div>
            )}

            {/* ---- India KYC fields ---- */}
            {form.buyer_country === "IN" && form.entity_type && (
              <div className="space-y-5 rounded-xl border border-border bg-muted/20 p-4">
                <p className="text-sm font-medium text-foreground">
                  KYC Details
                </p>

                {/* PAN */}
                <div className="space-y-2">
                  <Label htmlFor="pan">PAN</Label>
                  <Input
                    id="pan"
                    placeholder="e.g. ABCDE1234F"
                    maxLength={10}
                    value={form.pan}
                    onChange={(e) =>
                      updateField("pan", e.target.value.toUpperCase())
                    }
                    onBlur={() => touchField("pan")}
                    aria-invalid={!!getFieldError("pan")}
                    className="uppercase"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    10-character Permanent Account Number
                  </p>
                  {getFieldError("pan") && (
                    <p className="text-xs text-destructive">
                      {getFieldError("pan")}
                    </p>
                  )}
                </div>

                {/* CIN / LLPIN — only for company or llp */}
                {needsCinOrLlpin(form.entity_type) && (
                  <div className="space-y-2">
                    <Label htmlFor="cin_or_llpin">CIN / LLPIN</Label>
                    <Input
                      id="cin_or_llpin"
                      placeholder={
                        form.entity_type === "company"
                          ? "e.g. U74999MH2018PTC123456"
                          : "e.g. AAN-1234"
                      }
                      value={form.cin_or_llpin}
                      onChange={(e) =>
                        updateField(
                          "cin_or_llpin",
                          e.target.value.toUpperCase()
                        )
                      }
                      onBlur={() => touchField("cin_or_llpin")}
                      aria-invalid={!!getFieldError("cin_or_llpin")}
                      className="uppercase"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      {form.entity_type === "company"
                        ? "Corporate Identification Number issued by MCA"
                        : "LLP Identification Number"}
                    </p>
                    {getFieldError("cin_or_llpin") && (
                      <p className="text-xs text-destructive">
                        {getFieldError("cin_or_llpin")}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ---- US KYC fields ---- */}
            {form.buyer_country === "US" && form.entity_type && (
              <div className="space-y-5 rounded-xl border border-border bg-muted/20 p-4">
                <p className="text-sm font-medium text-foreground">
                  KYC Details
                </p>

                {/* EIN */}
                <div className="space-y-2">
                  <Label htmlFor="ein">EIN</Label>
                  <Input
                    id="ein"
                    placeholder="e.g. 12-3456789"
                    maxLength={10}
                    value={form.ein}
                    onChange={(e) => updateField("ein", e.target.value)}
                    onBlur={() => touchField("ein")}
                    aria-invalid={!!getFieldError("ein")}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    9-digit Employer Identification Number from the IRS
                  </p>
                  {getFieldError("ein") && (
                    <p className="text-xs text-destructive">
                      {getFieldError("ein")}
                    </p>
                  )}
                </div>

                {/* State of Incorporation */}
                <div className="space-y-2">
                  <Label>State of Incorporation</Label>
                  <Select
                    value={form.state_of_incorporation}
                    onValueChange={(v) => {
                      updateField("state_of_incorporation", v);
                      touchField("state_of_incorporation");
                    }}
                  >
                    <SelectTrigger
                      className="w-full"
                      aria-invalid={
                        !!getFieldError("state_of_incorporation")
                      }
                    >
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="N/A">N/A</SelectItem>
                      {US_STATES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {getFieldError("state_of_incorporation") && (
                    <p className="text-xs text-destructive">
                      {getFieldError("state_of_incorporation")}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Submit */}
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
                disabled={!form.buyer_country}
              >
                Review &amp; Submit
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </VendorPageLayout>
  );
}

/* ================================================================== */
/*  Layout with header and footer (matches landing page)               */
/* ================================================================== */

function VendorPageLayout({ children }: { children: React.ReactNode }) {
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
              <Link href="/?auth=open" className="text-muted-foreground hover:text-foreground transition-colors">
                Sign in
              </Link>
              <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
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
