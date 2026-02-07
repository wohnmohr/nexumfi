"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { AppLogo } from "@/components/layout/app-logo";
import { ArrowLeft, Send, CheckCircle2 } from "lucide-react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    subject: false,
    message: false,
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const errors = {
    name: touched.name && !name.trim() ? "Name is required" : null,
    email:
      touched.email && !email.trim()
        ? "Email is required"
        : touched.email && !EMAIL_REGEX.test(email)
          ? "Please enter a valid email"
          : null,
    subject: touched.subject && !subject.trim() ? "Subject is required" : null,
    message: touched.message && !message.trim() ? "Message is required" : null,
  };

  const isValid =
    name.trim() &&
    EMAIL_REGEX.test(email) &&
    subject.trim() &&
    message.trim();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Use mailto as fallback; replace with API route when backend is ready
      const mailto = `mailto:support@nexum.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
        `From: ${name} (${email})\n\n${message}`
      )}`;
      window.location.href = mailto;
      setIsSubmitted(true);
    } catch {
      // Fallback: show success anyway for demo
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  }

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

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Contact us</CardTitle>
            <CardDescription>
              Have a question or need help? We&apos;ll get back to you soon.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSubmitted ? (
              <div className="flex flex-col items-center gap-4 py-8 text-center">
                <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="size-7 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Message sent</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    We&apos;ll respond to {email} as soon as we can.
                  </p>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/">
                    <ArrowLeft className="size-4 mr-2" />
                    Back to home
                  </Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="name">Name</FieldLabel>
                    <Input
                      id="name"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                      aria-invalid={!!errors.name}
                    />
                    {errors.name && <FieldError>{errors.name}</FieldError>}
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                      aria-invalid={!!errors.email}
                    />
                    {errors.email && <FieldError>{errors.email}</FieldError>}
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="subject">Subject</FieldLabel>
                    <Input
                      id="subject"
                      placeholder="What&apos;s this about?"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      onBlur={() =>
                        setTouched((t) => ({ ...t, subject: true }))
                      }
                      aria-invalid={!!errors.subject}
                    />
                    {errors.subject && (
                      <FieldError>{errors.subject}</FieldError>
                    )}
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="message">Message</FieldLabel>
                    <Textarea
                      id="message"
                      placeholder="Tell us how we can help..."
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onBlur={() =>
                        setTouched((t) => ({ ...t, message: true }))
                      }
                      aria-invalid={!!errors.message}
                    />
                    {errors.message && (
                      <FieldError>{errors.message}</FieldError>
                    )}
                  </Field>
                </FieldGroup>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    type="submit"
                    disabled={!isValid || isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="size-4 mr-2" />
                        Send message
                      </>
                    )}
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/">
                      <ArrowLeft className="size-4 mr-2" />
                      Back
                    </Link>
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
