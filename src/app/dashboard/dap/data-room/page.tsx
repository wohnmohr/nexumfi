"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Database,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Activity,
  BarChart3,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Percent,
  FileText,
  Landmark,
} from "lucide-react";
import {
  createBorrowClient,
  createVaultClient,
  createReceivableClient,
} from "@/lib/stellar-contracts";
import type { BorrowConfig } from "@/app/contracts/borrow_contract/src";
import type { VaultState } from "@/app/contracts/lending_vault/src";

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
/*  Protocol data type                                                 */
/* ------------------------------------------------------------------ */

interface ProtocolData {
  vaultState: VaultState;
  available: bigint;
  utilization: bigint;
  totalAssets: bigint;
  borrowConfig: BorrowConfig;
  totalLoans: bigint;
  totalMinted: bigint;
  totalActive: bigint;
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function DataRoomPage() {
  const [data, setData] = useState<ProtocolData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
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
      const receivableClient = createReceivableClient(verifierSecret);

      const [stateRes, availRes, utilRes, totalAssetsRes, configRes, loansRes, mintedRes, activeRes] =
        await Promise.all([
          vaultClient.get_state(),
          vaultClient.available(),
          vaultClient.utilization(),
          vaultClient.total_assets(),
          borrowClient.get_config(),
          borrowClient.total_loans(),
          receivableClient.total_minted(),
          receivableClient.total_active(),
        ]);

      setData({
        vaultState: stateRes.result,
        available: availRes.result,
        utilization: utilRes.result,
        totalAssets: totalAssetsRes.result,
        borrowConfig: configRes.result,
        totalLoans: loansRes.result,
        totalMinted: mintedRes.result,
        totalActive: activeRes.result,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch protocol data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ---- Loading ---- */
  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6 max-w-5xl">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">Data Room</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Transparent, real-time protocol metrics from on-chain contracts.
          </p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Loading protocol data...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ---- Error ---- */
  if (error || !data) {
    return (
      <div className="p-4 md:p-6 space-y-6 max-w-5xl">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">Data Room</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Transparent, real-time protocol metrics from on-chain contracts.
          </p>
        </div>
        <Card className="border-destructive/20">
          <CardContent className="flex items-center gap-3 py-6">
            <AlertTriangle className="size-5 text-destructive shrink-0" />
            <div>
              <p className="text-sm font-medium">Failed to load protocol data</p>
              <p className="text-xs text-muted-foreground mt-0.5">{error}</p>
            </div>
            <Button size="sm" variant="outline" className="ml-auto shrink-0" onClick={fetchData}>
              <RefreshCw className="size-3.5" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { vaultState, available, utilization, borrowConfig, totalLoans, totalMinted, totalActive } = data;

  const tvl = stroopsToXlm(vaultState.total_deposits);
  const borrowed = stroopsToXlm(vaultState.total_borrowed);
  const availableLiq = stroopsToXlm(available);
  const util = bpsToPercent(utilization);
  const interestEarned = stroopsToXlm(vaultState.total_interest_earned);
  const reserves = stroopsToXlm(vaultState.protocol_reserves);
  const reserveFactor = bpsToPercent(vaultState.reserve_factor);
  const apr = bpsToPercent(borrowConfig.base_interest_rate);
  const maxLtv = bpsToPercent(borrowConfig.max_ltv);
  const liqThreshold = bpsToPercent(borrowConfig.liquidation_threshold);
  const liqPenalty = bpsToPercent(borrowConfig.liquidation_penalty);
  const riskDiscount = bpsToPercent(borrowConfig.risk_discount_factor);
  const maxDuration = Number(borrowConfig.max_loan_duration) / 86400; // seconds to days

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">Data Room</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Transparent, real-time protocol metrics from on-chain contracts.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={fetchData}>
          <RefreshCw className="size-3.5" />
          Refresh
        </Button>
      </div>

      {/* ---- Protocol-level stats ---- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Value Locked" value={`${fmtXlm(tvl)} XLM`} icon={DollarSign} accent="text-primary" />
        <StatCard label="Total Borrowed" value={`${fmtXlm(borrowed)} XLM`} icon={BarChart3} accent="text-chart-2" />
        <StatCard label="Available Liquidity" value={`${fmtXlm(availableLiq)} XLM`} icon={Landmark} accent="text-emerald-500" />
        <StatCard label="Utilization" value={`${util.toFixed(1)}%`} icon={Activity} accent="text-chart-4" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Lending APR" value={`${apr.toFixed(1)}%`} icon={TrendingUp} accent="text-emerald-500" />
        <StatCard label="Max LTV" value={`${maxLtv.toFixed(0)}%`} icon={Percent} accent="text-chart-3" />
        <StatCard label="Total Loans" value={totalLoans.toString()} icon={Database} accent="text-primary" />
        <StatCard label="Total Receivables" value={totalMinted.toString()} icon={FileText} accent="text-chart-5" />
      </div>

      {/* ---- Vault State ---- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Landmark className="size-5 text-primary" />
            Lending Vault
          </CardTitle>
          <CardDescription>Current state of the XLM lending vault on Stellar testnet.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            <MetricRow label="Total Deposits" value={`${fmtXlm(tvl)} XLM`} />
            <MetricRow label="Total Borrowed" value={`${fmtXlm(borrowed)} XLM`} />
            <MetricRow label="Available Liquidity" value={`${fmtXlm(availableLiq)} XLM`} highlight />
            <MetricRow label="Utilization Rate" value={`${util.toFixed(1)}%`} />
            <MetricRow label="Total Interest Earned" value={`${fmtXlm(interestEarned)} XLM`} highlight />
            <MetricRow label="Protocol Reserves" value={`${fmtXlm(reserves)} XLM`} />
            <MetricRow label="Reserve Factor" value={`${reserveFactor.toFixed(1)}%`} />
            <MetricRow label="Total LP Shares" value={stroopsToXlm(vaultState.total_shares).toLocaleString("en-US", { maximumFractionDigits: 2 })} />
          </div>
        </CardContent>
      </Card>

      {/* ---- Borrow Configuration ---- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="size-5 text-chart-5" />
              Borrow Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-0">
            <MetricRow label="Base Interest Rate" value={`${apr.toFixed(1)}%`} />
            <MetricRow label="Max LTV" value={`${maxLtv.toFixed(0)}%`} highlight />
            <MetricRow label="Liquidation Threshold" value={`${liqThreshold.toFixed(0)}%`} />
            <MetricRow label="Liquidation Penalty" value={`${liqPenalty.toFixed(0)}%`} />
            <MetricRow label="Risk Discount Factor" value={`${riskDiscount.toFixed(1)}%`} />
            <MetricRow label="Max Loan Duration" value={`${maxDuration.toFixed(0)} days`} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="size-5 text-primary" />
              Receivable Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-0">
            <MetricRow label="Total Minted" value={totalMinted.toString()} />
            <MetricRow label="Active Receivables" value={totalActive.toString()} highlight />
            <MetricRow
              label="Settled / Defaulted"
              value={(Number(totalMinted) - Number(totalActive)).toString()}
            />
            <MetricRow label="Total Loans Created" value={totalLoans.toString()} />
          </CardContent>
        </Card>
      </div>
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

function MetricRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-semibold tabular-nums ${highlight ? "text-emerald-500" : ""}`}>
        {value}
      </span>
    </div>
  );
}
