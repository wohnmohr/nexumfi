import Link from "next/link";
import {
  Building2,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Public landing page — role selection                               */
/* ------------------------------------------------------------------ */

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ---- Header ---- */}
      <header className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-primary/15 flex items-center justify-center">
            <ShieldCheck className="size-4 text-primary" />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            HyperMonks
          </span>
        </div>
        <Link
          href="/login"
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Sign In
        </Link>
      </header>

      {/* ---- Hero ---- */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-16">
        <div className="text-center mb-12 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary mb-6">
            <CheckCircle2 className="size-3.5" />
            Trusted by businesses across India &amp; the US
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            Self-service{" "}
            <span className="text-primary">onboarding</span> &amp;{" "}
            <span className="text-primary">KYC verification</span>
          </h1>
          <p className="text-muted-foreground mt-4 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Register as a vendor or insurer. Complete your business
            verification in minutes with our guided, compliance-ready
            onboarding flow.
          </p>
        </div>

        {/* ---- Role cards ---- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-2xl">
          {/* Vendor card */}
          <Link
            href="/signup?role=vendor"
            className="group relative rounded-2xl border border-border bg-card p-6 sm:p-8 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
          >
            <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
              <Building2 className="size-6 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">I&apos;m a Vendor</h2>
            <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
              Register your business, complete KYC, and start receiving
              payments securely.
            </p>
            <ul className="space-y-2.5 mb-6">
              <BulletItem text="PAN, GSTIN, EIN verification" />
              <BulletItem text="Bank account validation" />
              <BulletItem text="Signatory & beneficial owner checks" />
            </ul>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary group-hover:gap-2.5 transition-all">
              Get Started
              <ArrowRight className="size-4" />
            </span>
          </Link>

          {/* Insurer card */}
          <Link
            href="/signup?role=insurer"
            className="group relative rounded-2xl border border-border bg-card p-6 sm:p-8 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
          >
            <div className="size-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-5">
              <ShieldCheck className="size-6 text-emerald-500" />
            </div>
            <h2 className="text-xl font-semibold mb-2">
              I&apos;m an Insurer
            </h2>
            <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
              Register your insurance company, verify licenses, and manage
              claims.
            </p>
            <ul className="space-y-2.5 mb-6">
              <BulletItem text="IRDAI / NAIC license verification" />
              <BulletItem text="Claims settlement bank setup" />
              <BulletItem text="Key personnel verification" />
            </ul>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-500 group-hover:gap-2.5 transition-all">
              Get Started
              <ArrowRight className="size-4" />
            </span>
          </Link>
        </div>

        {/* ---- Existing account ---- */}
        <p className="text-sm text-muted-foreground mt-10">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </main>
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
