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
  Database,
  TrendingUp,
  DollarSign,
  Users,
  ShieldCheck,
  Activity,
  BarChart3,
  ArrowUpRight,
  Percent,
  FileText,
  Globe,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Mock protocol metrics                                              */
/* ------------------------------------------------------------------ */

const PROTOCOL_STATS = {
  tvl: 29_550_000,
  totalVolume: 142_800_000,
  totalTransactions: 18_420,
  activeBorrowers: 342,
  activeLenders: 4_850,
  totalPools: 4,
  avgApy: 15.7,
  defaultRate: 0.8,
};

const POOL_PERFORMANCE = [
  {
    name: "Receivables — Senior",
    tvl: 8_420_000,
    apy: 12.5,
    utilization: 78,
    defaultRate: 0.2,
    totalLoans: 156,
    avgLoanSize: 54_000,
    thirtyDayVolume: 4_200_000,
    status: "healthy" as const,
  },
  {
    name: "Receivables — Junior",
    tvl: 3_150_000,
    apy: 22.8,
    utilization: 85,
    defaultRate: 1.4,
    totalLoans: 89,
    avgLoanSize: 35_400,
    thirtyDayVolume: 2_100_000,
    status: "healthy" as const,
  },
  {
    name: "Credit Line Pool",
    tvl: 5_680_000,
    apy: 18.4,
    utilization: 72,
    defaultRate: 0.9,
    totalLoans: 210,
    avgLoanSize: 27_000,
    thirtyDayVolume: 5_800_000,
    status: "healthy" as const,
  },
  {
    name: "Insurance Claims Pool",
    tvl: 12_300_000,
    apy: 9.2,
    utilization: 65,
    defaultRate: 0.3,
    totalLoans: 480,
    avgLoanSize: 25_600,
    thirtyDayVolume: 8_400_000,
    status: "healthy" as const,
  },
];

const CREDIT_HISTORY = [
  { month: "Aug 2025", originated: 8_200_000, repaid: 7_900_000, defaulted: 65_000, rate: 0.8 },
  { month: "Sep 2025", originated: 9_100_000, repaid: 8_800_000, defaulted: 72_000, rate: 0.8 },
  { month: "Oct 2025", originated: 10_500_000, repaid: 10_100_000, defaulted: 84_000, rate: 0.8 },
  { month: "Nov 2025", originated: 11_800_000, repaid: 11_400_000, defaulted: 94_000, rate: 0.8 },
  { month: "Dec 2025", originated: 12_400_000, repaid: 12_000_000, defaulted: 99_000, rate: 0.8 },
  { month: "Jan 2026", originated: 13_200_000, repaid: 12_700_000, defaulted: 52_000, rate: 0.4 },
];

const BORROWER_STATS = {
  avgCreditScore: 742,
  verifiedBorrowers: 298,
  unverifiedBorrowers: 44,
  avgLoanTerm: 28,
  repaymentRate: 99.2,
  countries: 12,
};

