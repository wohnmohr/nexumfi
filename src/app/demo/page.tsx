"use client";

import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  CreditCard,
  Lock,
  Mail,
  Eye,
  EyeOff,
  BarChart3,
  Wallet,
  Send,
  Settings,
  Shield,
  Zap,
  Globe,
  Smartphone,
  ArrowRight,
  Menu,
  X,
  Twitter,
  Github,
  Layers,
  Sparkles,
  Rocket,
  Star,
  ChevronRight,
  Heart,
  MessageCircle,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Area, AreaChart } from "recharts";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

// --- Chart data ---
const revenueData = [
  { month: "Jan", revenue: 4000, users: 2400 },
  { month: "Feb", revenue: 3000, users: 1398 },
  { month: "Mar", revenue: 5000, users: 3800 },
  { month: "Apr", revenue: 4780, users: 3908 },
  { month: "May", revenue: 5890, users: 4800 },
  { month: "Jun", revenue: 6390, users: 3800 },
  { month: "Jul", revenue: 7490, users: 4300 },
];

const chartConfig = {
  revenue: { label: "Revenue", color: "var(--color-primary)" },
  users: { label: "Users", color: "var(--color-accent)" },
} satisfies ChartConfig;

const portfolioData = [
  { time: "00:00", value: 45200 },
  { time: "04:00", value: 44800 },
  { time: "08:00", value: 46100 },
  { time: "12:00", value: 47300 },
  { time: "16:00", value: 46900 },
  { time: "20:00", value: 48200 },
  { time: "24:00", value: 49100 },
];

const portfolioConfig = {
  value: { label: "Portfolio", color: "var(--color-primary)" },
} satisfies ChartConfig;

// --- Transactions ---
const transactions = [
  { id: 1, type: "Sent", token: "SOL", amount: "-2.5", usd: "$245.00", to: "9xK3...mP2q", time: "2 min ago" },
  { id: 2, type: "Received", token: "USDC", amount: "+500.00", usd: "$500.00", from: "7bR1...nX4w", time: "15 min ago" },
  { id: 3, type: "Swap", token: "SOL → BONK", amount: "1.0 → 52M", usd: "$98.00", time: "1 hr ago" },
  { id: 4, type: "Staked", token: "SOL", amount: "-10.0", usd: "$980.00", time: "3 hrs ago" },
];

// --- Highlight stats ---
const stats = [
  { label: "Total Value", value: "$49,100.24", change: "+5.2%", up: true, icon: DollarSign },
  { label: "Active Users", value: "12,845", change: "+12.3%", up: true, icon: Users },
  { label: "Transactions", value: "8,432", change: "-2.1%", up: false, icon: Activity },
  { label: "Revenue", value: "$7,490", change: "+18.7%", up: true, icon: CreditCard },
];

