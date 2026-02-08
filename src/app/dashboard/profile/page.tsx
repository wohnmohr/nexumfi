"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api-fetch";
import { cn } from "@/lib/utils";
import {
  Building2,
  Globe,
  Mail,
  ShieldCheck,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  Loader2,
  MapPin,
  Phone,
  CreditCard,
  Receipt,
} from "lucide-react";
import {
  getEntityLabel,
  getStatusLabel,
  getStatusColor,
  maskValue,
  type Country,
} from "@/lib/vendors";
import { createClient } from "@/lib/supabase/client";

/* ------------------------------------------------------------------ */
/*  Types for /api/me response                                         */
/* ------------------------------------------------------------------ */

interface AddressStructured {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

interface Signatory {
  name?: string;
  role?: string;
  email?: string;
  phone?: string | null;
  id_type?: string;
  id_number_encrypted?: string;
  verification_status?: string;
}

interface KycIndiaApi {
  entity_type: string;
  pan: string;
  gstin?: string | null;
  cin_or_llpin?: string | null;
  udyam_number?: string | null;
  registered_address?: AddressStructured | null;
  bank_account?: unknown | null;
  signatory?: Signatory | null;
}

interface KycUsApi {
  entity_type: string;
  ein: string;
  state_of_incorporation: string;
}

interface InvoiceProfile {
  approval_source?: string;
  avg_invoice_value_min?: number;
  avg_invoice_value_max?: number;
  payment_cycle_days?: number;
}

interface PolicyHolderIdentity {
  document_type?: string;
  document_hash?: string;
  status?: string;
}

interface PolicyHolderApi {
  _id: string;
  country: "US" | "IN";
  user_type?: string;
  full_name: string;
  dob?: string;
  identity?: PolicyHolderIdentity | null;
  email: string;
  status: "REGISTERED" | "KYC_PENDING" | "ACTIVE";
  kyc_verified_at?: string | null;
  kyc_provider?: string | null;
  aml_status?: string | null;
  aml_checked_at?: string | null;
  aml_provider?: string | null;
  pan_masked?: string | null;
  ssn_last4_masked?: string | null;
  created_at: string;
}

interface VendorApi {
  _id: string;
  buyer_country: "IN" | "US";
  legal_name: string;
  address?: string;
  contact_email: string;
  address_structured?: AddressStructured | null;
  kyc_india?: KycIndiaApi | null;
  kyc_us?: KycUsApi | null;
  invoice_profile?: InvoiceProfile | null;
  status: string;
  kyc_verified_at?: string | null;
  kyc_provider?: string | null;
  aml_status?: string | null;
  aml_checked_at?: string | null;
  aml_provider?: string | null;
  created_at: string;
}

interface ProfileMeApi {
  sub: string;
  user_type: "vendor" | "policy_holder";
  policy_holder: PolicyHolderApi | null;
  vendor: VendorApi | null;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function formatAddress(addr: AddressStructured | null | undefined): string {
  if (!addr) return "—";
  const parts = [
    addr.line1,
    addr.line2,
    [addr.city, addr.state].filter(Boolean).join(", "),
    addr.postal_code,
    addr.country,
  ].filter(Boolean);
  return parts.join(", ") || "—";
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileMeApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const res = await apiFetch(`${baseUrl}/api/me`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(
          errData?.detail ?? `Request failed (${res.status})`
        );
      }

      const data: ProfileMeApi = await res.json();
      setProfile(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load profile"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-3xl mx-auto">
      {/* Page header */}
      <div>
        <h1 className="text-xl md:text-2xl font-semibold">Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your account details and registered buyer information.
        </p>
      </div>

      {/* ============================================================ */}
      {/*  Account card                                                 */}
      {/* ============================================================ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="size-5 text-primary" />
            Account
          </CardTitle>
          <CardDescription>
            Your personal account details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">
                Loading profile...
              </span>
            </div>
          )}

          {!loading && error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {!loading && profile && (
            <div className="space-y-5">
              {profile.vendor ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoItem
                    icon={User}
                    label="Legal Name"
                    value={profile.vendor.legal_name}
                  />
                  <InfoItem
                    icon={Mail}
                    label="Contact Email"
                    value={profile.vendor.contact_email}
                  />
                  <InfoItem
                    icon={Globe}
                    label="Country"
                    value={
                      profile.vendor.buyer_country === "IN"
                        ? "India"
                        : "United States"
                    }
                  />
                  <InfoItem
                    icon={Clock}
                    label="Joined"
                    value={new Date(
                      profile.vendor.created_at
                    ).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  />
                  <InfoItem
                    icon={ShieldCheck}
                    label="Status"
                    value={getStatusLabel(profile.vendor.status)}
                  />
                  <InfoItem
                    icon={FileText}
                    label="User Type"
                    value={profile.user_type}
                  />
                </div>
              ) : profile.policy_holder ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoItem
                      icon={User}
                      label="Full Name"
                      value={profile.policy_holder.full_name}
                    />
                    <InfoItem
                      icon={Mail}
                      label="Email"
                      value={profile.policy_holder.email}
                    />
                    <InfoItem
                      icon={Globe}
                      label="Country"
                      value={
                        profile.policy_holder.country === "IN"
                          ? "India"
                          : "United States"
                      }
                    />
                    {profile.policy_holder.dob && (
                      <InfoItem
                        icon={Clock}
                        label="Date of Birth"
                        value={new Date(
                          profile.policy_holder.dob
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      />
                    )}
                    <InfoItem
                      icon={Clock}
                      label="Joined"
                      value={new Date(
                        profile.policy_holder.created_at
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    />
                    <InfoItem
                      icon={ShieldCheck}
                      label="Status"
                      value={getStatusLabel(profile.policy_holder.status)}
                    />
                    {profile.policy_holder.user_type && (
                      <InfoItem
                        icon={FileText}
                        label="User Type"
                        value={profile.policy_holder.user_type}
                      />
                    )}
                  </div>
                  {profile.policy_holder.aml_status && (
                    <div className="rounded-xl border border-border bg-muted/30 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="size-4 text-primary" />
                          <span className="text-sm font-semibold">AML Status</span>
                        </div>
                        <StatusBadge status={profile.policy_holder.aml_status} />
                      </div>
                      {profile.policy_holder.aml_checked_at && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Checked{" "}
                          {new Date(
                            profile.policy_holder.aml_checked_at
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No profile data available.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ============================================================ */}
      {/*  Vendor / Buyer card                                          */}
      {/* ============================================================ */}
      {!loading && profile?.vendor && (
        <VendorCard vendor={profile.vendor} />
      )}

      {/* ============================================================ */}
      {/*  Policy Holder card                                           */}
      {/* ============================================================ */}
      {!loading && profile?.policy_holder && (
        <PolicyHolderCard policyHolder={profile.policy_holder} />
      )}

      {!loading && profile && !profile.vendor && !profile.policy_holder && (
        <Card>
          <CardContent className="py-16 flex flex-col items-center text-center">
            <div className="size-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Building2 className="size-7 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold">No Profile Yet</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Complete the onboarding process to see your details here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Policy Holder detail card                                          */
/* ================================================================== */

function PolicyHolderCard({ policyHolder }: { policyHolder: PolicyHolderApi }) {
  const identity = policyHolder.identity;
  const identityDocType = identity?.document_type ?? "—";
  const identityStatus = identity?.status ?? "—";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-11 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="size-5 text-emerald-500" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-lg truncate">
                {policyHolder.full_name}
              </CardTitle>
              <CardDescription className="flex items-center gap-1.5 mt-0.5">
                <span className="font-mono text-xs">{policyHolder._id}</span>
              </CardDescription>
            </div>
          </div>
          <StatusBadge status={policyHolder.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Basic Info */}
        <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
          <h3 className="text-sm font-semibold">KYC Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoItem
              icon={User}
              label="Full Name"
              value={policyHolder.full_name}
            />
            <InfoItem
              icon={Mail}
              label="Email"
              value={policyHolder.email}
            />
            <InfoItem
              icon={Globe}
              label="Country"
              value={
                policyHolder.country === "IN" ? "India" : "United States"
              }
            />
            {policyHolder.dob && (
              <InfoItem
                icon={Clock}
                label="Date of Birth"
                value={new Date(policyHolder.dob).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              />
            )}
            <InfoItem
              icon={FileText}
              label="Identity Document"
              value={identityDocType}
            />
            <InfoItem
              icon={ShieldCheck}
              label="Identity Status"
              value={getStatusLabel(identityStatus)}
            />
            {(policyHolder.pan_masked || policyHolder.ssn_last4_masked) && (
              <InfoItem
                icon={FileText}
                label={
                  policyHolder.country === "IN" ? "PAN (masked)" : "SSN (masked)"
                }
                value={
                  policyHolder.pan_masked || policyHolder.ssn_last4_masked || "—"
                }
              />
            )}
          </div>
          {policyHolder.kyc_verified_at && (
            <p className="text-xs text-muted-foreground pt-2">
              KYC verified{" "}
              {new Date(policyHolder.kyc_verified_at).toLocaleDateString()}
              {policyHolder.kyc_provider && ` via ${policyHolder.kyc_provider}`}
            </p>
          )}
        </div>

        {/* AML Status */}
        {policyHolder.aml_status && (
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" />
                <span className="text-sm font-semibold">AML Status</span>
              </div>
              <StatusBadge status={policyHolder.aml_status} />
            </div>
            {policyHolder.aml_checked_at && (
              <p className="text-xs text-muted-foreground mt-2">
                Checked{" "}
                {new Date(policyHolder.aml_checked_at).toLocaleDateString()}
              </p>
            )}
            {policyHolder.aml_provider && (
              <p className="text-xs text-muted-foreground">
                Provider: {policyHolder.aml_provider}
              </p>
            )}
          </div>
        )}

        {/* Registered */}
        <div className="text-xs text-muted-foreground">
          Registered{" "}
          {new Date(policyHolder.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </div>
      </CardContent>
    </Card>
  );
}

/* ================================================================== */
/*  Vendor detail card                                                 */
/* ================================================================== */

function VendorCard({ vendor }: { vendor: VendorApi }) {
  const country = vendor.buyer_country as Country;
  const kycIndia = vendor.kyc_india;
  const kycUs = vendor.kyc_us;
  const entityType = kycIndia?.entity_type ?? kycUs?.entity_type;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Building2 className="size-5 text-primary" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-lg truncate">
                {vendor.legal_name}
              </CardTitle>
              <CardDescription className="flex items-center gap-1.5 mt-0.5">
                <span className="font-mono text-xs">{vendor._id}</span>
              </CardDescription>
            </div>
          </div>
          <StatusBadge status={vendor.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoItem
            icon={Globe}
            label="Country"
            value={country === "IN" ? "India" : "United States"}
          />
          <InfoItem
            icon={Mail}
            label="Contact Email"
            value={vendor.contact_email}
          />
          <InfoItem
            icon={FileText}
            label="Entity Type"
            value={
              entityType
                ? getEntityLabel(country, entityType)
                : "—"
            }
          />
          <InfoItem
            icon={Clock}
            label="Registered"
            value={new Date(vendor.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          />
        </div>

        {/* Address */}
        {(vendor.address || vendor.address_structured) && (
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="size-4 text-primary" />
              <h3 className="text-sm font-semibold">Address</h3>
            </div>
            <p className="text-sm">
              {vendor.address ?? formatAddress(vendor.address_structured)}
            </p>
          </div>
        )}

        {/* KYC Details */}
        <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" />
            <h3 className="text-sm font-semibold">KYC Details</h3>
          </div>

          {/* India KYC */}
          {country === "IN" && kycIndia && (
            <div className="space-y-3">
              <KycRow label="PAN" value={kycIndia.pan} mono />
              {kycIndia.gstin && (
                <KycRow label="GSTIN" value={kycIndia.gstin} mono />
              )}
              {kycIndia.udyam_number && (
                <KycRow
                  label="Udyam Number"
                  value={kycIndia.udyam_number}
                  mono
                />
              )}
              {kycIndia.cin_or_llpin && (
                <KycRow
                  label="CIN / LLPIN"
                  value={kycIndia.cin_or_llpin}
                  mono
                />
              )}
              {kycIndia.registered_address && (
                <div className="pt-2 border-t border-border">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mb-1">
                    Registered Address
                  </p>
                  <p className="text-sm">
                    {formatAddress(kycIndia.registered_address)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* US KYC */}
          {country === "US" && kycUs && (
            <div className="space-y-3">
              <KycRow
                label="EIN"
                value={maskValue(kycUs.ein.replace(/\D/g, ""))}
                mono
              />
              <KycRow
                label="State of Incorporation"
                value={kycUs.state_of_incorporation}
              />
            </div>
          )}

          {/* KYC Verified */}
          {vendor.kyc_verified_at && (
            <div className="pt-2 border-t border-border">
              <KycRow
                label="KYC Verified"
                value={new Date(
                  vendor.kyc_verified_at
                ).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              />
            </div>
          )}
        </div>

        {/* Signatory */}
        {kycIndia?.signatory && (
          <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <User className="size-4 text-primary" />
              <h3 className="text-sm font-semibold">Signatory</h3>
              {kycIndia.signatory.verification_status === "VERIFIED" && (
                <Badge
                  variant="secondary"
                  className="text-emerald-500 text-[10px]"
                >
                  <CheckCircle2 className="size-2.5" />
                  Verified
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoItem
                icon={User}
                label="Name"
                value={kycIndia.signatory.name ?? "—"}
              />
              <InfoItem
                icon={FileText}
                label="Role"
                value={kycIndia.signatory.role ?? "—"}
              />
              {kycIndia.signatory.email && (
                <InfoItem
                  icon={Mail}
                  label="Email"
                  value={kycIndia.signatory.email}
                />
              )}
              {kycIndia.signatory.phone && (
                <InfoItem
                  icon={Phone}
                  label="Phone"
                  value={kycIndia.signatory.phone}
                />
              )}
            </div>
          </div>
        )}

        {/* AML Status */}
        {vendor.aml_status && (
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" />
                <span className="text-sm font-semibold">AML Status</span>
              </div>
              <StatusBadge status={vendor.aml_status} />
            </div>
            {vendor.aml_checked_at && (
              <p className="text-xs text-muted-foreground mt-2">
                Checked {new Date(vendor.aml_checked_at).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        {/* Invoice Profile */}
        {vendor.invoice_profile && (
          <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Receipt className="size-4 text-primary" />
              <h3 className="text-sm font-semibold">Invoice Profile</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoItem
                icon={FileText}
                label="Approval Source"
                value={
                  vendor.invoice_profile.approval_source ?? "—"
                }
              />
              <InfoItem
                icon={CreditCard}
                label="Payment Cycle"
                value={
                  vendor.invoice_profile.payment_cycle_days
                    ? `${vendor.invoice_profile.payment_cycle_days} days`
                    : "—"
                }
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ================================================================== */
/*  Sub-components                                                     */
/* ================================================================== */

function StatusBadge({ status }: { status: string }) {
  const colorClass = getStatusColor(status);

  const icon =
    status === "verified" ||
    status === "ONBOARDED" ||
    status === "ACTIVE" ||
    status === "CLEAR" ? (
      <CheckCircle2 className="size-3" />
    ) : status === "rejected" ||
      status === "FLAGGED" ||
      status === "ERROR" ? (
      <XCircle className="size-3" />
    ) :     status === "pending_verification" ||
      status === "KYC_PENDING" ||
      status === "PENDING" ? (
      <AlertCircle className="size-3" />
    ) : (
      <Clock className="size-3" />
    );

  return (
    <Badge
      variant="secondary"
      className={cn("shrink-0 gap-1", colorClass)}
    >
      {icon}
      {getStatusLabel(status)}
    </Badge>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
          {label}
        </p>
        <p className="text-sm font-medium truncate mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function KycRow({
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
          "text-sm font-medium text-right truncate",
          mono && "font-mono"
        )}
      >
        {value}
      </span>
    </div>
  );
}
