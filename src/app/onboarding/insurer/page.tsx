"use client";

import { useState, Fragment } from "react";
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
import { cn } from "@/lib/utils";
import {
  Building2,
  ShieldCheck,
  MapPin,
  Landmark,
  Users,
  Eye,
  Check,
  ArrowLeft,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Pencil,
} from "lucide-react";
import {
  INDIA_INSURER_TYPES,
  US_INSURER_TYPES,
  generateInsurerId,
  saveInsurer,
  getInsurerTypeLabel,
  maskValue,
  type Insurer,
} from "@/lib/insurers";
import { INDIA_STATES, US_STATES } from "@/lib/vendors";

/* ------------------------------------------------------------------ */
/*  Steps                                                              */
/* ------------------------------------------------------------------ */

const STEPS = [
  { key: "company", label: "Company", icon: Building2 },
  { key: "license", label: "License", icon: ShieldCheck },
  { key: "address", label: "Address", icon: MapPin },
  { key: "bank", label: "Bank", icon: Landmark },
  { key: "personnel", label: "Personnel", icon: Users },
  { key: "review", label: "Review", icon: Eye },
] as const;

/* ------------------------------------------------------------------ */
/*  Form state types                                                   */
/* ------------------------------------------------------------------ */

interface FormData {
  /* Step 1 — Company Information */
  company_name: string;
  country: "" | "IN" | "US";
  insurer_type: string;
  /* Step 2 — India regulatory */
  irdai_registration_number: string;
  cin: string;
  pan: string;
  gstin: string;
  /* Step 2 — US regulatory */
  naic_code: string;
  state_of_domicile: string;
  ein: string;
  /* Step 3 — Address */
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  /* Step 4 — India bank */
  india_ifsc: string;
  india_account_holder: string;
  india_account_number: string;
  india_account_confirm: string;
  /* Step 4 — US bank */
  us_routing_number: string;
  us_account_holder: string;
  us_account_number: string;
  us_account_confirm: string;
  /* Step 5 — Key Personnel: CEO / Managing Director */
  ceo_name: string;
  ceo_email: string;
  ceo_phone: string;
  /* Step 5 — Key Personnel: Compliance Officer */
  compliance_name: string;
  compliance_email: string;
  compliance_phone: string;
}

