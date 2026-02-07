import Link from "next/link";
import { AppLogo } from "@/components/layout/app-logo";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Privacy Policy | Nexum",
  description: "Nexum privacy policy — how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="w-full border-b border-border">
        <div className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
          <AppLogo href="/" className="text-foreground" />
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link href="/">Home</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground text-sm mb-10">
          Last updated: {new Date().toLocaleDateString("en-US")}
        </p>

        <article className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold mb-3">1. Introduction</h2>
            <p className="text-muted-foreground">
              Nexum (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates
              a platform that enables vendors and policy holders to access credit
              lines based on receivables. This Privacy Policy explains how we
              collect, use, disclose, and safeguard your information when you use
              our services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">2. Information We Collect</h2>
            <p className="text-muted-foreground mb-3">
              We may collect the following types of information:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                <strong className="text-foreground">Account information:</strong>{" "}
                Name, email address, password (hashed), and role (vendor or
                policy holder).
              </li>
              <li>
                <strong className="text-foreground">Financial data:</strong>{" "}
                Invoice, claim, and receivable information you provide to obtain
                credit.
              </li>
              <li>
                <strong className="text-foreground">Usage data:</strong> How you
                interact with our platform, including pages visited and actions
                taken.
              </li>
              <li>
                <strong className="text-foreground">Device data:</strong> IP
                address, browser type, and device identifiers.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">3. How We Use Your Information</h2>
            <p className="text-muted-foreground mb-3">
              We use your information to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Provide, maintain, and improve our services</li>
              <li>Process credit applications and verify receivables</li>
              <li>Communicate with you about your account and our services</li>
              <li>Detect, prevent, and address fraud and security issues</li>
              <li>Comply with legal and regulatory obligations</li>
              <li>Analyze usage to improve user experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">4. Information Sharing</h2>
            <p className="text-muted-foreground">
              We do not sell your personal information. We may share your
              information with: (a) service providers who assist in operating our
              platform; (b) partners involved in verifying receivables or
              extending credit; (c) legal authorities when required by law; and
              (d) in connection with a merger, acquisition, or sale of assets.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">5. Data Security</h2>
            <p className="text-muted-foreground">
              We implement industry-standard security measures, including
              encryption, access controls, and secure authentication, to protect
              your data. No method of transmission over the internet is 100%
              secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">6. Data Retention</h2>
            <p className="text-muted-foreground">
              We retain your information for as long as your account is active or
              as needed to provide services. We may retain certain data to
              comply with legal obligations, resolve disputes, and enforce our
              agreements.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">7. Your Rights</h2>
            <p className="text-muted-foreground mb-3">
              Depending on your location, you may have the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Access and receive a copy of your personal data</li>
              <li>Correct inaccuracies in your data</li>
              <li>Request deletion of your data</li>
              <li>Object to or restrict certain processing</li>
              <li>Data portability</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              Contact us at{" "}
              <a
                href="mailto:privacy@nexum.com"
                className="text-primary hover:underline"
              >
                privacy@nexum.com
              </a>{" "}
              to exercise these rights.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">8. Cookies and Tracking</h2>
            <p className="text-muted-foreground">
              We use cookies and similar technologies to maintain sessions,
              improve security, and analyze usage. You can manage cookie
              preferences through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">9. Children</h2>
            <p className="text-muted-foreground">
              Our services are not intended for individuals under 18. We do not
              knowingly collect personal information from children.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">10. Contact Us</h2>
            <p className="text-muted-foreground">
              For questions about this Privacy Policy, contact us at{" "}
              <a
                href="mailto:privacy@nexum.com"
                className="text-primary hover:underline"
              >
                privacy@nexum.com
              </a>{" "}
              or visit our{" "}
              <Link href="/contact" className="text-primary hover:underline">
                contact page
              </Link>
              .
            </p>
          </section>
        </article>
      </main>
    </div>
  );
}
