"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, MessageSquare } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-semibold">Contact Support</CardTitle>
          <CardDescription>
            Reach out to our team for assistance with your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <a
              href="mailto:support@nexum.com"
              className="flex items-center gap-3 rounded-xl border border-border p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Mail className="size-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-medium">Email</p>
                <p className="text-sm text-muted-foreground">
                  support@nexum.com
                </p>
              </div>
            </a>
            <div className="flex items-center gap-3 rounded-xl border border-border p-4">
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="size-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-medium">Live Chat</p>
                <p className="text-sm text-muted-foreground">
                  Available Mon–Fri, 9am–6pm
                </p>
              </div>
            </div>
          </div>
          <Link href="/login">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="size-4" />
              Back to Login
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
