"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PieChart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  BarChart3,
  Activity,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const PORTFOLIO = {
  totalValue: 16_248.5,
  totalDeposited: 15_000,
  totalEarned: 1_248.5,
  pnlPercent: 8.32,
  activePositions: 2,
  pendingRewards: 385,
};

const POSITIONS = [
  {
    id: "pos-1",
    pool: "Receivables — Senior",
    deposited: 10_000,
    currentValue: 10_625,
    earned: 625,
    apy: 12.5,
    status: "active" as const,
    depositDate: "Dec 15, 2025",
    maturity: "Jan 14, 2026",
    lockup: "30 days",
    asset: "USDC",
  },
  {
    id: "pos-2",
    pool: "Insurance Claims Pool",
    deposited: 5_000,
    currentValue: 5_623.5,
    earned: 623.5,
    apy: 9.2,
    status: "active" as const,
    depositDate: "Nov 28, 2025",
    maturity: "Dec 5, 2025",
    lockup: "7 days",
    asset: "USDC",
  },
];

const TRANSACTIONS = [
  { id: "tx-1", type: "deposit" as const, pool: "Receivables — Senior", amount: 10_000, date: "Dec 15, 2025" },
  { id: "tx-2", type: "deposit" as const, pool: "Insurance Claims Pool", amount: 5_000, date: "Nov 28, 2025" },
  { id: "tx-3", type: "yield" as const, pool: "Insurance Claims Pool", amount: 38.2, date: "Dec 5, 2025" },
  { id: "tx-4", type: "yield" as const, pool: "Receivables — Senior", amount: 51.6, date: "Jan 1, 2026" },
  { id: "tx-5", type: "withdraw" as const, pool: "Credit Line Pool", amount: 2_500, date: "Nov 20, 2025" },
];

function formatUSD(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n);
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function PortfolioPage() {
  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Page header */}
      <div>
        <h1 className="text-xl md:text-2xl font-semibold">Portfolio</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track your positions, earnings, and transaction history.
        </p>
      </div>

      {/* ---- Overview stats ---- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Portfolio Value"
          value={formatUSD(PORTFOLIO.totalValue)}
          icon={Wallet}
          accent="text-primary"
        />
        <StatCard
          label="Total Earned"
          value={formatUSD(PORTFOLIO.totalEarned)}
          icon={TrendingUp}
          accent="text-emerald-500"
        />
        <StatCard
          label="P&L"
          value={`+${PORTFOLIO.pnlPercent}%`}
          icon={BarChart3}
          accent="text-emerald-500"
        />
        <StatCard
          label="Pending Rewards"
          value={`${PORTFOLIO.pendingRewards} pts`}
          icon={Activity}
          accent="text-chart-4"
        />
      </div>

      {/* ---- Active positions ---- */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Active Positions</h2>
        {POSITIONS.map((pos) => (
          <Card key={pos.id}>
            <CardContent className="py-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold">{pos.pool}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Deposited {pos.depositDate} &middot; {pos.lockup} lock
                  </p>
                </div>
                <Badge variant="secondary" className="text-emerald-500 shrink-0">
                  Active
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Deposited</p>
                  <p className="text-sm font-bold tabular-nums">{formatUSD(pos.deposited)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Current Value</p>
                  <p className="text-sm font-bold tabular-nums">{formatUSD(pos.currentValue)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Earned</p>
                  <p className="text-sm font-bold tabular-nums text-emerald-500">+{formatUSD(pos.earned)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">APY</p>
                  <p className="text-sm font-bold tabular-nums text-emerald-500">{pos.apy}%</p>
                </div>
              </div>

              {/* Progress bar for lockup */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="size-3" /> Maturity
                  </span>
                  <span className="font-medium">{pos.maturity}</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-emerald-500/60 rounded-full" style={{ width: "70%" }} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ---- Transaction history ---- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Transaction History</CardTitle>
          <CardDescription>Recent deposits, withdrawals, and yield payouts.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {TRANSACTIONS.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 py-3 border-b border-border last:border-0">
                <div
                  className={`size-9 rounded-lg flex items-center justify-center shrink-0 ${
                    tx.type === "deposit"
                      ? "bg-primary/10 text-primary"
                      : tx.type === "yield"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {tx.type === "deposit" ? (
                    <ArrowDownRight className="size-4" />
                  ) : tx.type === "yield" ? (
                    <TrendingUp className="size-4" />
                  ) : (
                    <ArrowUpRight className="size-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium capitalize">{tx.type}</p>
                  <p className="text-xs text-muted-foreground truncate">{tx.pool}</p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-semibold tabular-nums ${
                      tx.type === "withdraw" ? "text-foreground" : tx.type === "yield" ? "text-emerald-500" : "text-foreground"
                    }`}
                  >
                    {tx.type === "withdraw" ? "-" : tx.type === "yield" ? "+" : ""}
                    {formatUSD(tx.amount)}
                  </p>
                  <p className="text-xs text-muted-foreground">{tx.date}</p>
                </div>
              </div>
            ))}
          </div>
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
