"use client";

import { useEffect, useState, useCallback } from "react";
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
  HandCoins,
  Wallet,
  Shield,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Loader2,
  Landmark,
  TrendingUp,
  Percent,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { getStellarWallet } from "@/lib/stellar-wallet";
import {
  createBorrowClient,
  createVaultClient,
} from "@/lib/stellar-contracts";
import type { BorrowConfig, Loan } from "@/app/contracts/borrow_contract/src";
import type { VaultState } from "@/app/contracts/lending_vault/src";
import { networks as receivableNetworks } from "@/app/contracts/receivable_token/src";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function stroopsToXlm(stroops: bigint): number {
  return Number(stroops) / 10_000_000;
}

function fmtXlm(xlm: number): string {
  return xlm.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function bpsToPercent(bps: bigint): number {
  return Number(bps) / 100;
}

interface LoanWithLtv {
  loan: Loan;
  ltv: bigint | null;
}

/* ------------------------------------------------------------------ */
/*  ActiveLoans Component                                              */
/* ------------------------------------------------------------------ */

export function ActiveLoans({ onHasLoans }: { onHasLoans?: (has: boolean) => void } = {}) {
  const router = useRouter();
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [loans, setLoans] = useState<LoanWithLtv[]>([]);
  const [poolState, setPoolState] = useState<VaultState | null>(null);
  const [borrowConfig, setBorrowConfig] = useState<BorrowConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedLoanId, setExpandedLoanId] = useState<string | null>(null);

  const fetchLoans = useCallback(async (borrowerPk: string) => {
    const verifierSecret = process.env.NEXT_PUBLIC_STELLAR_VERIFIER_SECRET;
    if (!verifierSecret) return;

    setLoading(true);
    setError(null);

    try {
      const borrowClient = createBorrowClient(verifierSecret);
      const vaultClient = createVaultClient(verifierSecret);

      // Fetch pool state, config, and borrower's loan IDs in parallel
      const [stateRes, configRes, loanIdsRes] = await Promise.all([
        vaultClient.get_state(),
        borrowClient.get_config(),
        borrowClient.get_borrower_loans({ borrower: borrowerPk }),
      ]);

      setPoolState(stateRes.result);
      setBorrowConfig(configRes.result);

      const loanIds = loanIdsRes.result;
      if (!loanIds || loanIds.length === 0) {
        setLoans([]);
        onHasLoans?.(false);
        return;
      }

      // Fetch each loan's details + LTV in parallel
      const loanResults = await Promise.all(
        loanIds.map(async (id) => {
          try {
            const [loanRes, ltvRes] = await Promise.all([
              borrowClient.get_loan({ loan_id: id }),
              borrowClient.get_ltv({ loan_id: id }),
            ]);
            const loanVal = loanRes.result;
            const ltvVal = ltvRes.result;
            if (loanVal.isOk()) {
              return {
                loan: loanVal.unwrap(),
                ltv: ltvVal.isOk() ? ltvVal.unwrap() : null,
              } as LoanWithLtv;
            }
            return null;
          } catch {
            return null;
          }
        })
      );

      const filtered = loanResults.filter((r): r is LoanWithLtv => r !== null);
      setLoans(filtered);
      onHasLoans?.(filtered.length > 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch loans");
    } finally {
      setLoading(false);
    }
  }, [onHasLoans]);

  // Read wallet public key from localStorage on mount
  useEffect(() => {
    const wallet = getStellarWallet();
    if (wallet) {
      setPublicKey(wallet.publicKey);
      fetchLoans(wallet.publicKey);
    } else {
      setLoading(false);
    }
  }, [fetchLoans]);

  const toggleExpand = (id: string) => {
    setExpandedLoanId((prev) => (prev === id ? null : id));
  };

  const activeLoans = loans.filter((l) => l.loan.status.tag === "Active");
  const totalPrincipal = activeLoans.reduce(
    (sum, l) => sum + stroopsToXlm(l.loan.principal),
    0
  );
  const totalCollateral = activeLoans.reduce(
    (sum, l) => sum + stroopsToXlm(l.loan.collateral_value),
    0
  );

  /* ---- No wallet ---- */
  if (!publicKey && !loading) {
    return null; // Don't show anything if no wallet set up
  }

  /* ---- Loading ---- */
  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">
            Loading loans...
          </span>
        </CardContent>
      </Card>
    );
  }

  /* ---- Error ---- */
  if (error) {
    return (
      <Card className="border-destructive/20">
        <CardContent className="flex items-center gap-3 py-6">
          <AlertTriangle className="size-5 text-destructive shrink-0" />
          <div>
            <p className="text-sm font-medium">Failed to load loans</p>
            <p className="text-xs text-muted-foreground mt-0.5">{error}</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="ml-auto shrink-0"
            onClick={() => publicKey && fetchLoans(publicKey)}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  /* ---- No loans ---- */
  if (loans.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <HandCoins className="size-7 text-primary" />
          </div>
          <h3 className="text-base font-semibold">No Active Loans</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Tokenize a receivable and borrow against it to get started.
          </p>
          <Button
            className="mt-5"
            onClick={() => router.push("/dashboard/get-credit")}
          >
            <ArrowRight className="size-4" />
            Get Credit
          </Button>
        </CardContent>
      </Card>
    );
  }

  /* ---- Loans exist ---- */
  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Total borrowed */}
        <Card className="border-primary/20 bg-primary/[0.03]">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Wallet className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Borrowed</p>
                <p className="text-lg font-semibold tabular-nums">
                  {fmtXlm(totalPrincipal)} XLM
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total collateral */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                <TrendingUp className="size-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Total Collateral
                </p>
                <p className="text-lg font-semibold tabular-nums">
                  {fmtXlm(totalCollateral)} XLM
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active loans count */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                <HandCoins className="size-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active Loans</p>
                <p className="text-lg font-semibold tabular-nums">
                  {activeLoans.length}
                  <span className="text-sm font-normal text-muted-foreground ml-1.5">
                    of {loans.length} total
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pool info bar */}
      {(poolState || borrowConfig) && (
        <div className="rounded-xl bg-muted/30 border border-border p-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
          {poolState && (
            <>
              <span>
                Pool Available:{" "}
                <span className="font-medium text-foreground">
                  {fmtXlm(
                    stroopsToXlm(
                      poolState.total_deposits - poolState.total_borrowed
                    )
                  )}{" "}
                  XLM
                </span>
              </span>
              <span>
                Utilization:{" "}
                <span className="font-medium text-foreground">
                  {poolState.total_deposits > BigInt(0)
                    ? (
                        Number(
                          (poolState.total_borrowed * BigInt(10000)) /
                            poolState.total_deposits
                        ) / 100
                      ).toFixed(1)
                    : "0.0"}
                  %
                </span>
              </span>
            </>
          )}
          {borrowConfig && (
            <>
              <span>
                Interest:{" "}
                <span className="font-medium text-foreground">
                  {bpsToPercent(borrowConfig.base_interest_rate)}%
                </span>
              </span>
              <span>
                Liquidation:{" "}
                <span className="font-medium text-foreground">
                  {bpsToPercent(borrowConfig.liquidation_threshold)}%
                </span>
              </span>
            </>
          )}
        </div>
      )}

      {/* Loans list */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-lg">Loans</CardTitle>
            <CardDescription>
              Your on-chain loans and their current status
            </CardDescription>
          </div>
          {activeLoans.length === 0 && (
            <Button
              size="sm"
              onClick={() => router.push("/dashboard/get-credit")}
            >
              <ArrowRight className="size-4" />
              New Loan
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {loans.map(({ loan, ltv }) => {
            const loanIdStr = loan.id.toString();
            const isExpanded = expandedLoanId === loanIdStr;
            const isActive = loan.status.tag === "Active";
            const principal = stroopsToXlm(loan.principal);
            const collateral = stroopsToXlm(loan.collateral_value);
            const interest = stroopsToXlm(loan.accrued_interest);
            const dueDate = new Date(Number(loan.due_date) * 1000);
            const isOverdue = isActive && dueDate < new Date();

            return (
              <div
                key={loanIdStr}
                className="rounded-xl border border-border bg-muted/20 overflow-hidden transition-colors hover:bg-muted/40"
              >
                {/* Loan row — always visible */}
                <button
                  onClick={() => toggleExpand(loanIdStr)}
                  className="w-full flex items-center gap-3 p-3.5 text-left"
                >
                  {/* Icon */}
                  <div
                    className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isActive
                        ? isOverdue
                          ? "bg-amber-500/10"
                          : "bg-primary/10"
                        : loan.status.tag === "Repaid"
                          ? "bg-emerald-500/10"
                          : "bg-destructive/10"
                    }`}
                  >
                    <HandCoins
                      className={`size-5 ${
                        isActive
                          ? isOverdue
                            ? "text-amber-500"
                            : "text-primary"
                          : loan.status.tag === "Repaid"
                            ? "text-emerald-500"
                            : "text-destructive"
                      }`}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium font-mono">
                        LOAN-{loanIdStr}
                      </p>
                      <Badge
                        variant="secondary"
                        className={`text-[11px] shrink-0 ${
                          isActive
                            ? isOverdue
                              ? "text-amber-500"
                              : "text-primary"
                            : loan.status.tag === "Repaid"
                              ? "text-emerald-500"
                              : "text-destructive"
                        }`}
                      >
                        {isOverdue ? "Overdue" : loan.status.tag}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Due{" "}
                      {dueDate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                      {" · "}
                      {loan.receivable_ids.length} receivable
                      {loan.receivable_ids.length !== 1 ? "s" : ""}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold tabular-nums">
                      {fmtXlm(principal)} XLM
                    </p>
                    {ltv !== null && (
                      <p className="text-xs text-muted-foreground tabular-nums">
                        LTV {bpsToPercent(ltv).toFixed(1)}%
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

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-border bg-muted/30 p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Detail
                        icon={HandCoins}
                        label="Principal"
                        value={`${fmtXlm(principal)} XLM`}
                        highlight
                      />
                      <Detail
                        icon={Shield}
                        label="Collateral Value"
                        value={`${fmtXlm(collateral)} XLM`}
                      />
                      <Detail
                        icon={Percent}
                        label="Current LTV"
                        value={
                          ltv !== null
                            ? `${bpsToPercent(ltv).toFixed(1)}%`
                            : "—"
                        }
                      />
                      <Detail
                        icon={Percent}
                        label="Interest Rate"
                        value={`${bpsToPercent(loan.interest_rate)}%`}
                      />
                      <Detail
                        icon={Clock}
                        label="Due Date"
                        value={dueDate.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      />
                      <Detail
                        icon={Clock}
                        label="Borrowed At"
                        value={new Date(
                          Number(loan.borrowed_at) * 1000
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      />
                    </div>

                    {/* Receivable IDs */}
                    <div className="pt-2 border-t border-border">
                      <p className="text-[11px] text-muted-foreground mb-1.5">
                        Collateral Receivables
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {loan.receivable_ids.map((rid) => (
                          <a
                            key={rid.toString()}
                            href={`https://stellar.expert/explorer/testnet/contract/${receivableNetworks.testnet.contractId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-mono bg-muted px-2 py-1 rounded-md hover:bg-muted/80 text-primary"
                          >
                            RCV-{rid.toString()}
                            <ExternalLink className="size-2.5" />
                          </a>
                        ))}
                      </div>
                    </div>

                    {/* Accrued interest */}
                    {interest > 0 && (
                      <div className="pt-2 border-t border-border flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Accrued Interest
                        </span>
                        <span className="font-medium tabular-nums">
                          {fmtXlm(interest)} XLM
                        </span>
                      </div>
                    )}

                    {/* Total owed */}
                    {isActive && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Total Owed</span>
                        <span className="font-semibold text-primary tabular-nums">
                          {fmtXlm(principal + interest)} XLM
                        </span>
                      </div>
                    )}

                    {/* Borrower */}
                    <div className="pt-2 border-t border-border">
                      <Detail
                        icon={Landmark}
                        label="Borrower"
                        value={loan.borrower}
                        mono
                      />
                    </div>
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
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p
          className={`text-sm truncate ${mono ? "font-mono" : ""} ${highlight ? "text-emerald-500 font-medium" : ""}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
