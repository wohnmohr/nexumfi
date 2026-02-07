import Link from "next/link";
import {
  Building2,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { AppLogo } from "@/components/layout/app-logo";
import { Button } from "@/components/ui/button";

/* ------------------------------------------------------------------ */
/*  Public landing page — role selection                               */
/* ------------------------------------------------------------------ */

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ---- Top Banner ---- */}
      <div className="bg-gradient-to-r from-primary/90 via-primary to-primary/80 text-primary-foreground">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-center gap-2 text-sm font-medium">
          <Sparkles className="size-4 shrink-0" />
          <span>
            Your receivables. Your runway. — Built for vendors & policy holders
          </span>
        </div>
      </div>

      {/* ---- Header ---- */}
      <header className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
        <AppLogo href="/" className="text-foreground" />
        <Button asChild variant="outline" className="border-primary text-primary bg-primary/10 hover:bg-primary/20 hover:border-primary">
          <Link href="/login">Sign In</Link>
        </Button>
      </header>

      {/* ---- Hero ---- */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-16">
        <div className="text-center mb-12 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary mb-6">
            <CheckCircle2 className="size-3.5" />
            Funded by what you&apos;re owed
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            Stop waiting for payment.
            <br />
            <span className="text-primary">Get funded now.</span>
          </h1>
          <p className="text-muted-foreground mt-4 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Turn invoices and claims into cash. Minutes, not months. Built for
            vendors and policy holders who don&apos;t want to wait.
          </p>
        </div>

        {/* ---- Role cards ---- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-2xl sm:items-stretch">
          {/* Vendor Company card */}
          <Link
            href="/signup?role=vendor"
            className="group relative flex flex-col rounded-2xl border border-border bg-card p-6 sm:p-8 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
          >
            <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
              <Building2 className="size-6 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">I&apos;m a Vendor</h2>
            <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
              Invoices stuck in limbo? Turn them into cash. Same-day credit, no
              more chasing.
            </p>
            <ul className="space-y-2.5 mb-6">
              <BulletItem text="Credit against invoices — instantly" />
              <BulletItem text="Minutes, not weeks" />
              <BulletItem text="Transparent. No hidden fees." />
            </ul>
            <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-primary group-hover:gap-2.5 transition-all">
              Get funded
              <ArrowRight className="size-4" />
            </span>
          </Link>

          {/* Policy Holder card */}
          <Link
            href="/signup?role=insurer"
            className="group relative flex flex-col rounded-2xl border border-border bg-card p-6 sm:p-8 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
          >
            <div className="size-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-5">
              <ShieldCheck className="size-6 text-emerald-500" />
            </div>
            <h2 className="text-xl font-semibold mb-2">
              I&apos;m a Policy Holder
            </h2>
            <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
              Claim pending? Don&apos;t wait. Get your funds now — bridge the gap
              until settlement.
            </p>
            <ul className="space-y-2.5 mb-6">
              <BulletItem text="Credit against claims — fast" />
              <BulletItem text="Verify once, fund fast" />
              <BulletItem text="No more waiting on slow payouts" />
            </ul>
            <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-emerald-500 group-hover:gap-2.5 transition-all">
              Get funded
              <ArrowRight className="size-4" />
            </span>
          </Link>
        </div>

        {/* ---- Existing account ---- */}
        <p className="text-sm text-muted-foreground mt-10">
          Been here before?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </main>

      {/* ---- Footer ---- */}
      <footer className="border-t border-border bg-muted/30">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <AppLogo href="/" className="text-foreground" />
            <nav className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <Link href="/signup" className="text-muted-foreground hover:text-foreground transition-colors">
                Sign up
              </Link>
              <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">
                Sign in
              </Link>
              <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </Link>
            </nav>
          </div>
          <p className="text-center sm:text-left text-xs text-muted-foreground mt-6">
            &copy; {new Date().getFullYear()} Nexum. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ---- Bullet item ---- */

function BulletItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-2 text-sm text-muted-foreground">
      <CheckCircle2 className="size-3.5 text-primary/60 shrink-0" />
      {text}
    </li>
  );
}
