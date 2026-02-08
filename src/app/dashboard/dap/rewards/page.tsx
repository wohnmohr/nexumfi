"use client";

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
  Gift,
  Star,
  Zap,
  Users,
  TrendingUp,
  Clock,
  Copy,
  CheckCircle2,
  ArrowRight,
  Flame,
} from "lucide-react";
import { useState } from "react";

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const POINTS_DATA = {
  totalPoints: 48_520,
  dailyRate: 385,
  rank: 1_247,
  totalParticipants: 52_340,
  multiplier: 2.5,
  season: 3,
  seasonEnd: "Mar 31, 2026",
  seasonProgress: 68,
};

const POINTS_BREAKDOWN = [
  { label: "Deposit Points", value: 32_100, icon: TrendingUp, color: "text-primary" },
  { label: "Referral Bonus", value: 8_420, icon: Users, color: "text-chart-2" },
  { label: "Streak Bonus", value: 5_200, icon: Flame, color: "text-orange-500" },
  { label: "Early Adopter", value: 2_800, icon: Star, color: "text-chart-3" },
];

const MILESTONES = [
  { points: 10_000, label: "Bronze", reached: true },
  { points: 25_000, label: "Silver", reached: true },
  { points: 50_000, label: "Gold", reached: false },
  { points: 100_000, label: "Platinum", reached: false },
  { points: 250_000, label: "Diamond", reached: false },
];

const REFERRAL_CODE = "NEXUM-A7X2K";

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function RewardsPage() {
  const [copied, setCopied] = useState(false);

  function copyReferral() {
    navigator.clipboard.writeText(REFERRAL_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Page header */}
      <div>
        <h1 className="text-xl md:text-2xl font-semibold">Rewards</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Earn points by depositing, referring friends, and maintaining streaks.
        </p>
      </div>

      {/* ---- Top stats row ---- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Points"
          value={POINTS_DATA.totalPoints.toLocaleString()}
          icon={Star}
          accent="text-primary"
        />
        <StatCard
          label="Daily Earning"
          value={`+${POINTS_DATA.dailyRate}`}
          sub="pts / day"
          icon={Zap}
          accent="text-chart-2"
        />
        <StatCard
          label="Multiplier"
          value={`${POINTS_DATA.multiplier}x`}
          icon={TrendingUp}
          accent="text-chart-3"
        />
        <StatCard
          label="Rank"
          value={`#${POINTS_DATA.rank.toLocaleString()}`}
          sub={`of ${POINTS_DATA.totalParticipants.toLocaleString()}`}
          icon={Gift}
          accent="text-chart-4"
        />
      </div>

      {/* ---- Season progress ---- */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Flame className="size-5 text-orange-500" />
              Season {POINTS_DATA.season}
            </CardTitle>
            <Badge variant="secondary" className="gap-1">
              <Clock className="size-3" />
              Ends {POINTS_DATA.seasonEnd}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Season Progress</span>
            <span className="font-medium">{POINTS_DATA.seasonProgress}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-chart-4 rounded-full transition-all duration-700"
              style={{ width: `${POINTS_DATA.seasonProgress}%` }}
            />
          </div>
          {/* Milestones */}
          <div className="flex items-center justify-between pt-2">
            {MILESTONES.map((m) => (
              <div key={m.label} className="flex flex-col items-center gap-1">
                <div
                  className={`size-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    m.reached
                      ? "bg-emerald-500/15 text-emerald-500"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {m.reached ? <CheckCircle2 className="size-3.5" /> : ""}
                </div>
                <span className={`text-[10px] font-medium ${m.reached ? "text-foreground" : "text-muted-foreground"}`}>
                  {m.label}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {(m.points / 1000).toFixed(0)}K
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ---- Points breakdown ---- */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Points Breakdown</CardTitle>
            <CardDescription>How you earned your points this season.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {POINTS_BREAKDOWN.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className={`size-9 rounded-lg bg-muted flex items-center justify-center shrink-0`}>
                  <item.icon className={`size-4 ${item.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{item.label}</p>
                </div>
                <span className="text-sm font-semibold tabular-nums">
                  {item.value.toLocaleString()}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ---- Referral ---- */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="size-5 text-primary" />
              Refer &amp; Earn
            </CardTitle>
            <CardDescription>
              Earn 10% of your referrals&apos; points. No cap.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-xl bg-muted/50 p-4 space-y-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Your Referral Code
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-lg font-mono font-semibold tracking-wider">
                  {REFERRAL_CODE}
                </code>
                <Button size="sm" variant="outline" onClick={copyReferral}>
                  {copied ? <CheckCircle2 className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-muted/50 p-3 text-center">
                <p className="text-2xl font-bold tabular-nums">12</p>
                <p className="text-xs text-muted-foreground mt-1">Referrals</p>
              </div>
              <div className="rounded-xl bg-muted/50 p-3 text-center">
                <p className="text-2xl font-bold tabular-nums text-chart-2">8,420</p>
                <p className="text-xs text-muted-foreground mt-1">Bonus Points</p>
              </div>
            </div>

            <Button className="w-full" variant="outline">
              Share Invite Link
              <ArrowRight className="size-4" />
            </Button>
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
  sub,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
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
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
              {label}
            </p>
            <div className="flex items-baseline gap-1">
              <p className="text-lg font-bold tabular-nums">{value}</p>
              {sub && <span className="text-[11px] text-muted-foreground">{sub}</span>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
