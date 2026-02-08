"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getClaims,
  getWalletBalance,
  formatCurrency,
  getStatusLabel,
  getStatusColor,
  type InsuranceClaim,
} from "@/lib/claims";
import {
  FileText,
  Wallet,
  CreditCard,
  Clock,
  ArrowRight,
  TrendingUp,
  Hash,
  Building2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  ClaimsList — shows stored claims on the dashboard                  */
/* ------------------------------------------------------------------ */

export function ClaimsList() {
  const router = useRouter();
  const [claims, setClaims] = useState<InsuranceClaim[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [expandedClaimId, setExpandedClaimId] = useState<string | null>(null);

  useEffect(() => {
    setClaims(getClaims());
    setWalletBalance(getWalletBalance());
  }, []);

  // Re-check storage when window regains focus (in case user submitted a claim in another tab)
  useEffect(() => {
    const handleFocus = () => {
      setClaims(getClaims());
      setWalletBalance(getWalletBalance());
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const totalCreditIssued = claims.reduce((sum, c) => sum + c.creditAmount, 0);
  const totalClaimValue = claims.reduce((sum, c) => sum + c.claimAmount, 0);

  const toggleExpand = (id: string) => {
    setExpandedClaimId((prev) => (prev === id ? null : id));
  };

  /* ---- No claims yet ---- */
  if (claims.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <CreditCard className="size-7 text-primary" />
          </div>
          <h3 className="text-base font-semibold">No Claims Yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Submit your first insurance claim to receive a tokenized credit
            line.
          </p>
        </CardContent>
      </Card>
    );
  }

  /* ---- Claims exist ---- */
  return (
    <div className="space-y-5">
      {/* ---- Summary cards ---- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Wallet balance */}
        <Card className="border-primary/20 bg-primary/[0.03]">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Wallet className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Wallet Balance</p>
                <p className="text-lg font-semibold tabular-nums">
                  {formatCurrency(walletBalance)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total credit issued */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                <TrendingUp className="size-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Credit Issued</p>
                <p className="text-lg font-semibold tabular-nums">
                  {formatCurrency(totalCreditIssued)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total claims */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                <FileText className="size-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Claims</p>
                <p className="text-lg font-semibold tabular-nums">
                  {claims.length}
                  <span className="text-sm font-normal text-muted-foreground ml-1.5">
                    ({formatCurrency(totalClaimValue)})
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ---- Claims list ---- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Insurance Claims</CardTitle>
          <CardDescription>
            All your submitted claims and their current status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {claims.map((claim) => {
            const isExpanded = expandedClaimId === claim.id;
            return (
              <div
                key={claim.id}
                className="rounded-xl border border-border bg-muted/20 overflow-hidden transition-colors hover:bg-muted/40"
              >
                {/* Claim row — always visible */}
                <button
                  onClick={() => toggleExpand(claim.id)}
                  className="w-full flex items-center gap-3 p-3.5 text-left"
                >
                  {/* Icon */}
                  <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="size-5 text-primary" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">
                        {claim.claimNumber}
                      </p>
                      <Badge
                        variant="secondary"
                        className={`text-[11px] shrink-0 ${getStatusColor(claim.status)}`}
                      >
                        {getStatusLabel(claim.status)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {claim.insurer} &middot;{" "}
                      {new Date(claim.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold tabular-nums">
                      {formatCurrency(claim.claimAmount)}
                    </p>
                    {claim.creditAmount > 0 && (
                      <p className="text-xs text-emerald-500 tabular-nums">
                        +{formatCurrency(claim.creditAmount)} credit
                      </p>
                    )}
                  </div>

                  {/* Expand chevron */}
                  <div className="shrink-0 text-muted-foreground">
                    {isExpanded ? (
                      <ChevronUp className="size-4" />
                    ) : (
                      <ChevronDown className="size-4" />
                    )}
                  </div>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-border bg-muted/30 p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Detail
                        icon={Hash}
                        label="Token ID"
                        value={claim.tokenId}
                        mono
                      />
                      <Detail
                        icon={Building2}
                        label="Insurer"
                        value={claim.insurer}
                      />
                      <Detail
                        icon={CreditCard}
                        label="Claim Amount"
                        value={formatCurrency(claim.claimAmount)}
                      />
                      <Detail
                        icon={TrendingUp}
                        label="Credit Issued"
                        value={
                          claim.creditAmount > 0
                            ? formatCurrency(claim.creditAmount)
                            : "Pending"
                        }
                        highlight={claim.creditAmount > 0}
                      />
                      <Detail
                        icon={FileText}
                        label="Document"
                        value={claim.fileName}
                      />
                      <Detail
                        icon={Clock}
                        label="Submitted"
                        value={new Date(claim.createdAt).toLocaleString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      />
                    </div>

                    {claim.depositedAt && (
                      <div className="pt-2 border-t border-border">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Deposited to wallet
                          </span>
                          <span className="font-medium text-emerald-500 tabular-nums">
                            +{formatCurrency(claim.walletDepositAmount)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(claim.depositedAt).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    )}

                    {/* Quick action: if credit-ready, go finish deposit */}
                    {claim.status === "credit-ready" && (
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() =>
                          router.push("/dashboard/get-credit")
                        }
                      >
                        <ArrowRight className="size-4" />
                        Complete Deposit
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

/* ---- Detail row helper ---- */

function Detail({
  icon: Icon,
  label,
  value,
  mono,
  highlight,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="size-3.5 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p
          className={`text-sm truncate ${mono ? "font-mono" : ""} ${highlight ? "text-emerald-500 font-medium" : ""}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
