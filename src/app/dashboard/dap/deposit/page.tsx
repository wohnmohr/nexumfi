"use client";

import { useState } from "react";
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
  Shield,
  Clock,
  DollarSign,
  Loader2,
  CheckCircle2,
  Info,
  Landmark,
  Percent,
  BarChart3,
  Lock,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Mock pool data                                                     */
/* ------------------------------------------------------------------ */

interface Pool {
  id: string;
  name: string;
  description: string;
  apy: number;
  tvl: number;
  utilization: number;
  minDeposit: number;
  lockup: string;
  risk: "Low" | "Medium" | "High";
  asset: string;
  totalDepositors: number;
}

const POOLS: Pool[] = [
  {
    id: "receivables-senior",
    name: "Receivables — Senior",
    description: "Senior tranche backed by verified trade receivables. First-loss protected.",
    apy: 12.5,
    tvl: 8_420_000,
    utilization: 78,
    minDeposit: 100,
    lockup: "30 days",
    risk: "Low",
    asset: "USDC",
    totalDepositors: 1_240,
  },
  {
    id: "receivables-junior",
    name: "Receivables — Junior",
    description: "Junior tranche with higher yield. Absorbs first-loss before senior.",
    apy: 22.8,
    tvl: 3_150_000,
    utilization: 85,
    minDeposit: 500,
    lockup: "90 days",
    risk: "Medium",
    asset: "USDC",
    totalDepositors: 620,
  },
  {
    id: "credit-line",
    name: "Credit Line Pool",
    description: "Backs short-term credit lines for verified buyers. Rolling 14-day terms.",
    apy: 18.4,
    tvl: 5_680_000,
    utilization: 72,
    minDeposit: 250,
    lockup: "14 days",
    risk: "Medium",
    asset: "USDC",
    totalDepositors: 890,
  },
  {
    id: "insurance-claims",
    name: "Insurance Claims Pool",
    description: "Funds tokenized insurance claim advances. Insurer-guaranteed repayment.",
    apy: 9.2,
    tvl: 12_300_000,
    utilization: 65,
    minDeposit: 100,
    lockup: "7 days",
    risk: "Low",
    asset: "USDC",
    totalDepositors: 2_100,
  },
];