function formatUSD(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function formatFull(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function DataRoomPage() {
  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Page header */}
      <div>
        <h1 className="text-xl md:text-2xl font-semibold">Data Room</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Transparent, real-time protocol metrics and pool performance data.
        </p>
      </div>

      {/* ---- Protocol-level stats ---- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Value Locked" value={formatUSD(PROTOCOL_STATS.tvl)} icon={DollarSign} accent="text-primary" />
        <StatCard label="Total Volume" value={formatUSD(PROTOCOL_STATS.totalVolume)} icon={BarChart3} accent="text-chart-2" />
        <StatCard label="Avg. APY" value={`${PROTOCOL_STATS.avgApy}%`} icon={TrendingUp} accent="text-emerald-500" />
        <StatCard label="Default Rate" value={`${PROTOCOL_STATS.defaultRate}%`} icon={ShieldCheck} accent="text-chart-3" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Transactions" value={PROTOCOL_STATS.totalTransactions.toLocaleString()} icon={Activity} accent="text-chart-4" />
        <StatCard label="Active Borrowers" value={PROTOCOL_STATS.activeBorrowers.toLocaleString()} icon={Users} accent="text-primary" />
        <StatCard label="Active Lenders" value={PROTOCOL_STATS.activeLenders.toLocaleString()} icon={Users} accent="text-chart-2" />
        <StatCard label="Total Pools" value={PROTOCOL_STATS.totalPools.toString()} icon={Database} accent="text-chart-5" />
      </div>

      {/* ---- Pool performance table ---- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="size-5 text-primary" />
            Pool Performance
          </CardTitle>
          <CardDescription>Real-time metrics for each credit pool.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">Pool</th>
                  <th className="text-right py-3 px-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">TVL</th>
                  <th className="text-right py-3 px-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">APY</th>
                  <th className="text-right py-3 px-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">Util.</th>
                  <th className="text-right py-3 px-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">Default</th>
                  <th className="text-right py-3 px-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">Loans</th>
                  <th className="text-right py-3 px-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">30d Vol.</th>
                  <th className="text-center py-3 px-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {POOL_PERFORMANCE.map((pool) => (
                  <tr key={pool.name} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-2 font-medium">{pool.name}</td>
                    <td className="py-3 px-2 text-right tabular-nums">{formatUSD(pool.tvl)}</td>
                    <td className="py-3 px-2 text-right tabular-nums text-emerald-500 font-medium">{pool.apy}%</td>
                    <td className="py-3 px-2 text-right tabular-nums">{pool.utilization}%</td>
                    <td className="py-3 px-2 text-right tabular-nums">{pool.defaultRate}%</td>
                    <td className="py-3 px-2 text-right tabular-nums">{pool.totalLoans}</td>
                    <td className="py-3 px-2 text-right tabular-nums">{formatUSD(pool.thirtyDayVolume)}</td>
                    <td className="py-3 px-2 text-center">
                      <Badge variant="secondary" className="text-emerald-500 text-[10px]">
                        <CheckCircle2 className="size-2.5" />
                        Healthy
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ---- Credit history ---- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="size-5 text-chart-2" />
            Credit Origination History
          </CardTitle>
          <CardDescription>Monthly credit origination, repayments, and defaults.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">Month</th>
                  <th className="text-right py-3 px-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">Originated</th>
                  <th className="text-right py-3 px-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">Repaid</th>
                  <th className="text-right py-3 px-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">Defaulted</th>
                  <th className="text-right py-3 px-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">Default Rate</th>
                </tr>
              </thead>
              <tbody>
                {CREDIT_HISTORY.map((row) => (
                  <tr key={row.month} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-2 font-medium">{row.month}</td>
                    <td className="py-3 px-2 text-right tabular-nums">{formatFull(row.originated)}</td>
                    <td className="py-3 px-2 text-right tabular-nums text-emerald-500">{formatFull(row.repaid)}</td>
                    <td className="py-3 px-2 text-right tabular-nums text-destructive">{formatFull(row.defaulted)}</td>
                    <td className="py-3 px-2 text-right tabular-nums">{row.rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ---- Borrower stats ---- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="size-5 text-primary" />
              Borrower Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <MetricRow label="Avg. Credit Score" value={BORROWER_STATS.avgCreditScore.toString()} />
            <MetricRow label="Verified Borrowers" value={BORROWER_STATS.verifiedBorrowers.toString()} />
            <MetricRow label="Pending Verification" value={BORROWER_STATS.unverifiedBorrowers.toString()} />
            <MetricRow label="Avg. Loan Term" value={`${BORROWER_STATS.avgLoanTerm} days`} />
            <MetricRow label="Repayment Rate" value={`${BORROWER_STATS.repaymentRate}%`} highlight />
            <MetricRow label="Countries Served" value={BORROWER_STATS.countries.toString()} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="size-5 text-chart-5" />
              Risk Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <MetricRow label="Protocol Default Rate" value={`${PROTOCOL_STATS.defaultRate}%`} />
            <MetricRow label="Credit Utilization" value="74%" />
            <MetricRow label="Collateral Coverage" value="125%" highlight />
            <MetricRow label="Insurance-Backed %" value="42%" />
            <MetricRow label="Avg. Days to Repayment" value="18 days" />
            <MetricRow label="Risk-Adjusted Return" value="14.2%" highlight />
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
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
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
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-semibold tabular-nums ${highlight ? "text-emerald-500" : ""}`}>
        {value}
      </span>
    </div>
  );
}
