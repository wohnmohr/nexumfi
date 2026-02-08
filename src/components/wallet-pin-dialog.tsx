"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import { Loader2, Lock, KeyRound } from "lucide-react";
import {
  registerStellarWallet,
  loadStellarWalletKey,
  fundWithFriendbot,
} from "@/lib/stellar-wallet";

interface WalletPinDialogProps {
  mode: "create" | "unlock";
  onSuccess: (keys: { publicKey: string; privateKey: string }) => void;
}

export function WalletPinDialog({ mode, onSuccess }: WalletPinDialogProps) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [step, setStep] = useState<"pin" | "confirm">(
    mode === "create" ? "pin" : "pin"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  const handleCreate = async () => {
    if (pin.length !== 6) return;
    if (step === "pin") {
      setStep("confirm");
      return;
    }
    if (confirmPin !== pin) {
      setError("PINs do not match");
      setConfirmPin("");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      setStatus("Creating wallet...");
      const wallet = await registerStellarWallet(pin);

      setStatus("Funding account on testnet...");
      const funded = await fundWithFriendbot(wallet.publicKey);
      if (!funded) {
        setError("Failed to fund account via Friendbot. Try again.");
        setIsLoading(false);
        return;
      }

      setStatus("Loading keys...");
      const keys = await loadStellarWalletKey(pin);
      if (!keys) {
        setError("Failed to load wallet keys");
        setIsLoading(false);
        return;
      }

      onSuccess(keys);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create wallet");
    } finally {
      setIsLoading(false);
      setStatus("");
    }
  };

  const handleUnlock = async () => {
    if (pin.length !== 6) return;

    setIsLoading(true);
    setError(null);

    try {
      setStatus("Decrypting wallet...");
      const keys = await loadStellarWalletKey(pin);
      if (!keys) {
        setError("Invalid PIN");
        setPin("");
        setIsLoading(false);
        return;
      }

      onSuccess(keys);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unlock wallet");
    } finally {
      setIsLoading(false);
      setStatus("");
    }
  };

  const isCreate = mode === "create";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-xl bg-primary/15 flex items-center justify-center">
            {isCreate ? (
              <KeyRound className="size-6 text-primary" />
            ) : (
              <Lock className="size-6 text-primary" />
            )}
          </div>
          <div>
            <CardTitle className="text-lg">
              {isCreate ? "Create Stellar Wallet" : "Unlock Wallet"}
            </CardTitle>
            <CardDescription>
              {isCreate
                ? "Enter a 6-digit PIN to secure your wallet"
                : "Enter your PIN to unlock your wallet"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === "pin" && (
          <div className="space-y-2">
            {isCreate && (
              <p className="text-sm text-muted-foreground">Choose a PIN</p>
            )}
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={pin}
                onChange={setPin}
                disabled={isLoading}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>
        )}

        {step === "confirm" && isCreate && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Confirm your PIN</p>
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={confirmPin}
                onChange={setConfirmPin}
                disabled={isLoading}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>
        )}

        {error && <p className="text-xs text-destructive text-center">{error}</p>}
        {status && (
          <p className="text-xs text-muted-foreground text-center">{status}</p>
        )}

        <Button
          className="w-full"
          size="lg"
          onClick={isCreate ? handleCreate : handleUnlock}
          disabled={
            isLoading ||
            (step === "pin" && pin.length !== 6) ||
            (step === "confirm" && confirmPin.length !== 6)
          }
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : isCreate ? (
            <KeyRound className="size-4" />
          ) : (
            <Lock className="size-4" />
          )}
          {isLoading
            ? status || "Processing..."
            : isCreate
              ? step === "pin"
                ? "Next"
                : "Create Wallet"
              : "Unlock"}
        </Button>

        {step === "confirm" && isCreate && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => {
              setStep("pin");
              setConfirmPin("");
              setError(null);
            }}
            disabled={isLoading}
          >
            Back
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