export default function DemoPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* ==================== HEADER / NAVBAR ==================== */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Layers className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">Stellar</span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {["Dashboard", "Portfolio", "Swap", "Staking", "NFTs"].map((item) => (
              <button
                key={item}
                className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {item}
              </button>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon-sm" className="hidden md:flex">
              <Settings className="h-4 w-4" />
            </Button>
            <Button size="sm">
              <Wallet className="mr-1.5 h-4 w-4" />
              Connect
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-border bg-background px-4 py-3 md:hidden">
            {["Dashboard", "Portfolio", "Swap", "Staking", "NFTs"].map((item) => (
              <button
                key={item}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* ==================== ANNOUNCEMENT BANNER ==================== */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary via-accent to-[#F97316]">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] animate-[shimmer_3s_infinite]" />
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-4 py-2.5">
          <Sparkles className="h-4 w-4 text-white" />
          <p className="text-sm font-medium text-white">
            Stellar v2.0 is live — New staking rewards, improved swaps & more
          </p>
          <Button
            size="xs"
            className="bg-white/20 text-white hover:bg-white/30 border-white/20"
          >
            Learn more
            <ChevronRight className="ml-1 h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-8 p-4 md:p-8">

        {/* ==================== HERO BANNER ==================== */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c0e1a] via-[#131529] to-[#1a1040] p-8 md:p-14">
          {/* Animated background orbs */}
          <div className="absolute top-0 left-1/4 h-72 w-72 rounded-full bg-primary/15 blur-[100px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-accent/15 blur-[100px] animate-pulse [animation-delay:1s]" />
          <div className="absolute top-1/2 right-1/3 h-48 w-48 rounded-full bg-[#F97316]/10 blur-[80px] animate-pulse [animation-delay:2s]" />

          <div className="relative z-10 grid gap-8 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6">
              <Badge className="bg-primary/15 text-primary border-primary/20">
                <Rocket className="mr-1 h-3 w-3" />
                Built on Solana
              </Badge>
              <h1 className="text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
                The Future of<br />
                <span className="bg-gradient-to-r from-primary via-accent to-[#F97316] bg-clip-text text-transparent">
                  Digital Finance
                </span>
              </h1>
              <p className="max-w-lg text-lg text-white/60">
                Send, swap, stake, and manage your entire crypto portfolio with blazing-fast speeds and near-zero fees.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="lg" className="text-base">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="border-white/15 text-white hover:bg-white/5 hover:text-white text-base">
                  Watch Demo
                </Button>
              </div>
              {/* Trust badges */}
              <div className="flex items-center gap-6 pt-4">
                {[
                  { val: "2M+", label: "Users" },
                  { val: "$4B+", label: "Volume" },
                  { val: "0.001s", label: "Avg Speed" },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="text-xl font-bold text-white">{s.val}</p>
                    <p className="text-xs text-white/40">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating card stack */}
            <div className="relative hidden lg:flex lg:justify-center">
              <div className="relative">
                {/* Back card */}
                <div className="absolute -right-4 top-4 w-64 rounded-2xl border border-white/5 bg-white/5 p-5 backdrop-blur-sm rotate-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center">
                      <Activity className="h-4 w-4 text-accent" />
                    </div>
                    <span className="text-sm font-medium text-white/70">Swap Complete</span>
                  </div>
                  <p className="text-xs text-white/40">2 SOL → 1,200 USDC</p>
                </div>
                {/* Front card */}
                <div className="relative w-64 rounded-2xl border border-white/10 bg-white/[0.07] p-5 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Wallet className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-white">Portfolio</span>
                  </div>
                  <p className="text-2xl font-bold text-white">$49,100</p>
                  <p className="text-sm text-emerald-400 flex items-center gap-1 mt-1">
                    <ArrowUpRight className="h-3 w-3" /> +5.2% today
                  </p>
                  <div className="mt-4 h-12 w-full rounded-lg bg-gradient-to-r from-primary/20 via-accent/10 to-transparent" />
                </div>
                {/* Notification pill */}
                <div className="absolute -left-6 bottom-6 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 backdrop-blur-sm -rotate-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-white/80">Staking reward: +0.05 SOL</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== SCROLLING TICKER BANNER ==================== */}
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex animate-[scroll_20s_linear_infinite] whitespace-nowrap py-3">
            {[...Array(2)].map((_, setIdx) => (
              <div key={setIdx} className="flex shrink-0 items-center gap-8 px-4">
                {[
                  { name: "SOL", price: "$98.02", change: "+3.2%", up: true },
                  { name: "ETH", price: "$3,421", change: "+1.8%", up: true },
                  { name: "BTC", price: "$67,230", change: "-0.4%", up: false },
                  { name: "BONK", price: "$0.00002", change: "+15.8%", up: true },
                  { name: "JUP", price: "$0.40", change: "-1.4%", up: false },
                  { name: "RNDR", price: "$7.82", change: "+5.1%", up: true },
                  { name: "RAY", price: "$1.23", change: "+8.7%", up: true },
                  { name: "PYTH", price: "$0.35", change: "+2.3%", up: true },
                ].map((t) => (
                  <div key={`${setIdx}-${t.name}`} className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{t.name}</span>
                    <span className="text-sm text-muted-foreground">{t.price}</span>
                    <span className={`text-xs font-medium ${t.up ? "text-emerald-500" : "text-red-400"}`}>
                      {t.change}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ==================== HIGHLIGHT STAT CARDS ==================== */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/5">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription>{stat.label}</CardDescription>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center gap-1 text-xs mt-1">
                  {stat.up ? (
                    <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-500" />
                  )}
                  <span className={stat.up ? "text-emerald-500" : "text-red-500"}>
                    {stat.change}
                  </span>
                  <span className="text-muted-foreground">from last month</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ==================== MAIN CONTENT GRID ==================== */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Charts Section - 2 cols */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="revenue">
              <div className="flex items-center justify-between mb-4">
                <TabsList>
                  <TabsTrigger value="revenue">Revenue</TabsTrigger>
                  <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                </TabsList>
                <div className="flex gap-1">
                  <Badge variant="outline">7D</Badge>
                  <Badge variant="secondary">30D</Badge>
                  <Badge variant="outline">90D</Badge>
                </div>
              </div>

              <TabsContent value="revenue">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Revenue & Users
                    </CardTitle>
                    <CardDescription>Monthly performance overview</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="h-[300px] w-full">
                      <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} />
                        <YAxis tickLine={false} axisLine={false} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="users" stroke="var(--color-users)" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ChartContainer>
                  </CardContent>
                  <CardFooter className="text-sm text-muted-foreground">
                    <TrendingUp className="mr-1 h-4 w-4 text-emerald-500" />
                    Trending up by 18.7% this month
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="portfolio">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-primary" />
                      Portfolio Value
                    </CardTitle>
                    <CardDescription>24h price movement</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={portfolioConfig} className="h-[300px] w-full">
                      <AreaChart data={portfolioData}>
                        <defs>
                          <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="time" tickLine={false} axisLine={false} />
                        <YAxis tickLine={false} axisLine={false} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area type="monotone" dataKey="value" stroke="var(--color-value)" strokeWidth={2} fill="url(#portfolioGradient)" />
                      </AreaChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your latest activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                          <Send className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {tx.type}{" "}
                            <span className="text-muted-foreground">{tx.token}</span>
                          </p>
                          <p className="text-xs text-muted-foreground">{tx.time}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${tx.amount.startsWith("+") ? "text-emerald-500" : tx.amount.startsWith("-") ? "text-red-400" : "text-foreground"}`}>
                          {tx.amount}
                        </p>
                        <p className="text-xs text-muted-foreground">{tx.usd}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Login Form */}
            <Card>
              <CardHeader>
                <CardTitle>Sign In</CardTitle>
                <CardDescription>Access your dashboard account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="you@example.com" className="pl-9" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="password" type={showPassword ? "text" : "password"} placeholder="Enter password" className="pl-9 pr-9" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button className="w-full">Sign In</Button>
                <Button variant="outline" className="w-full">Create Account</Button>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground justify-center">
                Forgot your password?
              </CardFooter>
            </Card>

            {/* Token Holdings */}
            <Card>
              <CardHeader>
                <CardTitle>Holdings</CardTitle>
                <CardDescription>Your token balances</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { token: "SOL", balance: "24.5", usd: "$2,401.00", change: "+3.2%", initials: "SO" },
                  { token: "USDC", balance: "1,250.00", usd: "$1,250.00", change: "0.0%", initials: "US" },
                  { token: "BONK", balance: "52,000,000", usd: "$420.00", change: "+15.8%", initials: "BK" },
                  { token: "JUP", balance: "800", usd: "$320.00", change: "-1.4%", initials: "JU" },
                ].map((item) => (
                  <div key={item.token} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">{item.initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{item.token}</p>
                        <p className="text-xs text-muted-foreground">{item.balance}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{item.usd}</p>
                      <p className={`text-xs ${item.change.startsWith("+") ? "text-emerald-500" : item.change.startsWith("-") ? "text-red-400" : "text-muted-foreground"}`}>
                        {item.change}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Button Variants */}
            <Card>
              <CardHeader>
                <CardTitle>Button Variants</CardTitle>
                <CardDescription>All available styles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full">Primary</Button>
                <Button variant="secondary" className="w-full">Secondary</Button>
                <Button variant="outline" className="w-full">Outline</Button>
                <Button variant="ghost" className="w-full">Ghost</Button>
                <Button variant="destructive" className="w-full">Destructive</Button>
                <Button variant="link" className="w-full">Link</Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ==================== ANIMATED LANDING CARDS ==================== */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Landing Page Components</h2>
          <p className="text-muted-foreground mb-6">Animated cards with hover effects</p>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Card 1 — Pulse glow on hover */}
            <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-500 hover:border-primary/40 hover:shadow-[0_0_40px_-10px] hover:shadow-primary/20">
              <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-primary/5 transition-all duration-700 group-hover:bg-primary/10 group-hover:scale-150" />
              <div className="relative z-10">
                <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">Enterprise Security</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Multi-layer encryption with hardware wallet support. Your keys never leave your device.
                </p>
                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-all duration-300 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0">
                  Learn more <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Card 2 — Border gradient sweep */}
            <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-500 hover:border-accent/40 hover:shadow-[0_0_40px_-10px] hover:shadow-accent/20">
              <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-accent/5 transition-all duration-700 group-hover:bg-accent/10 group-hover:scale-150" />
              <div className="relative z-10">
                <div className="mb-4 inline-flex rounded-xl bg-accent/10 p-3 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
                  <Zap className="h-6 w-6 text-accent" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">Lightning Swaps</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Trade any SPL token with the best rates aggregated across all Solana DEXs instantly.
                </p>
                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-accent opacity-0 transition-all duration-300 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0">
                  Try swap <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Card 3 — Float up on hover */}
            <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-500 hover:border-[#F97316]/40 hover:shadow-[0_0_40px_-10px] hover:shadow-[#F97316]/20 hover:-translate-y-1">
              <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-[#F97316]/5 transition-all duration-700 group-hover:bg-[#F97316]/10 group-hover:scale-150" />
              <div className="relative z-10">
                <div className="mb-4 inline-flex rounded-xl bg-[#F97316]/10 p-3 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                  <Globe className="h-6 w-6 text-[#F97316]" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">DeFi Dashboard</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Track positions, staking rewards, and NFTs from a single unified dashboard.
                </p>
                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-[#F97316] opacity-0 transition-all duration-300 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0">
                  Explore <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== BRIGHT SHOWCASE CARDS ==================== */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Phone Mockup Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-accent p-8 md:p-12 flex items-center justify-center min-h-[420px]">
            <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-accent/20 blur-3xl" />

            <div className="relative z-10 w-[220px] rounded-[2rem] border-4 border-white/20 bg-background p-3 shadow-2xl">
              <div className="flex items-center justify-between px-2 pb-2 text-[10px] text-muted-foreground">
                <span>9:41</span>
                <div className="flex gap-1">
                  <div className="h-1.5 w-3 rounded-sm bg-foreground/50" />
                  <div className="h-1.5 w-3 rounded-sm bg-foreground/50" />
                  <div className="h-1.5 w-3 rounded-sm bg-foreground/30" />
                </div>
              </div>
              <div className="rounded-xl bg-card p-3 mb-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <Wallet className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-[10px] font-semibold text-foreground">Stellar Wallet</span>
                </div>
                <p className="text-[9px] text-muted-foreground">Total Balance</p>
                <p className="text-lg font-bold text-foreground">$49,100.24</p>
                <p className="text-[9px] text-emerald-500">+5.2% today</p>
              </div>
              <div className="grid grid-cols-3 gap-1.5 mb-2">
                {[{ icon: Send, label: "Send" }, { icon: ArrowDownRight, label: "Receive" }, { icon: Activity, label: "Swap" }].map((action) => (
                  <div key={action.label} className="flex flex-col items-center gap-0.5 rounded-lg bg-card p-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                      <action.icon className="h-2.5 w-2.5 text-primary" />
                    </div>
                    <span className="text-[8px] text-muted-foreground">{action.label}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-1.5 rounded-xl bg-card p-2">
                {[
                  { name: "SOL", amt: "$2,401", pct: "+3.2%" },
                  { name: "USDC", amt: "$1,250", pct: "0.0%" },
                  { name: "BONK", amt: "$420", pct: "+15.8%" },
                ].map((t) => (
                  <div key={t.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="h-4 w-4 rounded-full bg-primary/15 flex items-center justify-center">
                        <span className="text-[6px] font-bold text-primary">{t.name[0]}</span>
                      </div>
                      <span className="text-[9px] font-medium text-foreground">{t.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-foreground">{t.amt}</span>
                      <p className={`text-[7px] ${t.pct.startsWith("+") ? "text-emerald-500" : "text-muted-foreground"}`}>{t.pct}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-around pt-3 border-t border-border mt-3">
                {[Wallet, Activity, BarChart3, Settings].map((Icon, i) => (
                  <Icon key={i} className={`h-3.5 w-3.5 ${i === 0 ? "text-primary" : "text-muted-foreground"}`} />
                ))}
              </div>
            </div>
          </div>

          {/* Promo CTA Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent via-accent/80 to-[#F43F5E] p-8 md:p-12 flex flex-col justify-between min-h-[420px]">
            <div className="absolute top-10 right-10 h-40 w-40 rounded-full border border-white/10" />
            <div className="absolute top-16 right-16 h-28 w-28 rounded-full border border-white/10" />
            <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-white/5 blur-2xl" />

            <div className="relative z-10 space-y-4">
              <Badge className="bg-white/20 text-white border-white/20 hover:bg-white/30">New Release</Badge>
              <h3 className="text-3xl font-bold text-white leading-tight">
                Your Crypto,<br />Your Control.
              </h3>
              <p className="text-white/70 max-w-sm">
                The most trusted non-custodial wallet on Solana. Manage tokens, NFTs, staking, and DeFi — all in one place.
              </p>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row gap-3 mt-8">
              <Button className="bg-white text-accent hover:bg-white/90 font-semibold">
                <Smartphone className="mr-2 h-4 w-4" />
                Download App
              </Button>
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 hover:text-white">
                View Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="relative z-10 grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/15">
              {[{ label: "Users", val: "2M+" }, { label: "Transactions", val: "50M+" }, { label: "Countries", val: "180+" }].map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-bold text-white">{s.val}</p>
                  <p className="text-xs text-white/60">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ==================== SOCIAL PROOF / TESTIMONIALS BANNER ==================== */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-8 md:p-12">
          <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-primary/5 blur-[80px]" />
          <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-accent/5 blur-[80px]" />

          <div className="relative z-10 text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">Loved by the Community</h2>
            <p className="text-muted-foreground mt-2">See what builders and traders are saying</p>
          </div>

          <div className="relative z-10 grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { name: "Alex T.", handle: "@alext_sol", text: "Best wallet UX on Solana. The swap aggregation alone saved me hundreds in fees.", stars: 5, color: "primary" },
              { name: "Maya K.", handle: "@mayak_dev", text: "Finally a wallet that looks as good as it performs. The staking dashboard is incredible.", stars: 5, color: "accent" },
              { name: "James R.", handle: "@jamesr_nft", text: "Switched from Phantom and never looked back. The NFT gallery view is unmatched.", stars: 4, color: "[#F97316]" },
            ].map((review) => (
              <div key={review.handle} className="rounded-xl border border-border bg-background p-5 transition-all duration-300 hover:border-primary/30">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className={`bg-${review.color}/10 text-${review.color} text-sm font-semibold`}>
                      {review.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{review.name}</p>
                    <p className="text-xs text-muted-foreground">{review.handle}</p>
                  </div>
                </div>
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: review.stars }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                  {Array.from({ length: 5 - review.stars }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 text-muted-foreground/30" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{review.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ==================== CTA BANNER ==================== */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#F97316] via-[#F43F5E] to-accent p-8 md:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
          <div className="relative z-10 flex flex-col items-center text-center gap-6 md:flex-row md:text-left md:justify-between">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white md:text-3xl">Ready to dive in?</h3>
              <p className="text-white/70 max-w-md">
                Join 2 million users and experience the fastest, most beautiful wallet on Solana.
              </p>
            </div>
            <div className="flex gap-3">
              <Button size="lg" className="bg-white text-[#F43F5E] hover:bg-white/90 font-semibold">
                Get Started Free
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 hover:text-white">
                Contact Sales
              </Button>
            </div>
          </div>
        </div>

        {/* ==================== COLOR PALETTE ==================== */}
        <Card>
          <CardHeader>
            <CardTitle>Theme Colors</CardTitle>
            <CardDescription>Current palette</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
              {[
                { name: "Primary", className: "bg-primary" },
                { name: "Accent", className: "bg-accent" },
                { name: "Secondary", className: "bg-secondary" },
                { name: "Muted", className: "bg-muted" },
                { name: "Destructive", className: "bg-destructive" },
                { name: "Chart 3", className: "bg-chart-3" },
                { name: "Chart 4", className: "bg-chart-4" },
                { name: "Chart 5", className: "bg-chart-5" },
              ].map((color) => (
                <div key={color.name} className="text-center space-y-1.5">
                  <div className={`h-12 w-full rounded-lg ${color.className} ring-1 ring-white/10`} />
                  <p className="text-xs text-muted-foreground">{color.name}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ==================== FOOTER ==================== */}
      <footer className="mt-16 border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
            {/* Brand */}
            <div className="col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Layers className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold text-foreground">Stellar</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs">
                The most trusted non-custodial wallet for Solana. Fast, secure, and beautiful.
              </p>
              <div className="flex gap-3 mt-4">
                {[Twitter, Github, MessageCircle].map((Icon, i) => (
                  <button key={i} className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary">
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>

            {/* Links */}
            {[
              { title: "Product", links: ["Wallet", "Swap", "Staking", "NFT Gallery", "Mobile App"] },
              { title: "Resources", links: ["Documentation", "API Reference", "Status", "Changelog", "Blog"] },
              { title: "Company", links: ["About", "Careers", "Press", "Contact", "Partners"] },
            ].map((section) => (
              <div key={section.title}>
                <h4 className="text-sm font-semibold text-foreground mb-3">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link}>
                      <button className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <Separator className="my-8" />

          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-xs text-muted-foreground">
              &copy; 2026 Stellar. All rights reserved.
            </p>
            <div className="flex gap-4">
              {["Privacy", "Terms", "Cookies"].map((item) => (
                <button key={item} className="text-xs text-muted-foreground transition-colors hover:text-foreground">
                  {item}
                </button>
              ))}
            </div>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              Made with <Heart className="h-3 w-3 text-[#F43F5E]" /> on Solana
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