const INITIAL_FORM: FormData = {
  company_name: "",
  country: "",
  insurer_type: "",
  irdai_registration_number: "",
  cin: "",
  pan: "",
  gstin: "",
  naic_code: "",
  state_of_domicile: "",
  ein: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  postal_code: "",
  india_ifsc: "",
  india_account_holder: "",
  india_account_number: "",
  india_account_confirm: "",
  us_routing_number: "",
  us_account_holder: "",
  us_account_number: "",
  us_account_confirm: "",
  ceo_name: "",
  ceo_email: "",
  ceo_phone: "",
  compliance_name: "",
  compliance_email: "",
  compliance_phone: "",
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function InsurerOnboardingPage() {
  const router = useRouter();

  /* form state */
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  /* wizard state */
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [insurerId, setInsurerId] = useState("");

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
      case "company_name":
        return !v?.trim() ? "Company name is required" : null;
      case "country":
        return !v ? "Please select a country" : null;
      case "insurer_type":
        return !v ? "Please select an insurer type" : null;
      /* India regulatory */
      case "irdai_registration_number":
        return !v?.trim() ? "IRDAI registration number is required" : null;
      case "pan":
        return !v?.trim()
          ? "PAN is required"
          : !/^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(v.trim())
            ? "Enter a valid 10-character PAN (e.g. AAAAA0000A)"
            : null;
      /* US regulatory */
      case "naic_code":
        return !v?.trim() ? "NAIC company code is required" : null;
      case "ein":
        return !v?.trim()
          ? "EIN is required"
          : !/^\d{9}$/.test(v.replace(/\D/g, ""))
            ? "Enter a valid 9-digit EIN"
            : null;
      /* Address */
      case "address_line1":
        return !v?.trim() ? "Address line 1 is required" : null;
      case "city":
        return !v?.trim() ? "City is required" : null;
      case "state":
        return !v?.trim() ? "State is required" : null;
      case "postal_code":
        return !v?.trim() ? "Postal code is required" : null;
      /* India bank */
      case "india_ifsc":
        return !v?.trim()
          ? "IFSC code is required"
          : !/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(v.trim())
            ? "Enter a valid 11-character IFSC"
            : null;
      case "india_account_holder":
        return !v?.trim() ? "Account holder name is required" : null;
      case "india_account_number":
        return !v?.trim() ? "Account number is required" : null;
      case "india_account_confirm":
        return !v?.trim()
          ? "Please confirm account number"
          : v !== form.india_account_number
            ? "Account numbers do not match"
            : null;
      /* US bank */
      case "us_routing_number":
        return !v?.trim()
          ? "Routing number is required"
          : !/^\d{9}$/.test(v.replace(/\D/g, ""))
            ? "Enter a valid 9-digit routing number"
            : null;
      case "us_account_holder":
        return !v?.trim() ? "Account holder name is required" : null;
      case "us_account_number":
        return !v?.trim() ? "Account number is required" : null;
      case "us_account_confirm":
        return !v?.trim()
          ? "Please confirm account number"
          : v !== form.us_account_number
            ? "Account numbers do not match"
            : null;
      /* Key Personnel */
      case "ceo_name":
        return !v?.trim() ? "CEO / Managing Director name is required" : null;
      case "ceo_email":
        return !v?.trim()
          ? "Email is required"
          : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
            ? "Enter a valid email address"
            : null;
      case "compliance_name":
        return !v?.trim() ? "Compliance Officer name is required" : null;
      case "compliance_email":
        return !v?.trim()
          ? "Email is required"
          : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
            ? "Enter a valid email address"
            : null;
      default:
        return null;
    }
  }

  function validateStep(step: number): boolean {
    switch (step) {
      case 0:
        return (
          !!form.company_name.trim() && !!form.country && !!form.insurer_type
        );
      case 1:
        if (form.country === "IN")
          return (
            !!form.irdai_registration_number.trim() &&
            !!form.pan.trim() &&
            /^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(form.pan.trim())
          );
        if (form.country === "US")
          return (
            !!form.naic_code.trim() &&
            !!form.ein.trim() &&
            /^\d{9}$/.test(form.ein.replace(/\D/g, ""))
          );
        return false;
      case 2:
        return (
          !!form.address_line1.trim() &&
          !!form.city.trim() &&
          !!form.state.trim() &&
          !!form.postal_code.trim()
        );
      case 3:
        if (form.country === "IN")
          return (
            !!form.india_ifsc.trim() &&
            /^[A-Z]{4}0[A-Z0-9]{6}$/i.test(form.india_ifsc.trim()) &&
            !!form.india_account_holder.trim() &&
            !!form.india_account_number.trim() &&
            form.india_account_number === form.india_account_confirm
          );
        if (form.country === "US")
          return (
            !!form.us_routing_number.trim() &&
            /^\d{9}$/.test(form.us_routing_number.replace(/\D/g, "")) &&
            !!form.us_account_holder.trim() &&
            !!form.us_account_number.trim() &&
            form.us_account_number === form.us_account_confirm
          );
        return false;
      case 4:
        return (
          !!form.ceo_name.trim() &&
          !!form.ceo_email.trim() &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.ceo_email.trim()) &&
          !!form.compliance_name.trim() &&
          !!form.compliance_email.trim() &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.compliance_email.trim())
        );
      case 5:
        return true;
      default:
        return false;
    }
  }

  function touchAllForStep(step: number) {
    const keys: Record<number, string[]> = {
      0: ["company_name", "country", "insurer_type"],
      1:
        form.country === "IN"
          ? ["irdai_registration_number", "pan"]
          : ["naic_code", "ein"],
      2: ["address_line1", "city", "state", "postal_code"],
      3:
        form.country === "IN"
          ? [
              "india_ifsc",
              "india_account_holder",
              "india_account_number",
              "india_account_confirm",
            ]
          : [
              "us_routing_number",
              "us_account_holder",
              "us_account_number",
              "us_account_confirm",
            ],
      4: [
        "ceo_name",
        "ceo_email",
        "compliance_name",
        "compliance_email",
      ],
    };
    touchAll(keys[step] || []);
  }

  /* ---- navigation ---- */

  function handleNext() {
    touchAllForStep(currentStep);
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleBack() {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goToStep(step: number) {
    if (step < currentStep) {
      setCurrentStep(step);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  /* ---- submit ---- */

  async function handleSubmit() {
    setIsSubmitting(true);

    /* simulate network request */
    await new Promise((r) => setTimeout(r, 2000));

    const id = generateInsurerId();
    setInsurerId(id);

    const insurer: Insurer = {
      id,
      company_name: form.company_name.trim(),
      country: form.country as "IN" | "US",
      insurer_type: form.insurer_type,
      ...(form.country === "IN" && {
        irdai_registration_number: form.irdai_registration_number.trim(),
        cin: form.cin.trim() || undefined,
        pan: form.pan.trim().toUpperCase(),
        gstin: form.gstin.trim().toUpperCase() || undefined,
      }),
      ...(form.country === "US" && {
        naic_code: form.naic_code.trim(),
        state_of_domicile: form.state_of_domicile || undefined,
        ein: form.ein.replace(/\D/g, ""),
      }),
      address: {
        line1: form.address_line1.trim(),
        line2: form.address_line2.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        postal_code: form.postal_code.trim(),
        country: form.country === "IN" ? "India" : "United States",
      },
      ...(form.country === "IN" && {
        india_bank: {
          ifsc: form.india_ifsc.trim().toUpperCase(),
          account_holder_name: form.india_account_holder.trim(),
          account_number: form.india_account_number.trim(),
        },
      }),
      ...(form.country === "US" && {
        us_bank: {
          routing_number: form.us_routing_number.replace(/\D/g, ""),
          account_holder_name: form.us_account_holder.trim(),
          account_number: form.us_account_number.trim(),
        },
      }),
      key_personnel: [
        {
          name: form.ceo_name.trim(),
          designation: "CEO / Managing Director",
          email: form.ceo_email.trim(),
          phone: form.ceo_phone.trim(),
        },
        {
          name: form.compliance_name.trim(),
          designation: "Compliance Officer",
          email: form.compliance_email.trim(),
          phone: form.compliance_phone.trim(),
        },
      ],
      status: "pending_verification",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    saveInsurer(insurer);
    setIsSubmitting(false);
    setIsComplete(true);
  }

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  /* ---- Success state ---- */
  if (isComplete) {
    return (
      <div className="min-h-screen flex flex-col items-center px-4 py-8 md:py-12">
        <div className="w-full max-w-3xl space-y-6">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">
            Insurer Onboarding
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Complete your insurance company verification to get started.
          </p>
        </div>

        <Card className="border-emerald-500/20">
          <CardContent className="py-10 flex flex-col items-center text-center">
            <div className="size-14 rounded-2xl bg-emerald-500/15 flex items-center justify-center mb-4">
              <CheckCircle2 className="size-7 text-emerald-500" />
            </div>
            <h2 className="text-lg font-semibold">Onboarding Complete!</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              {form.company_name} has been submitted for KYC verification. You
              will be notified once the verification is complete.
            </p>

            <div className="w-full max-w-xs mt-6 rounded-xl bg-muted/50 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Insurer ID
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
              className="mt-6 w-full"
              onClick={() => router.push("/dashboard")}
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
      </div>
    );
  }

  /* ---- Main form ---- */
  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8 md:py-12">
      <div className="w-full max-w-3xl space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl md:text-2xl font-semibold">
          Insurer Onboarding
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Complete your insurance company verification to get started.
        </p>
      </div>

      {/* ============================================================ */}
      {/*  Step indicator                                               */}
      {/* ============================================================ */}

      {/* Mobile */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            {STEPS[currentStep].label}
          </span>
          <span className="text-xs text-muted-foreground">
            Step {currentStep + 1} of {STEPS.length}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{
              width: `${((currentStep + 1) / STEPS.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:flex items-center">
        {STEPS.map((step, i) => {
          const isCompleted = i < currentStep;
          const isCurrent = i === currentStep;

          return (
            <Fragment key={step.key}>
              <button
                onClick={() => goToStep(i)}
                disabled={i >= currentStep}
                className={cn(
                  "flex flex-col items-center gap-1.5 group",
                  i < currentStep && "cursor-pointer"
                )}
              >
                <div
                  className={cn(
                    "size-9 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                    isCompleted && "bg-emerald-500/15 text-emerald-500",
                    isCurrent &&
                      "bg-primary/15 text-primary ring-2 ring-primary/30",
                    !isCompleted &&
                      !isCurrent &&
                      "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? <Check className="size-4" /> : i + 1}
                </div>
                <span
                  className={cn(
                    "text-[11px] font-medium transition-colors",
                    isCurrent
                      ? "text-primary"
                      : isCompleted
                        ? "text-foreground"
                        : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 mx-2 rounded-full transition-colors duration-300",
                    i < currentStep ? "bg-emerald-500/30" : "bg-border"
                  )}
                />
              )}
            </Fragment>
          );
        })}
      </div>

      {/* ============================================================ */}
      {/*  Step content                                                 */}
      {/* ============================================================ */}

      <div key={currentStep} className="animate-in fade-in-0 duration-300">
        {/* ---------------------------------------------------------- */}
        {/*  STEP 1: Company Information                                */}
        {/* ---------------------------------------------------------- */}
        {currentStep === 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="size-5 text-primary" />
                Company Information
              </CardTitle>
              <CardDescription>
                Enter your insurance company&apos;s basic details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Company Name */}
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  placeholder="e.g. National Insurance Co. Ltd."
                  value={form.company_name}
                  onChange={(e) => updateField("company_name", e.target.value)}
                  onBlur={() => touchField("company_name")}
                  aria-invalid={!!getFieldError("company_name")}
                />
                {getFieldError("company_name") && (
                  <p className="text-xs text-destructive">
                    {getFieldError("company_name")}
                  </p>
                )}
              </div>

              {/* Country */}
              <div className="space-y-2">
                <Label>Country</Label>
                <Select
                  value={form.country}
                  onValueChange={(v) => {
                    updateField("country", v as "IN" | "US");
                    updateField("insurer_type", "");
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

              {/* Insurer Type — only shown after country is selected */}
              {form.country && (
                <div className="space-y-2">
                  <Label>Insurer Type</Label>
                  <Select
                    value={form.insurer_type}
                    onValueChange={(v) => {
                      updateField("insurer_type", v);
                      touchField("insurer_type");
                    }}
                  >
                    <SelectTrigger
                      className="w-full"
                      aria-invalid={!!getFieldError("insurer_type")}
                    >
                      <SelectValue placeholder="Select insurer type" />
                    </SelectTrigger>
                    <SelectContent>
                      {(form.country === "IN"
                        ? INDIA_INSURER_TYPES
                        : US_INSURER_TYPES
                      ).map((e) => (
                        <SelectItem key={e.value} value={e.value}>
                          {e.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {getFieldError("insurer_type") && (
                    <p className="text-xs text-destructive">
                      {getFieldError("insurer_type")}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ---------------------------------------------------------- */}
        {/*  STEP 2: Licensing & Regulatory                             */}
        {/* ---------------------------------------------------------- */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShieldCheck className="size-5 text-primary" />
                Licensing &amp; Regulatory
              </CardTitle>
              <CardDescription>
                {form.country === "IN"
                  ? "Provide IRDAI registration and tax identifiers as per Indian regulations."
                  : "Provide NAIC code and federal tax details."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {form.country === "IN" && (
                <>
                  {/* IRDAI Registration Number */}
                  <div className="space-y-2">
                    <Label htmlFor="irdai">
                      IRDAI Registration Number{" "}
                      <span className="text-xs text-muted-foreground">
                        (required)
                      </span>
                    </Label>
                    <Input
                      id="irdai"
                      placeholder="e.g. 001"
                      value={form.irdai_registration_number}
                      onChange={(e) =>
                        updateField(
                          "irdai_registration_number",
                          e.target.value
                        )
                      }
                      onBlur={() => touchField("irdai_registration_number")}
                      aria-invalid={
                        !!getFieldError("irdai_registration_number")
                      }
                    />
                    {getFieldError("irdai_registration_number") && (
                      <p className="text-xs text-destructive">
                        {getFieldError("irdai_registration_number")}
                      </p>
                    )}
                  </div>

                  {/* CIN */}
                  <div className="space-y-2">
                    <Label htmlFor="cin">
                      CIN{" "}
                      <span className="text-xs text-muted-foreground">
                        (optional)
                      </span>
                    </Label>
                    <Input
                      id="cin"
                      placeholder="Corporate Identification Number"
                      value={form.cin}
                      onChange={(e) =>
                        updateField("cin", e.target.value.toUpperCase())
                      }
                      className="uppercase"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Corporate Identification Number issued by MCA
                    </p>
                  </div>

                  {/* PAN */}
                  <div className="space-y-2">
                    <Label htmlFor="pan">
                      PAN{" "}
                      <span className="text-xs text-muted-foreground">
                        (required)
                      </span>
                    </Label>
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
                      10-character Permanent Account Number (AAAAA0000A)
                    </p>
                    {getFieldError("pan") && (
                      <p className="text-xs text-destructive">
                        {getFieldError("pan")}
                      </p>
                    )}
                  </div>

                  {/* GSTIN */}
                  <div className="space-y-2">
                    <Label htmlFor="gstin">
                      GSTIN{" "}
                      <span className="text-xs text-muted-foreground">
                        (optional)
                      </span>
                    </Label>
                    <Input
                      id="gstin"
                      placeholder="e.g. 27ABCDE1234F1Z5"
                      maxLength={15}
                      value={form.gstin}
                      onChange={(e) =>
                        updateField("gstin", e.target.value.toUpperCase())
                      }
                      className="uppercase"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      15-character GST Identification Number
                    </p>
                  </div>
                </>
              )}

              {form.country === "US" && (
                <>
                  {/* NAIC Company Code */}
                  <div className="space-y-2">
                    <Label htmlFor="naic">
                      NAIC Company Code{" "}
                      <span className="text-xs text-muted-foreground">
                        (required)
                      </span>
                    </Label>
                    <Input
                      id="naic"
                      placeholder="e.g. 12345"
                      value={form.naic_code}
                      onChange={(e) =>
                        updateField("naic_code", e.target.value)
                      }
                      onBlur={() => touchField("naic_code")}
                      aria-invalid={!!getFieldError("naic_code")}
                    />
                    {getFieldError("naic_code") && (
                      <p className="text-xs text-destructive">
                        {getFieldError("naic_code")}
                      </p>
                    )}
                  </div>

                  {/* State of Domicile */}
                  <div className="space-y-2">
                    <Label>
                      State of Domicile{" "}
                      <span className="text-xs text-muted-foreground">
                        (optional)
                      </span>
                    </Label>
                    <Select
                      value={form.state_of_domicile}
                      onValueChange={(v) =>
                        updateField("state_of_domicile", v)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {US_STATES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* EIN */}
                  <div className="space-y-2">
                    <Label htmlFor="ein">
                      EIN{" "}
                      <span className="text-xs text-muted-foreground">
                        (required)
                      </span>
                    </Label>
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
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* ---------------------------------------------------------- */}
        {/*  STEP 3: Office Address                                     */}
        {/* ---------------------------------------------------------- */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="size-5 text-primary" />
                Office Address
              </CardTitle>
              <CardDescription>
                The principal office address for verification.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Line 1 */}
              <div className="space-y-2">
                <Label htmlFor="addr1">Address Line 1</Label>
                <Input
                  id="addr1"
                  placeholder="Street address, building name"
                  value={form.address_line1}
                  onChange={(e) =>
                    updateField("address_line1", e.target.value)
                  }
                  onBlur={() => touchField("address_line1")}
                  aria-invalid={!!getFieldError("address_line1")}
                />
                {getFieldError("address_line1") && (
                  <p className="text-xs text-destructive">
                    {getFieldError("address_line1")}
                  </p>
                )}
              </div>

              {/* Line 2 */}
              <div className="space-y-2">
                <Label htmlFor="addr2">
                  Address Line 2{" "}
                  <span className="text-xs text-muted-foreground">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="addr2"
                  placeholder="Suite, floor, unit"
                  value={form.address_line2}
                  onChange={(e) =>
                    updateField("address_line2", e.target.value)
                  }
                />
              </div>

              {/* City + State */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="e.g. Mumbai"
                    value={form.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    onBlur={() => touchField("city")}
                    aria-invalid={!!getFieldError("city")}
                  />
                  {getFieldError("city") && (
                    <p className="text-xs text-destructive">
                      {getFieldError("city")}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>State</Label>
                  <Select
                    value={form.state}
                    onValueChange={(v) => {
                      updateField("state", v);
                      touchField("state");
                    }}
                  >
                    <SelectTrigger
                      className="w-full"
                      aria-invalid={!!getFieldError("state")}
                    >
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {(form.country === "IN" ? INDIA_STATES : US_STATES).map(
                        (s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  {getFieldError("state") && (
                    <p className="text-xs text-destructive">
                      {getFieldError("state")}
                    </p>
                  )}
                </div>
              </div>

              {/* Postal code + Country */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postal">Postal Code</Label>
                  <Input
                    id="postal"
                    placeholder={
                      form.country === "IN" ? "e.g. 400001" : "e.g. 10001"
                    }
                    value={form.postal_code}
                    onChange={(e) =>
                      updateField("postal_code", e.target.value)
                    }
                    onBlur={() => touchField("postal_code")}
                    aria-invalid={!!getFieldError("postal_code")}
                  />
                  {getFieldError("postal_code") && (
                    <p className="text-xs text-destructive">
                      {getFieldError("postal_code")}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input
                    value={
                      form.country === "IN" ? "India" : "United States"
                    }
                    disabled
                    className="opacity-60"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ---------------------------------------------------------- */}
        {/*  STEP 4: Bank Account                                       */}
        {/* ---------------------------------------------------------- */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Landmark className="size-5 text-primary" />
                Bank Account
              </CardTitle>
              <CardDescription>
                {form.country === "IN"
                  ? "Primary bank account for receiving payments via NEFT / RTGS."
                  : "Primary bank account for receiving ACH / wire payments."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {form.country === "IN" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="ifsc">IFSC Code</Label>
                    <Input
                      id="ifsc"
                      placeholder="e.g. SBIN0001234"
                      maxLength={11}
                      value={form.india_ifsc}
                      onChange={(e) =>
                        updateField(
                          "india_ifsc",
                          e.target.value.toUpperCase()
                        )
                      }
                      onBlur={() => touchField("india_ifsc")}
                      aria-invalid={!!getFieldError("india_ifsc")}
                      className="uppercase"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      11-character Indian Financial System Code
                    </p>
                    {getFieldError("india_ifsc") && (
                      <p className="text-xs text-destructive">
                        {getFieldError("india_ifsc")}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="india-holder">Account Holder Name</Label>
                    <Input
                      id="india-holder"
                      placeholder="Name as per bank records"
                      value={form.india_account_holder}
                      onChange={(e) =>
                        updateField("india_account_holder", e.target.value)
                      }
                      onBlur={() => touchField("india_account_holder")}
                      aria-invalid={!!getFieldError("india_account_holder")}
                    />
                    {getFieldError("india_account_holder") && (
                      <p className="text-xs text-destructive">
                        {getFieldError("india_account_holder")}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="india-acct">Account Number</Label>
                    <Input
                      id="india-acct"
                      placeholder="Enter account number"
                      value={form.india_account_number}
                      onChange={(e) =>
                        updateField("india_account_number", e.target.value)
                      }
                      onBlur={() => touchField("india_account_number")}
                      aria-invalid={!!getFieldError("india_account_number")}
                    />
                    {getFieldError("india_account_number") && (
                      <p className="text-xs text-destructive">
                        {getFieldError("india_account_number")}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="india-acct-confirm">
                      Confirm Account Number
                    </Label>
                    <Input
                      id="india-acct-confirm"
                      placeholder="Re-enter account number"
                      value={form.india_account_confirm}
                      onChange={(e) =>
                        updateField("india_account_confirm", e.target.value)
                      }
                      onBlur={() => touchField("india_account_confirm")}
                      aria-invalid={!!getFieldError("india_account_confirm")}
                    />
                    {getFieldError("india_account_confirm") && (
                      <p className="text-xs text-destructive">
                        {getFieldError("india_account_confirm")}
                      </p>
                    )}
                  </div>
                </>
              )}

              {form.country === "US" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="routing">Routing Number</Label>
                    <Input
                      id="routing"
                      placeholder="e.g. 021000021"
                      maxLength={9}
                      value={form.us_routing_number}
                      onChange={(e) =>
                        updateField("us_routing_number", e.target.value)
                      }
                      onBlur={() => touchField("us_routing_number")}
                      aria-invalid={!!getFieldError("us_routing_number")}
                    />
                    <p className="text-[11px] text-muted-foreground">
                      9-digit ABA routing transit number
                    </p>
                    {getFieldError("us_routing_number") && (
                      <p className="text-xs text-destructive">
                        {getFieldError("us_routing_number")}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="us-holder">Account Holder Name</Label>
                    <Input
                      id="us-holder"
                      placeholder="Name as per bank records"
                      value={form.us_account_holder}
                      onChange={(e) =>
                        updateField("us_account_holder", e.target.value)
                      }
                      onBlur={() => touchField("us_account_holder")}
                      aria-invalid={!!getFieldError("us_account_holder")}
                    />
                    {getFieldError("us_account_holder") && (
                      <p className="text-xs text-destructive">
                        {getFieldError("us_account_holder")}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="us-acct">Account Number</Label>
                    <Input
                      id="us-acct"
                      placeholder="Enter account number"
                      value={form.us_account_number}
                      onChange={(e) =>
                        updateField("us_account_number", e.target.value)
                      }
                      onBlur={() => touchField("us_account_number")}
                      aria-invalid={!!getFieldError("us_account_number")}
                    />
                    {getFieldError("us_account_number") && (
                      <p className="text-xs text-destructive">
                        {getFieldError("us_account_number")}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="us-acct-confirm">
                      Confirm Account Number
                    </Label>
                    <Input
                      id="us-acct-confirm"
                      placeholder="Re-enter account number"
                      value={form.us_account_confirm}
                      onChange={(e) =>
                        updateField("us_account_confirm", e.target.value)
                      }
                      onBlur={() => touchField("us_account_confirm")}
                      aria-invalid={!!getFieldError("us_account_confirm")}
                    />
                    {getFieldError("us_account_confirm") && (
                      <p className="text-xs text-destructive">
                        {getFieldError("us_account_confirm")}
                      </p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* ---------------------------------------------------------- */}
        {/*  STEP 5: Key Personnel                                      */}
        {/* ---------------------------------------------------------- */}
        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="size-5 text-primary" />
                Key Personnel
              </CardTitle>
              <CardDescription>
                Provide details of the CEO / Managing Director and Compliance
                Officer.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Person 1: CEO / Managing Director */}
              <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
                <p className="text-sm font-medium">
                  CEO / Managing Director
                </p>
                <div className="space-y-2">
                  <Label htmlFor="ceo-name">Full Name</Label>
                  <Input
                    id="ceo-name"
                    placeholder="e.g. Rajesh Kumar"
                    value={form.ceo_name}
                    onChange={(e) => updateField("ceo_name", e.target.value)}
                    onBlur={() => touchField("ceo_name")}
                    aria-invalid={!!getFieldError("ceo_name")}
                  />
                  {getFieldError("ceo_name") && (
                    <p className="text-xs text-destructive">
                      {getFieldError("ceo_name")}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ceo-email">Email</Label>
                    <Input
                      id="ceo-email"
                      type="email"
                      placeholder="ceo@company.com"
                      value={form.ceo_email}
                      onChange={(e) =>
                        updateField("ceo_email", e.target.value)
                      }
                      onBlur={() => touchField("ceo_email")}
                      aria-invalid={!!getFieldError("ceo_email")}
                    />
                    {getFieldError("ceo_email") && (
                      <p className="text-xs text-destructive">
                        {getFieldError("ceo_email")}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ceo-phone">
                      Phone{" "}
                      <span className="text-xs text-muted-foreground">
                        (optional)
                      </span>
                    </Label>
                    <Input
                      id="ceo-phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={form.ceo_phone}
                      onChange={(e) =>
                        updateField("ceo_phone", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Person 2: Compliance Officer */}
              <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
                <p className="text-sm font-medium">Compliance Officer</p>
                <div className="space-y-2">
                  <Label htmlFor="compliance-name">Full Name</Label>
                  <Input
                    id="compliance-name"
                    placeholder="e.g. Priya Sharma"
                    value={form.compliance_name}
                    onChange={(e) =>
                      updateField("compliance_name", e.target.value)
                    }
                    onBlur={() => touchField("compliance_name")}
                    aria-invalid={!!getFieldError("compliance_name")}
                  />
                  {getFieldError("compliance_name") && (
                    <p className="text-xs text-destructive">
                      {getFieldError("compliance_name")}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="compliance-email">Email</Label>
                    <Input
                      id="compliance-email"
                      type="email"
                      placeholder="compliance@company.com"
                      value={form.compliance_email}
                      onChange={(e) =>
                        updateField("compliance_email", e.target.value)
                      }
                      onBlur={() => touchField("compliance_email")}
                      aria-invalid={!!getFieldError("compliance_email")}
                    />
                    {getFieldError("compliance_email") && (
                      <p className="text-xs text-destructive">
                        {getFieldError("compliance_email")}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="compliance-phone">
                      Phone{" "}
                      <span className="text-xs text-muted-foreground">
                        (optional)
                      </span>
                    </Label>
                    <Input
                      id="compliance-phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={form.compliance_phone}
                      onChange={(e) =>
                        updateField("compliance_phone", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ---------------------------------------------------------- */}
        {/*  STEP 6: Review & Submit                                    */}
        {/* ---------------------------------------------------------- */}
        {currentStep === 5 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Eye className="size-5 text-primary" />
                Review &amp; Submit
              </CardTitle>
              <CardDescription>
                Please review all details before submitting for verification.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Section: Company Information */}
              <ReviewSection
                title="Company Information"
                onEdit={() => goToStep(0)}
              >
                <ReviewRow label="Company Name" value={form.company_name} />
                <ReviewRow
                  label="Country"
                  value={form.country === "IN" ? "India" : "United States"}
                />
                <ReviewRow
                  label="Insurer Type"
                  value={getInsurerTypeLabel(
                    form.country as "IN" | "US",
                    form.insurer_type
                  )}
                />
              </ReviewSection>

              {/* Section: Licensing & Regulatory */}
              <ReviewSection
                title="Licensing & Regulatory"
                onEdit={() => goToStep(1)}
              >
                {form.country === "IN" && (
                  <>
                    <ReviewRow
                      label="IRDAI Reg. No."
                      value={form.irdai_registration_number}
                      mono
                    />
                    {form.cin && (
                      <ReviewRow
                        label="CIN"
                        value={form.cin.toUpperCase()}
                        mono
                      />
                    )}
                    <ReviewRow
                      label="PAN"
                      value={form.pan.toUpperCase()}
                      mono
                    />
                    {form.gstin && (
                      <ReviewRow
                        label="GSTIN"
                        value={form.gstin.toUpperCase()}
                        mono
                      />
                    )}
                  </>
                )}
                {form.country === "US" && (
                  <>
                    <ReviewRow
                      label="NAIC Code"
                      value={form.naic_code}
                      mono
                    />
                    {form.state_of_domicile && (
                      <ReviewRow
                        label="State of Domicile"
                        value={form.state_of_domicile}
                      />
                    )}
                    <ReviewRow
                      label="EIN"
                      value={maskValue(form.ein.replace(/\D/g, ""))}
                      mono
                    />
                  </>
                )}
              </ReviewSection>

              {/* Section: Address */}
              <ReviewSection
                title="Office Address"
                onEdit={() => goToStep(2)}
              >
                <ReviewRow
                  label="Address"
                  value={[
                    form.address_line1,
                    form.address_line2,
                    form.city,
                    form.state,
                    form.postal_code,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                />
              </ReviewSection>

              {/* Section: Bank */}
              <ReviewSection
                title="Bank Account"
                onEdit={() => goToStep(3)}
              >
                {form.country === "IN" && (
                  <>
                    <ReviewRow
                      label="IFSC"
                      value={form.india_ifsc.toUpperCase()}
                      mono
                    />
                    <ReviewRow
                      label="Account Holder"
                      value={form.india_account_holder}
                    />
                    <ReviewRow
                      label="Account Number"
                      value={maskValue(form.india_account_number)}
                      mono
                    />
                  </>
                )}
                {form.country === "US" && (
                  <>
                    <ReviewRow
                      label="Routing Number"
                      value={maskValue(
                        form.us_routing_number.replace(/\D/g, "")
                      )}
                      mono
                    />
                    <ReviewRow
                      label="Account Holder"
                      value={form.us_account_holder}
                    />
                    <ReviewRow
                      label="Account Number"
                      value={maskValue(form.us_account_number)}
                      mono
                    />
                  </>
                )}
              </ReviewSection>

              {/* Section: Key Personnel */}
              <ReviewSection
                title="Key Personnel"
                onEdit={() => goToStep(4)}
              >
                <ReviewRow
                  label="CEO / MD"
                  value={form.ceo_name}
                />
                <ReviewRow label="Email" value={form.ceo_email} />
                {form.ceo_phone && (
                  <ReviewRow label="Phone" value={form.ceo_phone} />
                )}
                <div className="border-t border-border my-2" />
                <ReviewRow
                  label="Compliance Officer"
                  value={form.compliance_name}
                />
                <ReviewRow label="Email" value={form.compliance_email} />
                {form.compliance_phone && (
                  <ReviewRow label="Phone" value={form.compliance_phone} />
                )}
              </ReviewSection>

              {/* Disclaimer */}
              <div className="rounded-xl bg-muted/50 p-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  By submitting, you confirm that all the information provided
                  is accurate and complete. Sensitive data (PAN, EIN, bank
                  account numbers) will be encrypted at rest and handled in
                  accordance with applicable data protection regulations.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ============================================================ */}
      {/*  Navigation buttons                                           */}
      {/* ============================================================ */}

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={
            currentStep === 0 ? () => router.push("/") : handleBack
          }
        >
          <ArrowLeft className="size-4" />
          {currentStep === 0 ? "Cancel" : "Back"}
        </Button>

        {currentStep < STEPS.length - 1 ? (
          <Button onClick={handleNext}>
            Continue
            <ArrowRight className="size-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Check className="size-4" />
            )}
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        )}
      </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Review helper components                                           */
/* ================================================================== */

function ReviewSection({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        <button
          onClick={onEdit}
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <Pencil className="size-3" />
          Edit
        </button>
      </div>
      <div className="rounded-xl bg-muted/50 p-4 space-y-2.5">{children}</div>
    </div>
  );
}

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
        className={cn(
          "text-sm text-right truncate",
          mono && "font-mono"
        )}
      >
        {value}
      </span>
    </div>
  );
}
