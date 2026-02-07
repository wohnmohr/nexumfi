import Link from "next/link";
import { AppLogo } from "@/components/layout/app-logo";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Terms of Service | Nexum",
  description: "Nexum terms of service — the rules and agreements for using our platform.",
};

export default function TermsPage() {
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
              <Link href="/terms?auth=open">Sign In</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground text-sm mb-10">
          Last updated: {new Date().toLocaleDateString("en-US")}
        </p>

        <article className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing or using Nexum&apos;s platform, you agree to be bound
              by these Terms of Service. If you do not agree, do not use our
              services. We may update these terms from time to time; continued
              use after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">2. Description of Services</h2>
            <p className="text-muted-foreground">
              Nexum provides a platform that connects vendors and policy holders
              with credit lines based on receivables. We facilitate verification
              of invoices and claims and enable access to working capital. We do
              not guarantee credit approval; terms and availability vary.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">3. Eligibility</h2>
            <p className="text-muted-foreground">
              You must be at least 18 years old and have the legal capacity to
              enter into binding contracts. You represent that all information
              you provide is accurate and that you are authorized to use our
              services for business or personal purposes as applicable.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">4. Account Registration</h2>
            <p className="text-muted-foreground">
              You must create an account to use certain features. You are
              responsible for maintaining the confidentiality of your credentials
              and for all activity under your account. Notify us immediately of
              any unauthorized use.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">5. Use of the Platform</h2>
            <p className="text-muted-foreground mb-3">
              You agree to use the platform only for lawful purposes. You may
              not:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Provide false, misleading, or fraudulent information</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Attempt to gain unauthorized access to our systems or others&apos; accounts</li>
              <li>Interfere with or disrupt the platform&apos;s operation</li>
              <li>Use the platform for any illegal or unauthorized purpose</li>
              <li>Resell, sublicense, or commercially exploit our services without permission</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">6. Receivables and Credit</h2>
            <p className="text-muted-foreground">
              You represent that any receivables (invoices, claims) you submit
              are genuine, legally enforceable, and accurately represented.
              Credit decisions are made by our partners or algorithms based on
              available information. We do not guarantee approval, amount, or
              terms. Interest rates and fees will be disclosed before you accept
              any credit offer.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">7. Fees and Payments</h2>
            <p className="text-muted-foreground">
              Fees for credit and platform usage will be disclosed during the
              application process. You are responsible for all amounts due under
              any credit agreement. Late or missed payments may result in
              additional fees and may affect your eligibility for future credit.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">8. Intellectual Property</h2>
            <p className="text-muted-foreground">
              Nexum and its licensors own all rights to the platform, including
              software, design, trademarks, and content. You may not copy,
              modify, distribute, or create derivative works without our express
              written permission.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">9. Disclaimers</h2>
            <p className="text-muted-foreground">
              The platform is provided &quot;as is&quot; and &quot;as
              available.&quot; We disclaim all warranties, express or implied,
              including merchantability and fitness for a particular purpose. We
              do not guarantee uninterrupted access, accuracy of data, or
              outcomes from using our services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">10. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              To the fullest extent permitted by law, Nexum and its affiliates
              shall not be liable for any indirect, incidental, special,
              consequential, or punitive damages, or any loss of profits, data,
              or revenue arising from your use of the platform. Our total
              liability shall not exceed the greater of the fees you paid in the
              twelve months preceding the claim or one hundred dollars (USD 100).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">11. Indemnification</h2>
            <p className="text-muted-foreground">
              You agree to indemnify and hold Nexum, its officers, directors,
              employees, and agents harmless from any claims, damages, losses,
              or expenses (including legal fees) arising from your use of the
              platform, violation of these terms, or infringement of any rights of
              a third party.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">12. Termination</h2>
            <p className="text-muted-foreground">
              We may suspend or terminate your account at any time for violation
              of these terms or for any other reason. You may close your account
              at any time. Upon termination, your right to use the platform
              ceases immediately. Outstanding obligations under any credit
              agreement survive termination.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">13. Governing Law</h2>
            <p className="text-muted-foreground">
              These terms are governed by the laws of the jurisdiction in which
              Nexum operates, without regard to conflict of law principles.
              Disputes shall be resolved in the courts of that jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">14. Contact</h2>
            <p className="text-muted-foreground">
              For questions about these Terms of Service, contact us at{" "}
              <a
                href="mailto:legal@nexum.com"
                className="text-primary hover:underline"
              >
                legal@nexum.com
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
