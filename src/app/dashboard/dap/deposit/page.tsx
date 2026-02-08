"use client";

import { useState, useEffect, useCallback } from "react";
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
  ArrowDownToLine,
  TrendingUp,
  DollarSign,
  Loader2,
  CheckCircle2,
  Info,
  Landmark,
  BarChart3,
  AlertTriangle,
  RefreshCw,
  Wallet,
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

export default function DepositPage() {
  // Wallet state
  const [walletKeys, setWalletKeys] = useState<{ publicKey: string; privateKey: string } | null>(null);
  const [walletMode, setWalletMode] = useState<"create" | "unlock">("create");
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [showPinDialog, setShowPinDialog] = useState(false);

  // Pool state
  const [vaultState, setVaultState] = useState<VaultState | null>(null);
  const [borrowConfig, setBorrowConfig] = useState<BorrowConfig | null>(null);
  const [lpPosition, setLpPosition] = useState<LPPosition | null>(null);
  const [lpValue, setLpValue] = useState<bigint | null>(null);
  const [xlmBalance, setXlmBalance] = useState<string | null>(null);

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState<{ txHash: string } | null>(null);
  const [depositError, setDepositError] = useState<string | null>(null);

  // Fetch XLM balance from Horizon
  const fetchBalance = useCallback(async (pubKey: string) => {
    try {
      const res = await fetch(`https://horizon-testnet.stellar.org/accounts/${pubKey}`);
      if (!res.ok) return;
      const data = await res.json();
      const native = data.balances?.find((b: { asset_type: string }) => b.asset_type === "native");
      if (native) setXlmBalance(native.balance);
    } catch {
      // ignore
    }
  }, []);

  // Fetch pool state + user LP position
  const fetchPoolData = useCallback(async (userPk?: string | null) => {
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

      const promises: Promise<unknown>[] = [
        vaultClient.get_state(),
        borrowClient.get_config(),
      ];

      // Fetch LP position if we have a public key
      if (userPk) {
        promises.push(vaultClient.get_lp({ depositor: userPk }));
      }

      const results = await Promise.all(promises);

      const stateRes = results[0] as Awaited<ReturnType<typeof vaultClient.get_state>>;
      const configRes = results[1] as Awaited<ReturnType<typeof borrowClient.get_config>>;

      setVaultState(stateRes.result);
      setBorrowConfig(configRes.result);

      if (userPk && results[2]) {
        const lpRes = results[2] as Awaited<ReturnType<typeof vaultClient.get_lp>>;
        const lp = lpRes.result;
        if (lp) {
          setLpPosition(lp);
          // Fetch share value
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
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch pool data");
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
      fetchBalance(wallet.publicKey);
      fetchPoolData(wallet.publicKey);
    } else {
      fetchPoolData(null);
    }
  }, [fetchBalance, fetchPoolData]);

  // Handle wallet unlock success
  const handleWalletUnlock = (keys: { publicKey: string; privateKey: string }) => {
    setWalletKeys(keys);
    setShowPinDialog(false);
    setPublicKey(keys.publicKey);
    fetchBalance(keys.publicKey);
    fetchPoolData(keys.publicKey);
  };

  // Handle deposit
  async function handleDeposit() {
    if (!amount || Number(amount) <= 0) return;

    // Need wallet unlocked to deposit
    if (!walletKeys) {
      setShowPinDialog(true);
      return;
    }

    setIsDepositing(true);
    setDepositError(null);
    setDepositSuccess(null);

    try {
      const vaultClient = createVaultClient(walletKeys.privateKey);
      const depositAmount = BigInt(Math.round(Number(amount) * 10_000_000));

      // Step 1: Simulate the deposit transaction
      const tx = await vaultClient.deposit({
        depositor: walletKeys.publicKey,
        amount: depositAmount,
      });

      // Step 2: Sign and submit to network
      const result = await tx.signAndSend();

      const resultVal = result.result;
      if (resultVal.isOk()) {
        const txHash = (result as unknown as { sendTransactionResponse?: { hash?: string } })
          .sendTransactionResponse?.hash || "confirmed";
        setDepositSuccess({ txHash });
        setAmount("");
      } else {
        setDepositError("Deposit transaction failed on-chain");
      }

      // Refresh data
      fetchBalance(walletKeys.publicKey);
      fetchPoolData(walletKeys.publicKey);
    } catch (err) {
      setDepositError(err instanceof Error ? err.message : "Deposit failed");
    } finally {
      setIsDepositing(false);
    }
  }

  // Computed values
  const tvl = vaultState ? stroopsToXlm(vaultState.total_deposits) : 0;
  const borrowed = vaultState ? stroopsToXlm(vaultState.total_borrowed) : 0;
  const availableLiq = vaultState ? tvl - borrowed : 0;
  const utilization = vaultState && tvl > 0 ? (borrowed / tvl) * 100 : 0;
  const apr = borrowConfig ? bpsToPercent(borrowConfig.base_interest_rate) : 0;

  /* ---- Wallet PIN dialog overlay ---- */
  if (showPinDialog && !walletKeys) {
    return (
      <div className="p-4 md:p-6 space-y-6 max-w-5xl">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">Deposit</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Unlock your wallet to deposit XLM into the lending vault.
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
          <h1 className="text-xl md:text-2xl font-semibold">Deposit</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Supply liquidity to the lending vault and earn yield.
          </p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Loading pool data...</span>
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
          <h1 className="text-xl md:text-2xl font-semibold">Deposit</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Supply liquidity to the lending vault and earn yield.
          </p>
        </div>
        <Card className="border-destructive/20">
          <CardContent className="flex items-center gap-3 py-6">
            <AlertTriangle className="size-5 text-destructive shrink-0" />
            <div>
              <p className="text-sm font-medium">Failed to load pool data</p>
              <p className="text-xs text-muted-foreground mt-0.5">{error}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="ml-auto shrink-0"
              onClick={() => fetchPoolData(publicKey)}
            >
              <RefreshCw className="size-3.5" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Page header */}
      <div>
        <h1 className="text-xl md:text-2xl font-semibold">Deposit</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Supply XLM to the lending vault and earn yield from borrower interest payments.
        </p>
      </div>

      {/* ---- Summary stats ---- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Deposited" value={`${fmtXlm(tvl)} XLM`} icon={DollarSign} accent="text-primary" />
        <StatCard label="Lending APR" value={`${apr.toFixed(1)}%`} icon={TrendingUp} accent="text-emerald-500" />
        <StatCard label="Utilization" value={`${utilization.toFixed(1)}%`} icon={BarChart3} accent="text-chart-4" />
        <StatCard label="Available" value={`${fmtXlm(availableLiq)} XLM`} icon={Landmark} accent="text-chart-2" />
      </div>

      {/* ---- Existing LP position ---- */}
      {lpPosition && (
        <Card className="border-emerald-500/20 bg-emerald-500/2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Wallet className="size-4 text-emerald-500" />
                Your Position
              </CardTitle>
              <Badge variant="secondary" className="text-emerald-500">Active</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">LP Shares</p>
                <p className="text-sm font-bold tabular-nums">{fmtXlm(stroopsToXlm(lpPosition.shares))}</p>
              </div>
              {lpValue !== null && (
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Current Value</p>
                  <p className="text-sm font-bold tabular-nums text-emerald-500">{fmtXlm(stroopsToXlm(lpValue))} XLM</p>
                </div>
              )}
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Deposited</p>
                <p className="text-sm font-bold tabular-nums">
                  {new Date(Number(lpPosition.deposit_timestamp) * 1000).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ---- Deposit form ---- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Deposit XLM</CardTitle>
          <CardDescription>
            Deposit native XLM into the lending vault. Your deposit earns yield from borrower interest payments.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {depositSuccess ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="size-14 rounded-2xl bg-emerald-500/15 flex items-center justify-center">
                <CheckCircle2 className="size-7 text-emerald-500" />
              </div>
              <h3 className="text-lg font-semibold">Deposit Successful</h3>
              <p className="text-sm text-muted-foreground text-center max-w-xs">
                Your XLM has been deposited into the lending vault. Yield will begin accruing immediately.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDepositSuccess(null)}
              >
                Make Another Deposit
              </Button>
            </div>
          ) : (
            <>
              {/* Pool metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-muted/50 p-3 text-center">
                  <p className="text-xs text-muted-foreground">APR</p>
                  <p className="text-lg font-bold text-emerald-500">{apr.toFixed(1)}%</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Utilization</p>
                  <p className="text-lg font-bold">{utilization.toFixed(1)}%</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Asset</p>
                  <p className="text-lg font-bold">XLM</p>
                </div>
              </div>

              {/* Amount input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Deposit Amount (XLM)</Label>
                  {xlmBalance && (
                    <button
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => {
                        // Leave some XLM for fees
                        const max = Math.max(0, Number(xlmBalance) - 2);
                        setAmount(max.toFixed(2));
                      }}
                    >
                      Balance: {Number(xlmBalance).toFixed(2)} XLM
                    </button>
                  )}
                </div>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                {amount && Number(amount) > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Estimated annual earnings:{" "}
                    <span className="text-emerald-500 font-medium">
                      {fmtXlm(Number(amount) * (apr / 100))} XLM
                    </span>
                  </p>
                )}
              </div>

              {/* Info note */}
              <div className="rounded-xl bg-muted/30 p-3 flex items-start gap-2">
                <Info className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Deposits can be withdrawn at any time by burning your LP shares. Yield accrues continuously from borrower interest.
                </p>
              </div>

              {/* Deposit error */}
              {depositError && (
                <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 flex items-start gap-2">
                  <AlertTriangle className="size-4 text-destructive mt-0.5 shrink-0" />
                  <p className="text-xs text-destructive">{depositError}</p>
                </div>
              )}

              {/* Deposit button */}
              <Button
                className="w-full"
                size="lg"
                onClick={handleDeposit}
                disabled={isDepositing || !amount || Number(amount) <= 0}
              >
                {isDepositing ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ArrowDownToLine className="size-4" />
                )}
                {isDepositing
                  ? "Depositing..."
                  : !publicKey
                    ? "Connect Wallet to Deposit"
                    : !walletKeys
                      ? "Unlock Wallet to Deposit"
                      : amount && Number(amount) > 0
                        ? `Deposit ${fmtXlm(Number(amount))} XLM`
                        : "Deposit"}
              </Button>
            </>
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
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
            <p className="text-lg font-bold tabular-nums">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