const USER_DEPOSITS = {
  totalDeposited: 15_000,
  totalEarned: 1_248.5,
  activePositions: 2,
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function DepositPage() {
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const [amount, setAmount] = useState("");
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState(false);

  async function handleDeposit() {
    if (!selectedPool || !amount || Number(amount) < selectedPool.minDeposit) return;
    setIsDepositing(true);
    await new Promise((r) => setTimeout(r, 2500));
    setIsDepositing(false);
    setDepositSuccess(true);
    setTimeout(() => {
      setDepositSuccess(false);
      setSelectedPool(null);
      setAmount("");
    }, 3000);
  }

  function formatUSD(n: number) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Page header */}
      <div>
        <h1 className="text-xl md:text-2xl font-semibold">Deposit</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Supply liquidity to credit pools and earn yield on real-world receivables.
        </p>
      </div>

      {/* ---- Summary stats ---- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="py-4 flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <DollarSign className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Total Deposited</p>
              <p className="text-lg font-bold tabular-nums">{formatUSD(USER_DEPOSITS.totalDeposited)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 flex items-center gap-3">
            <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="size-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Total Earned</p>
              <p className="text-lg font-bold tabular-nums text-emerald-500">{formatUSD(USER_DEPOSITS.totalEarned)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 flex items-center gap-3">
            <div className="size-10 rounded-xl bg-chart-4/10 flex items-center justify-center">
              <BarChart3 className="size-5 text-chart-4" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Active Positions</p>
              <p className="text-lg font-bold tabular-nums">{USER_DEPOSITS.activePositions}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ---- Deposit modal / selected pool ---- */}
      {selectedPool && (
        <Card className="border-primary/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Deposit to {selectedPool.name}</CardTitle>
              <button
                onClick={() => { setSelectedPool(null); setAmount(""); setDepositSuccess(false); }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </div>
            <CardDescription>{selectedPool.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {!depositSuccess ? (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-muted/50 p-3 text-center">
                    <p className="text-xs text-muted-foreground">APY</p>
                    <p className="text-lg font-bold text-emerald-500">{selectedPool.apy}%</p>
                  </div>
                  <div className="rounded-xl bg-muted/50 p-3 text-center">
                    <p className="text-xs text-muted-foreground">Lockup</p>
                    <p className="text-lg font-bold">{selectedPool.lockup}</p>
                  </div>
                  <div className="rounded-xl bg-muted/50 p-3 text-center">
                    <p className="text-xs text-muted-foreground">Min</p>
                    <p className="text-lg font-bold">${selectedPool.minDeposit}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Deposit Amount ({selectedPool.asset})</Label>
                  <Input
                    type="number"
                    min={selectedPool.minDeposit}
                    step="0.01"
                    placeholder={`Min ${selectedPool.minDeposit} ${selectedPool.asset}`}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  {amount && Number(amount) > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Estimated annual earnings:{" "}
                      <span className="text-emerald-500 font-medium">
                        {formatUSD(Number(amount) * (selectedPool.apy / 100))}
                      </span>
                    </p>
                  )}
                </div>

                <div className="rounded-xl bg-muted/30 p-3 flex items-start gap-2">
                  <Info className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    Deposits are locked for {selectedPool.lockup}. Yield accrues daily and is claimable after the lockup period.
                  </p>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleDeposit}
                  disabled={isDepositing || !amount || Number(amount) < selectedPool.minDeposit}
                >
                  {isDepositing ? <Loader2 className="size-4 animate-spin" /> : <ArrowDownToLine className="size-4" />}
                  {isDepositing ? "Processing..." : `Deposit ${amount ? formatUSD(Number(amount)) : ""}`}
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 py-6">
                <div className="size-14 rounded-2xl bg-emerald-500/15 flex items-center justify-center">
                  <CheckCircle2 className="size-7 text-emerald-500" />
                </div>
                <h3 className="text-lg font-semibold">Deposit Successful</h3>
                <p className="text-sm text-muted-foreground text-center max-w-xs">
                  {formatUSD(Number(amount))} deposited to {selectedPool.name}. Yield will begin accruing immediately.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ---- Pool list ---- */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Available Pools</h2>
        {POOLS.map((pool) => (
          <Card key={pool.id} className="hover:border-primary/30 transition-colors">
            <CardContent className="py-5">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Pool info */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold">{pool.name}</h3>
                    <RiskBadge risk={pool.risk} />
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">{pool.description}</p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-4 gap-4 text-center shrink-0">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">APY</p>
                    <p className="text-sm font-bold text-emerald-500">{pool.apy}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">TVL</p>
                    <p className="text-sm font-bold">${(pool.tvl / 1_000_000).toFixed(1)}M</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Util.</p>
                    <p className="text-sm font-bold">{pool.utilization}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Lock</p>
                    <p className="text-sm font-bold">{pool.lockup}</p>
                  </div>
                </div>

                {/* CTA */}
                <Button
                  size="sm"
                  className="shrink-0"
                  onClick={() => {
                    setSelectedPool(pool);
                    setAmount("");
                    setDepositSuccess(false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  Deposit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Sub-components                                                     */
/* ================================================================== */

function RiskBadge({ risk }: { risk: Pool["risk"] }) {
  const colors = {
    Low: "text-emerald-500 bg-emerald-500/10",
    Medium: "text-amber-500 bg-amber-500/10",
    High: "text-red-500 bg-red-500/10",
  };
  return (
    <Badge variant="secondary" className={`text-[10px] ${colors[risk]}`}>
      <Shield className="size-2.5" />
      {risk} Risk
    </Badge>
  );
}
