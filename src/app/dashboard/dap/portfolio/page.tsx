"use client";

import { useState, useEffect, useCallback } from "react";
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
  Wallet,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Loader2,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  ArrowDownToLine,
  Info,
  Landmark,
} from "lucide-react";
import { getStellarWallet } from "@/lib/stellar-wallet";
import {
  createBorrowClient,
  createVaultClient,
} from "@/lib/stellar-contracts";
import { WalletPinDialog } from "@/components/wallet-pin-dialog";
import type { BorrowConfig } from "@/app/contracts/borrow_contract/src";
import type { VaultState, LPPosition } from "@/app/contracts/lending_vault/src";

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

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function PortfolioPage() {
  const router = useRouter();

  // Wallet state
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [walletKeys, setWalletKeys] = useState<{ publicKey: string; privateKey: string } | null>(null);
  const [walletMode, setWalletMode] = useState<"create" | "unlock">("create");
  const [showPinDialog, setShowPinDialog] = useState(false);

  // Pool state
  const [vaultState, setVaultState] = useState<VaultState | null>(null);
  const [borrowConfig, setBorrowConfig] = useState<BorrowConfig | null>(null);
  const [lpPosition, setLpPosition] = useState<LPPosition | null>(null);
  const [lpValue, setLpValue] = useState<bigint | null>(null);

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Withdraw state
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawShares, setWithdrawShares] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  // Fetch portfolio data
  const fetchData = useCallback(async (userPk: string) => {
    const verifierSecret = process.env.NEXT_PUBLIC_STELLAR_VERIFIER_SECRET;
    if (!verifierSecret) {
      setError("Verifier secret not configured");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const vaultClient = createVaultClient(verifierSecret);
      const borrowClient = createBorrowClient(verifierSecret);

      const [stateRes, configRes, lpRes] = await Promise.all([
        vaultClient.get_state(),
        borrowClient.get_config(),
        vaultClient.get_lp({ depositor: userPk }),
      ]);

      setVaultState(stateRes.result);
      setBorrowConfig(configRes.result);

      const lp = lpRes.result;
      if (lp) {
        setLpPosition(lp);
        try {
          const valueRes = await vaultClient.shares_value({ shares: lp.shares });
          setLpValue(valueRes.result);
        } catch {
          // non-critical
        }
      } else {
        setLpPosition(null);
        setLpValue(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch portfolio data");
    } finally {
      setLoading(false);
    }
  }, []);

  // Check wallet on mount
  useEffect(() => {
    const wallet = getStellarWallet();
    if (wallet) {
      setPublicKey(wallet.publicKey);
      setWalletMode("unlock");
      fetchData(wallet.publicKey);
    } else {
      setLoading(false);
    }
  }, [fetchData]);

  // Handle wallet unlock
  const handleWalletUnlock = (keys: { publicKey: string; privateKey: string }) => {
    setWalletKeys(keys);
    setShowPinDialog(false);
    setPublicKey(keys.publicKey);
    fetchData(keys.publicKey);
  };

  // Handle withdraw
  async function handleWithdraw() {
    if (!lpPosition || !withdrawShares || Number(withdrawShares) <= 0) return;

    if (!walletKeys) {
      setShowPinDialog(true);
      return;
    }

    setIsWithdrawing(true);
    setWithdrawError(null);

    try {
      const vaultClient = createVaultClient(walletKeys.privateKey);
      const sharesToBurn = BigInt(Math.round(Number(withdrawShares) * 10_000_000));

      // Step 1: Simulate the withdraw transaction
      const tx = await vaultClient.withdraw({
        depositor: walletKeys.publicKey,
        shares_to_burn: sharesToBurn,
      });

      // Step 2: Sign and submit to network
      const result = await tx.signAndSend();

      const resultVal = result.result;
      if (resultVal.isOk()) {
        setWithdrawSuccess(true);
        setWithdrawShares("");
        setShowWithdraw(false);

        // Refresh data
        setTimeout(() => {
          setWithdrawSuccess(false);
          fetchData(walletKeys.publicKey);
        }, 3000);
      } else {
        setWithdrawError("Withdrawal transaction failed on-chain");
      }
    } catch (err) {
      setWithdrawError(err instanceof Error ? err.message : "Withdrawal failed");
    } finally {
      setIsWithdrawing(false);
    }
  }

  const apr = borrowConfig ? bpsToPercent(borrowConfig.base_interest_rate) : 0;

  /* ---- Wallet PIN dialog ---- */
  if (showPinDialog && !walletKeys) {
    return (
      <div className="p-4 md:p-6 space-y-6 max-w-5xl">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">Portfolio</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Unlock your wallet to manage your position.
          </p>
        </div>
        <WalletPinDialog mode={walletMode} onSuccess={handleWalletUnlock} />
      </div>
    );
  }

  /* ---- Loading ---- */
  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6 max-w-5xl">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">Portfolio</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your positions and earnings.
          </p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Loading portfolio...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ---- Error ---- */
  if (error) {
    return (
      <div className="p-4 md:p-6 space-y-6 max-w-5xl">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">Portfolio</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your positions and earnings.
          </p>
        </div>
        <Card className="border-destructive/20">
          <CardContent className="flex items-center gap-3 py-6">
            <AlertTriangle className="size-5 text-destructive shrink-0" />
            <div>
              <p className="text-sm font-medium">Failed to load portfolio</p>
              <p className="text-xs text-muted-foreground mt-0.5">{error}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="ml-auto shrink-0"
              onClick={() => publicKey && fetchData(publicKey)}
            >
              <RefreshCw className="size-3.5" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ---- No wallet ---- */
  if (!publicKey) {
    return (
      <div className="p-4 md:p-6 space-y-6 max-w-5xl">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">Portfolio</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your positions and earnings.
          </p>
        </div>
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Wallet className="size-7 text-primary" />
            </div>
            <h3 className="text-base font-semibold">No Wallet Connected</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              Create or connect a Stellar wallet to view your portfolio.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ---- No position ---- */
  if (!lpPosition) {
    return (
      <div className="p-4 md:p-6 space-y-6 max-w-5xl">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">Portfolio</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your positions and earnings.
          </p>
        </div>
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <ArrowDownToLine className="size-7 text-primary" />
            </div>
            <h3 className="text-base font-semibold">No Active Position</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              Deposit XLM into the lending vault to start earning yield.
            </p>
            <Button className="mt-5" onClick={() => router.push("/dashboard/dap/deposit")}>
              <ArrowDownToLine className="size-4" />
              Go to Deposit
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ---- Has position ---- */
  const shares = stroopsToXlm(lpPosition.shares);
  const currentValue = lpValue !== null ? stroopsToXlm(lpValue) : null;
  const depositDate = new Date(Number(lpPosition.deposit_timestamp) * 1000);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">Portfolio</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your positions and earnings.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={() => fetchData(publicKey)}>
          <RefreshCw className="size-3.5" />
          Refresh
        </Button>
      </div>

      {/* ---- Withdraw success toast ---- */}
      {withdrawSuccess && (
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="py-4 flex items-center gap-3">
            <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />
            <p className="text-sm font-medium">Withdrawal successful! Your XLM has been returned.</p>
          </CardContent>
        </Card>
      )}

      {/* ---- Overview stats ---- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Position Value"
          value={currentValue !== null ? `${fmtXlm(currentValue)} XLM` : "—"}
          icon={Wallet}
          accent="text-primary"
        />
        <StatCard
          label="LP Shares"
          value={fmtXlm(shares)}
          icon={Landmark}
          accent="text-chart-2"
        />
        <StatCard
          label="Current APR"
          value={`${apr.toFixed(1)}%`}
          icon={TrendingUp}
          accent="text-emerald-500"
        />
        <StatCard
          label="Deposit Date"
          value={depositDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          icon={Clock}
          accent="text-chart-4"
        />
      </div>

      {/* ---- Position card ---- */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">XLM Lending Vault</CardTitle>
              <CardDescription>Your active liquidity position.</CardDescription>
            </div>
            <Badge variant="secondary" className="text-emerald-500">Active</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">LP Shares</p>
              <p className="text-sm font-bold tabular-nums">{fmtXlm(shares)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Current Value</p>
              <p className="text-sm font-bold tabular-nums text-emerald-500">
                {currentValue !== null ? `${fmtXlm(currentValue)} XLM` : "—"}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">APR</p>
              <p className="text-sm font-bold tabular-nums text-emerald-500">{apr.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Deposited</p>
              <p className="text-sm font-bold tabular-nums">
                {depositDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </p>
            </div>
          </div>

          {/* Pool utilization bar */}
          {vaultState && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Pool Utilization</span>
                <span className="font-medium">
                  {vaultState.total_deposits > BigInt(0)
                    ? (Number((vaultState.total_borrowed * BigInt(10000)) / vaultState.total_deposits) / 100).toFixed(1)
                    : "0.0"}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-emerald-500/60 rounded-full"
                  style={{
                    width: `${vaultState.total_deposits > BigInt(0)
                      ? Math.min(100, Number((vaultState.total_borrowed * BigInt(100)) / vaultState.total_deposits))
                      : 0}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Withdraw section */}
          {!showWithdraw ? (
            <Button variant="outline" className="w-full" onClick={() => setShowWithdraw(true)}>
              <ArrowUpRight className="size-4" />
              Withdraw
            </Button>
          ) : (
            <div className="space-y-4 rounded-xl border border-border p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">Withdraw LP Shares</h4>
                <button
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setShowWithdraw(false);
                    setWithdrawShares("");
                    setWithdrawError(null);
                  }}
                >
                  Cancel
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Shares to Withdraw</Label>
                  <button
                    className="text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => setWithdrawShares(shares.toFixed(7))}
                  >
                    Max: {fmtXlm(shares)}
                  </button>
                </div>
                <Input
                  type="number"
                  min="0"
                  max={shares}
                  step="0.0000001"
                  placeholder="0.00"
                  value={withdrawShares}
                  onChange={(e) => setWithdrawShares(e.target.value)}
                />
              </div>

              <div className="rounded-xl bg-muted/30 p-3 flex items-start gap-2">
                <Info className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Withdrawing burns your LP shares and returns the equivalent XLM plus any accrued yield.
                </p>
              </div>

              {withdrawError && (
                <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 flex items-start gap-2">
                  <AlertTriangle className="size-4 text-destructive mt-0.5 shrink-0" />
                  <p className="text-xs text-destructive">{withdrawError}</p>
                </div>
              )}

              <Button
                className="w-full"
                onClick={handleWithdraw}
                disabled={isWithdrawing || !withdrawShares || Number(withdrawShares) <= 0 || Number(withdrawShares) > shares}
              >
                {isWithdrawing ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ArrowUpRight className="size-4" />
                )}
                {isWithdrawing ? "Withdrawing..." : "Confirm Withdraw"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ================================================================== */
/*  Sub-components                                                     */
/* ================================================================== */

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  accent: string;
}) {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
            <Icon className={`size-5 ${accent}`} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
            <p className="text-lg font-bold tabular-nums">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
