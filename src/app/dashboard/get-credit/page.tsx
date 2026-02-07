"use client";

import { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileText,
  X,
  ShieldCheck,
  Coins,
  Landmark,
  CheckCircle2,
  Loader2,
  ArrowDownToLine,
  ArrowUpFromLine,
  Wallet,
  CreditCard,
  RefreshCw,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Step = "upload" | "processing" | "credit-ready" | "withdrawn";

interface TokenizationStage {
  key: string;
  label: string;
  description: string;
  icon: React.ElementType;
}

const TOKENIZATION_STAGES: TokenizationStage[] = [
  {
    key: "verify",
    label: "Verifying Claim",
    description: "Validating insurance claim authenticity",
    icon: ShieldCheck,
  },
  {
    key: "tokenize",
    label: "Tokenizing Asset",
    description: "Converting claim into on-chain token",
    icon: Coins,
  },
  {
    key: "underwrite",
    label: "Underwriting",
    description: "Assessing credit value of tokenized asset",
    icon: Landmark,
  },
  {
    key: "complete",
    label: "Credit Issued",
    description: "Credit line is ready to claim",
    icon: CheckCircle2,
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function GetCreditPage() {
  // Flow state
  const [step, setStep] = useState<Step>("upload");

  // Upload form state
  const [claimNumber, setClaimNumber] = useState("");
  const [insurer, setInsurer] = useState("");
  const [claimAmount, setClaimAmount] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Validation
  const [touched, setTouched] = useState({
    claimNumber: false,
    insurer: false,
    claimAmount: false,
  });

  const fieldErrors = {
    claimNumber: touched.claimNumber
      ? !claimNumber.trim()
        ? "Claim number is required"
        : null
      : null,
    insurer: touched.insurer
      ? !insurer.trim()
        ? "Insurer name is required"
        : null
      : null,
    claimAmount: touched.claimAmount
      ? !claimAmount.trim()
        ? "Claim amount is required"
        : Number(claimAmount) <= 0
          ? "Amount must be greater than 0"
          : null
      : null,
  };

  // Processing state
  const [currentStageIndex, setCurrentStageIndex] = useState(-1);
  const [isProcessing, setIsProcessing] = useState(false);

  // Credit state
  const [creditAmount, setCreditAmount] = useState(0);
  const [tokenId, setTokenId] = useState("");

  // Wallet state
  const [walletBalance, setWalletBalance] = useState(0);
  const [isDepositing, setIsDepositing] = useState(false);

  // Withdraw from wallet state
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isWithdrawingFromWallet, setIsWithdrawingFromWallet] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  /* ---- File handlers ---- */

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0];
      if (selected) setFile(selected);
    },
    []
  );

  /* ---- Submit & Process ---- */

  const canSubmit =
    claimNumber.trim() &&
    insurer.trim() &&
    claimAmount.trim() &&
    Number(claimAmount) > 0 &&
    file;

  const handleSubmit = async () => {
    setTouched({ claimNumber: true, insurer: true, claimAmount: true });

    if (!canSubmit) return;

    setStep("processing");
    setIsProcessing(true);
    setCurrentStageIndex(0);

    // Mock tokenization stages with delays
    for (let i = 0; i < TOKENIZATION_STAGES.length; i++) {
      setCurrentStageIndex(i);
      await sleep(1500 + Math.random() * 1000);
    }

    // Calculate credit (mock: 75-85% of claim value)
    const claim = Number(claimAmount);
    const creditPct = 0.75 + Math.random() * 0.1;
    const credit = Math.round(claim * creditPct * 100) / 100;

    setCreditAmount(credit);
    setTokenId(
      `HM-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
    );

    setIsProcessing(false);
    setStep("credit-ready");
  };

  /* ---- Deposit to wallet ---- */

  const handleDeposit = async () => {
    setIsDepositing(true);
    await sleep(2000);
    setWalletBalance((prev) => prev + creditAmount);
    setIsDepositing(false);
    setStep("withdrawn");
  };

  /* ---- Withdraw from wallet ---- */

  const handleWithdrawFromWallet = async () => {
    const amount = Number(withdrawAmount);
    if (!amount || amount <= 0 || amount > walletBalance) return;

    setIsWithdrawingFromWallet(true);
    await sleep(2000);
    setWalletBalance((prev) => Math.round((prev - amount) * 100) / 100);
    setIsWithdrawingFromWallet(false);
    setWithdrawSuccess(true);

    // Reset after a moment
    setTimeout(() => {
      setShowWithdraw(false);
      setWithdrawAmount("");
      setWithdrawSuccess(false);
    }, 2500);
  };

  /* ---- Reset ---- */

  const handleNewClaim = () => {
    setStep("upload");
    setClaimNumber("");
    setInsurer("");
    setClaimAmount("");
    setFile(null);
    setTouched({ claimNumber: false, insurer: false, claimAmount: false });
    setCurrentStageIndex(-1);
    setCreditAmount(0);
    setTokenId("");
  };

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-3xl">
      {/* Page header */}
      <div>
        <h1 className="text-xl md:text-2xl font-semibold">Get Credit</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload an approved insurance claim to receive a tokenized credit line.
        </p>
      </div>

      {/* Wallet balance card — always visible */}
      <Card className="border-primary/20 bg-primary/[0.03]">
        <CardContent className="py-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Wallet className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Wallet Balance</p>
                <p className="text-lg font-semibold tabular-nums">
                  {formatCurrency(walletBalance)}
                </p>
              </div>
            </div>
            {walletBalance > 0 && !showWithdraw && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowWithdraw(true);
                  setWithdrawSuccess(false);
                }}
              >
                <ArrowUpFromLine className="size-4" />
                Withdraw
              </Button>
            )}
          </div>

          {/* Withdraw from wallet inline form */}
          {showWithdraw && walletBalance > 0 && (
            <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
              {!withdrawSuccess ? (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Withdraw Funds</p>
                    <button
                      onClick={() => {
                        setShowWithdraw(false);
                        setWithdrawAmount("");
                      }}
                      className="size-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        type="number"
                        min="0"
                        max={walletBalance}
                        step="0.01"
                        placeholder="Amount to withdraw"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        aria-invalid={
                          withdrawAmount !== "" &&
                          (Number(withdrawAmount) <= 0 ||
                            Number(withdrawAmount) > walletBalance)
                        }
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 h-10"
                      onClick={() =>
                        setWithdrawAmount(walletBalance.toString())
                      }
                    >
                      Max
                    </Button>
                  </div>
                  {withdrawAmount !== "" &&
                    Number(withdrawAmount) > walletBalance && (
                      <p className="text-xs text-destructive">
                        Amount exceeds your wallet balance
                      </p>
                    )}
                  <Button
                    className="w-full"
                    onClick={handleWithdrawFromWallet}
                    disabled={
                      isWithdrawingFromWallet ||
                      !withdrawAmount ||
                      Number(withdrawAmount) <= 0 ||
                      Number(withdrawAmount) > walletBalance
                    }
                  >
                    {isWithdrawingFromWallet ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <ArrowUpFromLine className="size-4" />
                    )}
                    {isWithdrawingFromWallet
                      ? "Processing..."
                      : `Withdraw ${withdrawAmount ? formatCurrency(Number(withdrawAmount)) : ""}`}
                  </Button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 py-2">
                  <div className="size-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                    <CheckCircle2 className="size-5 text-emerald-500" />
                  </div>
                  <p className="text-sm font-medium text-emerald-500">
                    Withdrawal Successful
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Funds have been sent to your external wallet
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ============================================================ */}
      {/*  STEP 1: Upload Form                                         */}
      {/* ============================================================ */}
      {step === "upload" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="size-5 text-primary" />
              Submit Insurance Claim
            </CardTitle>
            <CardDescription>
              Provide your approved insurance claim details. The asset will be
              verified and tokenized to issue a credit line.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Claim Number */}
            <div className="space-y-2">
              <Label htmlFor="claim-number">Claim Number</Label>
              <Input
                id="claim-number"
                placeholder="e.g. CLM-2025-00123"
                value={claimNumber}
                onChange={(e) => setClaimNumber(e.target.value)}
                onBlur={() =>
                  setTouched((p) => ({ ...p, claimNumber: true }))
                }
                aria-invalid={!!fieldErrors.claimNumber}
              />
              {fieldErrors.claimNumber && (
                <p className="text-xs text-destructive">
                  {fieldErrors.claimNumber}
                </p>
              )}
            </div>

            {/* Insurer */}
            <div className="space-y-2">
              <Label htmlFor="insurer">Insurance Provider</Label>
              <Input
                id="insurer"
                placeholder="e.g. Acme Insurance Co."
                value={insurer}
                onChange={(e) => setInsurer(e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, insurer: true }))}
                aria-invalid={!!fieldErrors.insurer}
              />
              {fieldErrors.insurer && (
                <p className="text-xs text-destructive">
                  {fieldErrors.insurer}
                </p>
              )}
            </div>

            {/* Claim Amount */}
            <div className="space-y-2">
              <Label htmlFor="claim-amount">Approved Claim Amount (USD)</Label>
              <Input
                id="claim-amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 25000"
                value={claimAmount}
                onChange={(e) => setClaimAmount(e.target.value)}
                onBlur={() =>
                  setTouched((p) => ({ ...p, claimAmount: true }))
                }
                aria-invalid={!!fieldErrors.claimAmount}
              />
              {fieldErrors.claimAmount && (
                <p className="text-xs text-destructive">
                  {fieldErrors.claimAmount}
                </p>
              )}
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label>Claim Document</Label>
              {!file ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleFileDrop}
                  className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 transition-colors cursor-pointer ${
                    dragOver
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-muted/30"
                  }`}
                >
                  <Upload className="size-8 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">
                      Drop your file here, or{" "}
                      <span className="text-primary">browse</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF, JPG, or PNG up to 10MB
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3">
                  <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="size-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    className="size-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Submit */}
            <Button
              className="w-full"
              size="lg"
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              <Upload className="size-4" />
              Submit & Tokenize Asset
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ============================================================ */}
      {/*  STEP 2: Processing / Tokenization Progress                  */}
      {/* ============================================================ */}
      {step === "processing" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tokenizing Your Asset</CardTitle>
            <CardDescription>
              Your insurance claim is being verified and converted into an
              on-chain credit token.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {TOKENIZATION_STAGES.map((stage, index) => {
                const isComplete = index < currentStageIndex;
                const isCurrent = index === currentStageIndex;
                const isPending = index > currentStageIndex;
                const Icon = stage.icon;

                return (
                  <div key={stage.key} className="flex gap-4">
                    {/* Timeline connector */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`size-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-500 ${
                          isComplete
                            ? "bg-emerald-500/15 text-emerald-500"
                            : isCurrent
                              ? "bg-primary/15 text-primary"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isComplete ? (
                          <CheckCircle2 className="size-5" />
                        ) : isCurrent ? (
                          <Loader2 className="size-5 animate-spin" />
                        ) : (
                          <Icon className="size-5" />
                        )}
                      </div>
                      {index < TOKENIZATION_STAGES.length - 1 && (
                        <div
                          className={`w-0.5 flex-1 min-h-6 my-1 rounded-full transition-colors duration-500 ${
                            isComplete ? "bg-emerald-500/30" : "bg-border"
                          }`}
                        />
                      )}
                    </div>

                    {/* Stage info */}
                    <div className="pb-6 pt-1.5">
                      <p
                        className={`text-sm font-medium transition-colors ${
                          isPending
                            ? "text-muted-foreground"
                            : "text-foreground"
                        }`}
                      >
                        {stage.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {stage.description}
                      </p>
                      {isCurrent && (
                        <Badge
                          variant="secondary"
                          className="mt-2 text-primary"
                        >
                          In Progress
                        </Badge>
                      )}
                      {isComplete && (
                        <Badge
                          variant="secondary"
                          className="mt-2 text-emerald-500"
                        >
                          Complete
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ============================================================ */}
      {/*  STEP 3: Credit Ready                                        */}
      {/* ============================================================ */}
      {step === "credit-ready" && (
        <Card className="border-emerald-500/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <CheckCircle2 className="size-6 text-emerald-500" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  Credit Line Approved
                </CardTitle>
                <CardDescription>
                  Your asset has been tokenized and a credit line is ready.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Tokenization summary */}
            <div className="rounded-xl bg-muted/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Token ID
                </span>
                <span className="text-sm font-mono font-medium">
                  {tokenId}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Claim Number
                </span>
                <span className="text-sm">{claimNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Insurance Provider
                </span>
                <span className="text-sm">{insurer}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Original Claim
                </span>
                <span className="text-sm">
                  {formatCurrency(Number(claimAmount))}
                </span>
              </div>
              <div className="border-t border-border pt-3 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  Credit Available
                </span>
                <span className="text-lg font-semibold text-emerald-500 tabular-nums">
                  {formatCurrency(creditAmount)}
                </span>
              </div>
            </div>

            {/* Deposit to wallet button */}
            <Button
              className="w-full"
              size="lg"
              onClick={handleDeposit}
              disabled={isDepositing}
            >
              {isDepositing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ArrowDownToLine className="size-4" />
              )}
              {isDepositing
                ? "Depositing to Wallet..."
                : `Deposit ${formatCurrency(creditAmount)} to Wallet`}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ============================================================ */}
      {/*  STEP 4: Withdrawn — Final State                             */}
      {/* ============================================================ */}
      {step === "withdrawn" && (
        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-xl bg-primary/15 flex items-center justify-center">
                <Wallet className="size-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  Deposit Complete
                </CardTitle>
                <CardDescription>
                  Your credit has been deposited into your wallet.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Receipt */}
            <div className="rounded-xl bg-muted/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Token ID
                </span>
                <span className="text-sm font-mono font-medium">
                  {tokenId}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Amount Deposited
                </span>
                <span className="text-sm font-medium text-emerald-500 tabular-nums">
                  +{formatCurrency(creditAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant="secondary" className="text-emerald-500">
                  Confirmed
                </Badge>
              </div>
              <div className="border-t border-border pt-3 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  New Wallet Balance
                </span>
                <span className="text-lg font-semibold text-primary tabular-nums">
                  {formatCurrency(walletBalance)}
                </span>
              </div>
            </div>

            {/* Submit another */}
            <Button
              variant="outline"
              className="w-full"
              size="lg"
              onClick={handleNewClaim}
            >
              <RefreshCw className="size-4" />
              Submit Another Claim
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
