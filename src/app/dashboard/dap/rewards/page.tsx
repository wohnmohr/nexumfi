"use client";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gift, Clock } from "lucide-react";

export default function RewardsPage() {
  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl">
      {/* Page header */}
      <div>
        <h1 className="text-xl md:text-2xl font-semibold">Rewards</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Earn points by depositing, referring friends, and maintaining streaks.
        </p>
      </div>

      {/* Coming Soon */}
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
            <Gift className="size-8 text-primary" />
          </div>
          <Badge variant="secondary" className="mb-4 gap-1">
            <Clock className="size-3" />
            Coming Soon
          </Badge>
          <h2 className="text-xl font-semibold">Rewards Program Coming Soon</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-md">
            On-chain rewards, points, and referral programs are currently in development.
            Deposit into the lending vault today to be eligible for early adopter bonuses when the program launches.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
