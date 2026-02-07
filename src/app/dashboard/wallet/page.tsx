"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, ArrowDownToLine, CreditCard } from "lucide-react";
import { getWalletBalance, formatCurrency } from "@/lib/claims";

export default function WalletPage() {
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    setBalance(getWalletBalance());
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold">Wallet</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your wallet balance and view transaction history.
        </p>
      </div>

      <Card className="border-primary/20 bg-primary/[0.03]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wallet className="size-5 text-primary" />
            Available Balance
          </CardTitle>
          <CardDescription>
            Funds available for withdrawal to your external wallet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tabular-nums">
              {formatCurrency(balance)}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="flex-1">
              <Link href="/dashboard/get-credit">
                <ArrowDownToLine className="size-4" />
                Get Credit
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/dashboard">
                <CreditCard className="size-4" />
                Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
