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
  Calendar,
  Loader2,
} from "lucide-react";
import {
  getVendors,
  getEntityLabel,
  getStatusLabel,
  getStatusColor,
  maskValue,
  type Vendor,
} from "@/lib/vendors";
import { createClient } from "@/lib/supabase/client";

/* ------------------------------------------------------------------ */
/*  Types for /api/policy-holders/me response                          */
/* ------------------------------------------------------------------ */

interface PolicyHolderMe {
  _id: string;
  country: "US" | "IN";
  full_name: string;
  dob: string;
  identity: Record<string, unknown>;
  email: string;
  status: "REGISTERED" | "KYC_PENDING" | "ACTIVE";
  created_at: string;
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ProfilePage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [me, setMe] = useState<PolicyHolderMe | null>(null);
  const [meLoading, setMeLoading] = useState(true);
  const [meError, setMeError] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setVendors(getVendors());
    setIsLoaded(true);
    fetchMe();
  }, []);

  async function fetchMe() {
    setMeLoading(true);
    setMeError("");

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setMeError("Not authenticated");
        setMeLoading(false);
        return;
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const res = await fetch(`${baseUrl}/api/policy-holders/me`, {
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

      const data: PolicyHolderMe = await res.json();
      setMe(data);
    } catch (err) {
      setMeError(
        err instanceof Error ? err.message : "Failed to load profile"
      );
    } finally {
      setMeLoading(false);
    }
  }

  /* While hydrating, show nothing to avoid flash */
  if (!isLoaded) return null;

  const hasVendors = vendors.length > 0;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-3xl">
      {/* Page header */}
      <div>
        <h1 className="text-xl md:text-2xl font-semibold">Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your account details and registered buyer information.
        </p>
      </div>

      {/* ============================================================ */}
      {/*  Account / Me card                                            */}
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
          {meLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">
                Loading profile...
              </span>
            </div>
          )}

          {!meLoading && meError && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
              <p className="text-sm text-destructive">{meError}</p>
            </div>
          )}

          {!meLoading && me && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoItem
                  icon={User}
                  label="Full Name"
                  value={me.full_name}
                />
                <InfoItem icon={Mail} label="Email" value={me.email} />
                <InfoItem
                  icon={Globe}
                  label="Country"
                  value={me.country === "IN" ? "India" : "United States"}
                />
                <InfoItem
                  icon={Calendar}
                  label="Date of Birth"
                  value={me.dob}
                />
                <InfoItem
                  icon={Clock}
                  label="Joined"
                  value={new Date(me.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                />
                <InfoItem
                  icon={ShieldCheck}
                  label="Status"
                  value={
                    me.status === "ACTIVE"
                      ? "Active"
                      : me.status === "KYC_PENDING"
                        ? "KYC Pending"
                        : "Registered"
                  }
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ============================================================ */}
      {/*  Vendor / Buyer cards                                         */}
      {/* ============================================================ */}
      {!hasVendors && (
        <Card>
          <CardContent className="py-16 flex flex-col items-center text-center">
            <div className="size-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Building2 className="size-7 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold">No Buyers Yet</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              No buyer details to display. Complete the onboarding process to
              see your KYC details here.
            </p>
          </CardContent>
        </Card>
      )}

      {vendors.map((vendor) => (
        <VendorCard key={vendor.id} vendor={vendor} />
      ))}
    </div>
  );
}

/* ================================================================== */
/*  Vendor detail card                                                 */
/* ================================================================== */

function VendorCard({ vendor }: { vendor: Vendor }) {
  const country = vendor.buyer_country;
  const entityType =
    country === "IN"
      ? vendor.kyc_india?.entity_type
      : vendor.kyc_us?.entity_type;

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
                <span className="font-mono text-xs">{vendor.id}</span>
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

        {/* KYC Details */}
        <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" />
            <h3 className="text-sm font-semibold">KYC Details</h3>
          </div>

          {/* India KYC */}
          {country === "IN" && vendor.kyc_india && (
            <div className="space-y-3">
              <KycRow label="PAN" value={vendor.kyc_india.pan} mono />
              {vendor.kyc_india.cin_or_llpin && (
                <KycRow
                  label="CIN / LLPIN"
                  value={vendor.kyc_india.cin_or_llpin}
                  mono
                />
              )}
            </div>
          )}

          {/* US KYC */}
          {country === "US" && vendor.kyc_us && (
            <div className="space-y-3">
              <KycRow
                label="EIN"
                value={maskValue(vendor.kyc_us.ein.replace(/\D/g, ""))}
                mono
              />
              <KycRow
                label="State of Incorporation"
                value={vendor.kyc_us.state_of_incorporation}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* ================================================================== */
/*  Sub-components                                                     */
/* ================================================================== */

function StatusBadge({ status }: { status: Vendor["status"] }) {
  const colorClass = getStatusColor(status);

  const icon =
    status === "verified" ? (
      <CheckCircle2 className="size-3" />
    ) : status === "rejected" ? (
      <XCircle className="size-3" />
    ) : status === "pending_verification" ? (
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
