"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  Coins,
  Landmark,
  CheckCircle2,
  Loader2,
  Wallet,
  RefreshCw,
  ExternalLink,
  HandCoins,
  Activity,
  TrendingUp,
  Shield,
  Clock,
  Percent,
  AlertTriangle,
} from "lucide-react";
import { getStellarWallet } from "@/lib/stellar-wallet";
import {
  createReceivableClient,
  createBorrowClient,
  createVaultClient,
  RECEIVABLE_NETWORK_PASSPHRASE,
} from "@/lib/stellar-contracts";
import type { BorrowConfig, Loan } from "@/app/contracts/borrow_contract/src";
import type { VaultState } from "@/app/contracts/lending_vault/src";
import { networks as receivableNetworks } from "@/app/contracts/receivable_token/src";
import { Keypair } from "@stellar/stellar-sdk";
import { basicNodeSigner } from "@stellar/stellar-sdk/contract";
import { WalletPinDialog } from "@/components/wallet-pin-dialog";
import { useReclaim } from "@/app/hooks/useReclaim";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Step = "upload" | "tokenize" | "borrow";

interface ProcessingStage {
  key: string;
  label: string;
  description: string;
  icon: React.ElementType;
}

const TOKENIZATION_STAGES: ProcessingStage[] = [
  {
    key: "verify",
    label: "Verifying Data",
    description: "Validating verified data hash",
    icon: ShieldCheck,
  },
  {
    key: "tokenize",
    label: "Tokenizing Asset",
    description: "Minting receivable on Stellar",
    icon: Coins,
  },
  {
    key: "sign",
    label: "Signing Transaction",
    description: "Signing and submitting to network",
    icon: Landmark,
  },
  {
    key: "complete",
    label: "Complete",
    description: "Receivable minted on-chain",
    icon: CheckCircle2,
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Convert stroops (i128 / bigint) to XLM number */
function stroopsToXlm(stroops: bigint): number {
  return Number(stroops) / 10_000_000;
}

/** Format XLM amount for display */
function fmtXlm(xlm: number): string {
  return xlm.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Basis points (i128) to percentage string, e.g. 9000 → "90" */
function bpsToPercent(bps: bigint): number {
  return Number(bps) / 100;
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function GetCreditPage() {
  const router = useRouter();

  // Flow state
  const [step, setStep] = useState<Step>("upload");

  // Processing state (shared by tokenize progress)
  const [currentStageIndex, setCurrentStageIndex] = useState(-1);
  const [isProcessing, setIsProcessing] = useState(false);

  // Stellar wallet state
  const [walletKeys, setWalletKeys] = useState<{
    publicKey: string;
    privateKey: string;
  } | null>(null);
  const [walletMode, setWalletMode] = useState<"create" | "unlock">("create");

  // Mint state
  const [mintResult, setMintResult] = useState<{
    receivableId: string;
    txHash: string;
  } | null>(null);
  const [mintError, setMintError] = useState<string | null>(null);

  // Borrow state
  const [borrowResult, setBorrowResult] = useState<{
    loanId: string;
    txHash: string;
  } | null>(null);
  const [borrowError, setBorrowError] = useState<string | null>(null);
  const [isBorrowing, setIsBorrowing] = useState(false);

  // Balance state
  const [xlmBalance, setXlmBalance] = useState<string | null>(null);

  // Pool & config state (fetched from contracts on mount)
  const [poolState, setPoolState] = useState<VaultState | null>(null);
  const [borrowConfig, setBorrowConfig] = useState<BorrowConfig | null>(null);
  const [poolLoading, setPoolLoading] = useState(true);

  // Loan details (fetched after borrow)
  const [loanDetails, setLoanDetails] = useState<Loan | null>(null);
  const [loanLtv, setLoanLtv] = useState<bigint | null>(null);
  // Reclaim verification
  const { isLoading: isVerifying, error: verifyError, startVerification, creditData: reclaimCreditData, sessionStatus } = useReclaim();

  // Existing active loan check
  const [hasActiveLoan, setHasActiveLoan] = useState(false);
  const [activeLoanChecked, setActiveLoanChecked] = useState(false);

  // Derive creditData from Reclaim hook, mapping currency to XLM SAC for testnet
  const NATIVE_XLM_SAC = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";
  const creditData = reclaimCreditData
    ? { ...reclaimCreditData, currency: NATIVE_XLM_SAC }
    : null;

  // Fetch XLM balance from Horizon
  const fetchBalance = useCallback(async (pubKey: string) => {
    try {
      const res = await fetch(
        `https://horizon-testnet.stellar.org/accounts/${pubKey}`
      );
      if (!res.ok) return;
      const data = await res.json();
      const native = data.balances?.find(
        (b: { asset_type: string }) => b.asset_type === "native"
      );
      if (native) setXlmBalance(native.balance);
    } catch {
      // ignore
    }
  }, []);

  // Fetch pool state & borrow config from contracts
  const fetchPoolInfo = useCallback(async () => {
    const verifierSecret = process.env.NEXT_PUBLIC_STELLAR_VERIFIER_SECRET;
    if (!verifierSecret) return;

    try {
      const [vaultClient, borrowClient] = [
        createVaultClient(verifierSecret),
        createBorrowClient(verifierSecret),
      ];

      const [stateRes, configRes] = await Promise.all([
        vaultClient.get_state(),
        borrowClient.get_config(),
      ]);

      setPoolState(stateRes.result);
      setBorrowConfig(configRes.result);
    } catch {
      // pool info is non-critical
    } finally {
      setPoolLoading(false);
    }
  }, []);

  // Check stellar wallet on mount + check for active loans
  useEffect(() => {
    const existing = getStellarWallet();
    if (!existing) return;
    setWalletMode("unlock");

    // Pre-check active loans using public key (no PIN needed)
    const verifierSecret = process.env.NEXT_PUBLIC_STELLAR_VERIFIER_SECRET;
    if (!verifierSecret) return;

    (async () => {
      try {
        const client = createBorrowClient(verifierSecret);
        const res = await client.get_borrower_loans({ borrower: existing.publicKey });
        const loanIds = res.result;
        if (loanIds && loanIds.length > 0) {
          const loanResults = await Promise.all(
            loanIds.map((id) => client.get_loan({ loan_id: id }))
          );
          const active = loanResults.some(
            (r) => r.result.isOk() && r.result.unwrap().status.tag === "Active"
          );
          setHasActiveLoan(active);
        }
      } catch {
        // non-critical
      } finally {
        setActiveLoanChecked(true);
      }
    })();
  }, []);

  // Fetch pool info on mount
  useEffect(() => {
    fetchPoolInfo();
  }, [fetchPoolInfo]);

  // Fetch balance when wallet is unlocked
  useEffect(() => {
    if (!walletKeys) return;
    fetchBalance(walletKeys.publicKey);
  }, [walletKeys, fetchBalance]);

  // When verification completes (creditData arrives), auto-advance to tokenize step
  // This happens automatically when MOBILE_SUBMITTED status triggers credit API fetch
  useEffect(() => {
    if (reclaimCreditData && step === "upload") {
      setStep("tokenize");
      setMintResult(null);
      setMintError(null);
      setBorrowResult(null);
      setBorrowError(null);
    }
  }, [reclaimCreditData, step]);

  /* ---- Mint receivable on-chain ---- */

  const handleMintReceivable = async () => {
    if (!walletKeys || !creditData) return;

    setStep("tokenize");
    setIsProcessing(true);
    setMintError(null);
    setCurrentStageIndex(0);

    try {
      // Mint requires auth from both verifier and creditor (user wallet).
      // We create the client with the verifier key (source account), then
      // manually sign auth entries for each party before sending.
      const verifierSecret = process.env.NEXT_PUBLIC_STELLAR_VERIFIER_SECRET;
      if (!verifierSecret) throw new Error("Verifier key not configured");
      const client = createReceivableClient(verifierSecret);

      // Stage 1: Verify
      await sleep(500);
      setCurrentStageIndex(1);

      // Stage 2: Tokenize — actual mint call (simulate)
      const encoder = new TextEncoder();
      const debtorHashBuf = await crypto.subtle.digest(
        "SHA-256",
        encoder.encode(creditData.user_id)
      );
      const zkProofBuf = await crypto.subtle.digest(
        "SHA-256",
        encoder.encode(creditData.session_id)
      );

      const faceValue = BigInt(
        Math.round(creditData.credit_line * 10_000_000)
      );
      const maturityDate = BigInt(
        Math.floor(Date.now() / 1000) + 90 * 24 * 60 * 60
      );

      const tx = await client.mint({
        creditor: walletKeys.publicKey,
        debtor_hash: Buffer.from(debtorHashBuf),
        face_value: faceValue,
        currency: creditData.currency,
        maturity_date: maturityDate,
        zk_proof_hash: Buffer.from(zkProofBuf),
        risk_score: 10,
        metadata_uri: `reclaim://${creditData.session_id}`,
      });

      // Stage 3: Sign creditor auth entry, then sign & send
      setCurrentStageIndex(2);

      // The verifier is checked as the invoker (source account) — no auth entry needed.
      // Only the creditor (user wallet) needs an auth entry signed.
      const userKp = Keypair.fromSecret(walletKeys.privateKey);
      const { signAuthEntry: userSignAuthEntry } = basicNodeSigner(
        userKp,
        RECEIVABLE_NETWORK_PASSPHRASE
      );
      await tx.signAuthEntries({
        signAuthEntry: userSignAuthEntry,
        address: walletKeys.publicKey,
      });

      // Auth entries signed — now sign tx envelope & send
      const result = await tx.signAndSend();

      // Stage 4: Complete
      setCurrentStageIndex(3);
      await sleep(500);

      const mintResultVal = result.result;
      if (mintResultVal.isOk()) {
        const receivableId = mintResultVal.unwrap();
        setMintResult({
          receivableId: receivableId.toString(),
          txHash:
            (
              result as unknown as {
                sendTransactionResponse?: { hash?: string };
              }
            ).sendTransactionResponse?.hash ?? "unknown",
        });
      } else {
        throw new Error(
          `Mint failed: ${JSON.stringify(mintResultVal.unwrapErr())}`
        );
      }

      setIsProcessing(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setMintError(msg);
      setIsProcessing(false);
      setStep("tokenize");
    }
  };

  /* ---- Borrow against receivable ---- */

  const handleBorrow = async () => {
    if (!walletKeys || !creditData || !mintResult) return;

    setIsBorrowing(true);
    setBorrowError(null);

    try {
      const client = createBorrowClient(walletKeys.privateKey);

      const tx = await client.borrow({
        borrower: walletKeys.publicKey,
        receivable_ids: [BigInt(mintResult.receivableId)],
        borrow_amount: BigInt(
          Math.round(creditData.credit_line * 10_000_000 * 0.8) // 80% of face value
        ),
        duration: BigInt(90 * 24 * 60 * 60), // 90 days
      });

      const result = await tx.signAndSend();

      const borrowResultVal = result.result;
      if (borrowResultVal.isOk()) {
        const loanId = borrowResultVal.unwrap();
        const txHash =
          (
            result as unknown as {
              sendTransactionResponse?: { hash?: string };
            }
          ).sendTransactionResponse?.hash ?? "unknown";
        setBorrowResult({ loanId: loanId.toString(), txHash });

        // Refresh balance & pool state after loan disbursement
        if (walletKeys) fetchBalance(walletKeys.publicKey);
        fetchPoolInfo();

        // Fetch real loan details + LTV from contract
        try {
          const [loanRes, ltvRes] = await Promise.all([
            client.get_loan({ loan_id: loanId }),
            client.get_ltv({ loan_id: loanId }),
          ]);
          const loanVal = loanRes.result;
          if (loanVal.isOk()) setLoanDetails(loanVal.unwrap());
          const ltvVal = ltvRes.result;
          if (ltvVal.isOk()) setLoanLtv(ltvVal.unwrap());
        } catch {
          // non-critical — UI falls back to estimated values
        }
      } else {
        throw new Error(
          `Borrow failed: ${JSON.stringify(borrowResultVal.unwrapErr())}`
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setBorrowError(msg);
    } finally {
      setIsBorrowing(false);
    }
  };

  /* ---- Reset ---- */

  const handleStartOver = () => {
    setStep("upload");
    setCurrentStageIndex(-1);
    setMintResult(null);
    setMintError(null);
    setBorrowResult(null);
    setBorrowError(null);
    setLoanDetails(null);
    setLoanLtv(null);
  };

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  // Show loader while checking for existing active loans
  if (walletMode === "unlock" && !activeLoanChecked) {
    return (
      <div className="p-4 md:p-6 space-y-6 max-w-3xl mx-auto">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">Get Credit</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Verify receivables, tokenize on Stellar, and borrow against them.
          </p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Checking existing loans...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-3xl mx-auto">
      {/* Page header */}
      <div>
        <h1 className="text-xl md:text-2xl font-semibold">Get Credit</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Verify receivables, tokenize on Stellar, and borrow against them.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 text-sm">
        {[
          { key: "upload", label: "1. Verify" },
          { key: "tokenize", label: "2. Tokenize" },
          { key: "borrow", label: "3. Borrow" },
        ].map((s, i) => {
          const steps: Step[] = ["upload", "tokenize", "borrow"];
          const currentIdx = steps.indexOf(step);
          const thisIdx = i;
          const isActive = s.key === step;
          const isDone = thisIdx < currentIdx;

          return (
            <div key={s.key} className="flex items-center gap-2">
              {i > 0 && (
                <div
                  className={`w-8 h-px ${isDone ? "bg-emerald-500" : "bg-border"}`}
                />
              )}
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : isDone
                      ? "bg-emerald-500/15 text-emerald-500"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {isDone && <CheckCircle2 className="size-3 inline mr-1" />}
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Wallet info — show when unlocked */}
      {walletKeys && (
        <div className="rounded-xl bg-primary/5 border border-primary/10 p-3 flex items-center gap-3">
          <Wallet className="size-4 text-primary shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Stellar Wallet</p>
            <p className="text-xs font-mono truncate">
              {walletKeys.publicKey}
            </p>
          </div>
          {xlmBalance !== null && (
            <div className="text-right shrink-0">
              <p className="text-xs text-muted-foreground">Balance</p>
              <p className="text-sm font-semibold tabular-nums">
                {parseFloat(xlmBalance).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                XLM
              </p>
            </div>
          )}
        </div>
      )}

      {/* Lending Pool info — always visible */}
      {!poolLoading && (poolState || borrowConfig) && (
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="size-4 text-primary" />
              Lending Pool
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {poolState && (
                <>
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="size-3" />
                      Total Deposits
                    </p>
                    <p className="text-sm font-semibold tabular-nums mt-0.5">
                      {fmtXlm(stroopsToXlm(poolState.total_deposits))} XLM
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Coins className="size-3" />
                      Available
                    </p>
                    <p className="text-sm font-semibold tabular-nums mt-0.5">
                      {fmtXlm(stroopsToXlm(poolState.total_deposits - poolState.total_borrowed))} XLM
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Percent className="size-3" />
                      Utilization
                    </p>
                    <p className="text-sm font-semibold tabular-nums mt-0.5">
                      {poolState.total_deposits > BigInt(0)
                        ? (Number(poolState.total_borrowed * BigInt(10000) / poolState.total_deposits) / 100).toFixed(1)
                        : "0.0"}%
                    </p>
                  </div>
                </>
              )}
              {borrowConfig && (
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Shield className="size-3" />
                    Max LTV
                  </p>
                  <p className="text-sm font-semibold tabular-nums mt-0.5">
                    {bpsToPercent(borrowConfig.max_ltv)}%
                  </p>
                </div>
              )}
            </div>
            {borrowConfig && (
              <div className="mt-3 pt-3 border-t border-border flex flex-wrap gap-x-6 gap-y-1 text-xs text-foreground/60">
                <span>
                  Interest Rate: <span className="font-medium text-foreground">{bpsToPercent(borrowConfig.base_interest_rate)}%</span>
                </span>
                <span>
                  Liquidation: <span className="font-medium text-foreground">{bpsToPercent(borrowConfig.liquidation_threshold)}%</span>
                </span>
                <span>
                  Liq. Penalty: <span className="font-medium text-foreground">{bpsToPercent(borrowConfig.liquidation_penalty)}%</span>
                </span>
                <span>
                  Max Duration: <span className="font-medium text-foreground">{borrowConfig.max_loan_duration > BigInt(0) ? `${Number(borrowConfig.max_loan_duration) / 86400} days` : "∞"}</span>
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ============================================================ */}
      {/*  Active loan — block flow                                     */}
      {/* ============================================================ */}
      {hasActiveLoan && activeLoanChecked && (
        <Card className="border-amber-500/30 bg-amber-500/[0.03]">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <div className="size-14 rounded-2xl bg-amber-500/15 flex items-center justify-center mb-4">
              <AlertTriangle className="size-7 text-amber-500" />
            </div>
            <h3 className="text-base font-semibold">Active Loan Exists</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              You already have an active loan. Please repay your existing loan
              before borrowing again.
            </p>
            <Button
              className="mt-5"
              variant="outline"
              onClick={() => router.push("/dashboard")}
            >
              View Active Loans
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Wallet setup/unlock — show when wallet not yet unlocked */}
      {!walletKeys && !hasActiveLoan && (
        <WalletPinDialog mode={walletMode} onSuccess={setWalletKeys} />
      )}

      {/* ============================================================ */}
      {/*  STEP 1: Verify                                               */}
      {/* ============================================================ */}
      {step === "upload" && !hasActiveLoan && (
        <>
          {/* Monitoring session status - waiting for mobile submission */}
          {isVerifying && sessionStatus && sessionStatus !== "MOBILE_SUBMITTED" && (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Loader2 className="size-5 animate-spin text-primary" />
                  Monitoring Session Status
                </CardTitle>
                <CardDescription>
                  Waiting for verification submission. Current status: <span className="font-medium">{sessionStatus}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="size-2 rounded-full bg-primary animate-pulse" />
                    <span>Please complete verification on your mobile device</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Fetching credit data after mobile submission */}
          {isVerifying && sessionStatus === "MOBILE_SUBMITTED" && !reclaimCreditData && (
            <Card className="border-emerald-500/20 bg-emerald-500/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Loader2 className="size-5 animate-spin text-emerald-500" />
                  Processing Credit Data
                </CardTitle>
                <CardDescription>
                  Verification submitted successfully. Fetching your credit line...
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="size-4 text-emerald-500" />
                    <span>Mobile submission received</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin text-primary" />
                    <span>Retrieving credit data from API...</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Initial verification card */}
          {!isVerifying && !sessionStatus && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-xl bg-primary/15 flex items-center justify-center">
                    <ShieldCheck className="size-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Verify Your Receivables</CardTitle>
                    <CardDescription>
                      Complete verification via Reclaim to prove your receivables and get a credit line.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {verifyError && (
                  <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3">
                    <p className="text-xs text-destructive">{verifyError}</p>
                  </div>
                )}

                <Button
                  className="w-full"
                  size="lg"
                  onClick={startVerification}
                  disabled={isVerifying}
                >
                  {isVerifying ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="size-4" />
                  )}
                  {isVerifying ? "Verifying..." : "Verify with Reclaim"}
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* ============================================================ */}
      {/*  STEP 2: Tokenize — Credit Summary + Mint + Result            */}
      {/* ============================================================ */}
      {step === "tokenize" && !hasActiveLoan && (
        <>
          {/* Credit Approved — ready to tokenize */}
          {!isProcessing && !mintResult && creditData && (
            <Card className="border-emerald-500/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                    <CheckCircle2 className="size-6 text-emerald-500" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Credit Approved</CardTitle>
                    <CardDescription>
                      Your receivables have been verified and credit is ready.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="rounded-xl bg-muted/50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      User ID
                    </span>
                    <span className="text-sm font-mono truncate max-w-50">
                      {creditData.user_id}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Username
                    </span>
                    <span className="text-sm font-medium">
                      {creditData.extracted_username}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Session ID
                    </span>
                    <span className="text-sm font-mono truncate max-w-45">
                      {creditData.session_id}
                    </span>
                  </div>
                  <div className="border-t border-border pt-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      Credit Line
                    </span>
                    <span className="text-lg font-semibold text-emerald-500 tabular-nums">
                      {fmtXlm(creditData.credit_line)} XLM
                    </span>
                  </div>
                </div>

                {mintError && (
                  <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3">
                    <p className="text-xs text-destructive">{mintError}</p>
                  </div>
                )}

                {/* Tokenize button — only when wallet is unlocked */}
                {walletKeys && (
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleMintReceivable}
                  >
                    <Coins className="size-4" />
                    Tokenize on Stellar
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Processing progress */}
          {isProcessing && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Tokenizing Your Asset
                </CardTitle>
                <CardDescription>
                  Minting your receivable as an on-chain token on Stellar
                  testnet.
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
                                isComplete
                                  ? "bg-emerald-500/30"
                                  : "bg-border"
                              }`}
                            />
                          )}
                        </div>
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

          {/* Mint result */}
          {!isProcessing && mintResult && (
            <Card className="border-emerald-500/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                    <CheckCircle2 className="size-6 text-emerald-500" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      Receivable Minted
                    </CardTitle>
                    <CardDescription>
                      Your receivable has been tokenized on Stellar testnet.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="rounded-xl bg-muted/50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Receivable ID
                    </span>
                    <span className="text-sm font-mono font-medium">
                      RCV-{mintResult.receivableId}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Token Contract
                    </span>
                    <a
                      href={`https://stellar.expert/explorer/testnet/contract/${receivableNetworks.testnet.contractId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-mono text-primary hover:underline flex items-center gap-1"
                    >
                      {receivableNetworks.testnet.contractId.slice(0, 6)}...
                      {receivableNetworks.testnet.contractId.slice(-6)}
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                  {mintResult.txHash !== "unknown" && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Transaction
                      </span>
                      <a
                        href={`https://stellar.expert/explorer/testnet/tx/${mintResult.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-mono text-primary hover:underline flex items-center gap-1"
                      >
                        {mintResult.txHash.slice(0, 8)}...
                        {mintResult.txHash.slice(-8)}
                        <ExternalLink className="size-3" />
                      </a>
                    </div>
                  )}
                  {creditData && (
                    <div className="border-t border-border pt-3 flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">
                        Face Value
                      </span>
                      <span className="text-lg font-semibold text-emerald-500 tabular-nums">
                        {fmtXlm(creditData.credit_line)} XLM
                      </span>
                    </div>
                  )}
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => setStep("borrow")}
                >
                  <HandCoins className="size-4" />
                  Borrow Against Receivable
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* ============================================================ */}
      {/*  STEP 3: Borrow                                               */}
      {/* ============================================================ */}
      {step === "borrow" && !hasActiveLoan && (
        <>
          {/* Borrow form / confirmation */}
          {!borrowResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <HandCoins className="size-5 text-primary" />
                  Borrow Against Receivable
                </CardTitle>
                <CardDescription>
                  Use your minted receivable as collateral to borrow funds.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="rounded-xl bg-muted/50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Collateral
                    </span>
                    <span className="text-sm font-mono font-medium">
                      RCV-{mintResult?.receivableId}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Face Value
                    </span>
                    <span className="text-sm tabular-nums">
                      {fmtXlm(creditData?.credit_line ?? 0)} XLM
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Borrow Amount (80% LTV)
                    </span>
                    <span className="text-sm font-semibold tabular-nums">
                      {fmtXlm((creditData?.credit_line ?? 0) * 0.8)} XLM
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Duration
                    </span>
                    <span className="text-sm flex items-center gap-1">
                      <Clock className="size-3" />
                      90 days
                    </span>
                  </div>
                  {borrowConfig && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Interest Rate
                        </span>
                        <span className="text-sm">
                          {bpsToPercent(borrowConfig.base_interest_rate)}% APR
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Liquidation Threshold
                        </span>
                        <span className="text-sm">
                          {bpsToPercent(borrowConfig.liquidation_threshold)}%
                        </span>
                      </div>
                    </>
                  )}
                  {walletKeys && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Borrower
                      </span>
                      <span className="text-sm font-mono truncate max-w-[200px]">
                        {walletKeys.publicKey.slice(0, 8)}...
                        {walletKeys.publicKey.slice(-8)}
                      </span>
                    </div>
                  )}
                </div>

                {borrowError && (
                  <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3">
                    <p className="text-xs text-destructive">{borrowError}</p>
                  </div>
                )}

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleBorrow}
                  disabled={isBorrowing}
                >
                  {isBorrowing ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <HandCoins className="size-4" />
                  )}
                  {isBorrowing ? "Borrowing..." : "Confirm Borrow"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Borrow result */}
          {borrowResult && (
            <Card className="border-emerald-500/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                    <CheckCircle2 className="size-6 text-emerald-500" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Loan Created</CardTitle>
                    <CardDescription>
                      Your loan has been created on Stellar testnet.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="rounded-xl bg-muted/50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Loan ID
                    </span>
                    <span className="text-sm font-mono font-medium">
                      LOAN-{borrowResult.loanId}
                    </span>
                  </div>
                  {borrowResult.txHash !== "unknown" && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Transaction
                      </span>
                      <a
                        href={`https://stellar.expert/explorer/testnet/tx/${borrowResult.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-mono text-primary hover:underline flex items-center gap-1"
                      >
                        {borrowResult.txHash.slice(0, 8)}...
                        {borrowResult.txHash.slice(-8)}
                        <ExternalLink className="size-3" />
                      </a>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Collateral
                    </span>
                    <span className="text-sm font-mono">
                      RCV-{mintResult?.receivableId}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Collateral Value
                    </span>
                    <span className="text-sm tabular-nums">
                      {loanDetails
                        ? `${fmtXlm(stroopsToXlm(loanDetails.collateral_value))} XLM`
                        : `${fmtXlm(creditData?.credit_line ?? 0)} XLM`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="size-3" />
                      Due Date
                    </span>
                    <span className="text-sm">
                      {loanDetails
                        ? new Date(Number(loanDetails.due_date) * 1000).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "90 days"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Interest Rate
                    </span>
                    <span className="text-sm">
                      {loanDetails
                        ? `${bpsToPercent(loanDetails.interest_rate)}%`
                        : borrowConfig
                          ? `${bpsToPercent(borrowConfig.base_interest_rate)}%`
                          : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Current LTV
                    </span>
                    <Badge variant="secondary" className="text-xs tabular-nums">
                      {loanLtv !== null
                        ? `${bpsToPercent(loanLtv).toFixed(1)}%`
                        : "80%"}
                    </Badge>
                  </div>
                  <div className="border-t border-border pt-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      Principal
                    </span>
                    <span className="text-lg font-semibold text-emerald-500 tabular-nums">
                      {loanDetails
                        ? `${fmtXlm(stroopsToXlm(loanDetails.principal))} XLM`
                        : `${fmtXlm((creditData?.credit_line ?? 0) * 0.8)} XLM`}
                    </span>
                  </div>
                  {loanDetails && Number(loanDetails.accrued_interest) > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Accrued Interest
                      </span>
                      <span className="text-sm tabular-nums">
                        {fmtXlm(stroopsToXlm(loanDetails.accrued_interest))} XLM
                      </span>
                    </div>
                  )}
                  {xlmBalance !== null && (
                    <div className="border-t border-border pt-3 flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">
                        Wallet Balance
                      </span>
                      <span className="text-lg font-semibold tabular-nums">
                        {parseFloat(xlmBalance).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        XLM
                      </span>
                    </div>
                  )}
                </div>

                <Badge
                  variant="secondary"
                  className="text-emerald-500 w-full justify-center py-2"
                >
                  <CheckCircle2 className="size-4 mr-1" />
                  {loanDetails ? `Loan ${loanDetails.status.tag}` : "Loan Active"}
                </Badge>

                <Button
                  variant="outline"
                  className="w-full"
                  size="lg"
                  onClick={handleStartOver}
                >
                  <RefreshCw className="size-4" />
                  Start Over
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
