"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Wallet,
  Send,
  Landmark,
  ArrowUpRight,
  ArrowDownLeft,
  Loader2,
  Copy,
  Check,
  ExternalLink,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { getStellarWallet, loadStellarWalletKey } from "@/lib/stellar-wallet";
import { WalletPinDialog } from "@/components/wallet-pin-dialog";
import { Keypair, TransactionBuilder, Networks, Operation, Asset, BASE_FEE } from "@stellar/stellar-sdk";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface HorizonBalance {
  asset_type: string;
  asset_code?: string;
  asset_issuer?: string;
  balance: string;
}

interface HorizonOperation {
  id: string;
  type: string;
  created_at: string;
  transaction_hash: string;
  source_account: string;
  // Payment fields
  from?: string;
  to?: string;
  amount?: string;
  asset_type?: string;
  asset_code?: string;
  // Create account fields
  funder?: string;
  account?: string;
  starting_balance?: string;
  // Contract invoke fields
  function?: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function fmtXlm(val: string | number): string {
  const n = typeof val === "string" ? parseFloat(val) : val;
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}

function shortenAddress(addr: string, chars = 6): string {
  if (addr.length <= chars * 2 + 3) return addr;
  return `${addr.slice(0, chars)}...${addr.slice(-chars)}`;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffSec = Math.floor((now - then) / 1000);

  if (diffSec < 60) return "just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 2592000) return `${Math.floor(diffSec / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function WalletPage() {
  // Wallet state
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [walletKeys, setWalletKeys] = useState<{
    publicKey: string;
    privateKey: string;
  } | null>(null);
  const [walletMode, setWalletMode] = useState<"create" | "unlock">("create");

  // Balance state
  const [balances, setBalances] = useState<HorizonBalance[]>([]);
  const [balanceLoading, setBalanceLoading] = useState(true);

  // Transactions state
  const [operations, setOperations] = useState<HorizonOperation[]>([]);
  const [opsLoading, setOpsLoading] = useState(true);

  // Send dialog state
  const [sendOpen, setSendOpen] = useState(false);
  const [sendTo, setSendTo] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [sendMemo, setSendMemo] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);

  // Withdraw dialog state
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  // Copy state
  const [copied, setCopied] = useState(false);

  // PIN unlock dialog for send
  const [needsPin, setNeedsPin] = useState(false);

  const nativeBalance = balances.find((b) => b.asset_type === "native");
  const xlmAmount = nativeBalance ? parseFloat(nativeBalance.balance) : 0;

  // Fetch balances from Horizon
  const fetchBalances = useCallback(async (pubKey: string) => {
    setBalanceLoading(true);
    try {
      const res = await fetch(
        `https://horizon-testnet.stellar.org/accounts/${pubKey}`
      );
      if (!res.ok) {
        setBalances([]);
        return;
      }
      const data = await res.json();
      setBalances(data.balances ?? []);
    } catch {
      setBalances([]);
    } finally {
      setBalanceLoading(false);
    }
  }, []);

  // Fetch recent operations from Horizon
  const fetchOperations = useCallback(async (pubKey: string) => {
    setOpsLoading(true);
    try {
      const res = await fetch(
        `https://horizon-testnet.stellar.org/accounts/${pubKey}/operations?order=desc&limit=10`
      );
      if (!res.ok) {
        setOperations([]);
        return;
      }
      const data = await res.json();
      setOperations(data._embedded?.records ?? []);
    } catch {
      setOperations([]);
    } finally {
      setOpsLoading(false);
    }
  }, []);

  // Read wallet on mount
  useEffect(() => {
    const wallet = getStellarWallet();
    if (wallet) {
      setPublicKey(wallet.publicKey);
      setWalletMode("unlock");
      fetchBalances(wallet.publicKey);
      fetchOperations(wallet.publicKey);
    } else {
      setBalanceLoading(false);
      setOpsLoading(false);
    }
  }, [fetchBalances, fetchOperations]);

  // When wallet unlocked, refresh
  useEffect(() => {
    if (!walletKeys) return;
    setPublicKey(walletKeys.publicKey);
    fetchBalances(walletKeys.publicKey);
    fetchOperations(walletKeys.publicKey);
  }, [walletKeys, fetchBalances, fetchOperations]);

  const handleCopy = () => {
    if (!publicKey) return;
    navigator.clipboard.writeText(publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefresh = () => {
    if (!publicKey) return;
    fetchBalances(publicKey);
    fetchOperations(publicKey);
  };

  // Handle send — requires unlocked wallet
  const handleSendClick = () => {
    if (!walletKeys) {
      setNeedsPin(true);
      return;
    }
    setSendOpen(true);
  };

  const handleSend = async () => {
    if (!walletKeys || !sendTo || !sendAmount) return;

    setSending(true);
    setSendError(null);
    setSendSuccess(null);

    try {
      // Validate destination
      try {
        Keypair.fromPublicKey(sendTo);
      } catch {
        throw new Error("Invalid destination address");
      }

      const amount = parseFloat(sendAmount);
      if (isNaN(amount) || amount <= 0) throw new Error("Invalid amount");
      if (amount > xlmAmount - 1.5)
        throw new Error("Insufficient balance (need ~1.5 XLM reserve)");

      // Load sender account from Horizon
      const accountRes = await fetch(
        `https://horizon-testnet.stellar.org/accounts/${walletKeys.publicKey}`
      );
      if (!accountRes.ok) throw new Error("Failed to load account");
      const accountData = await accountRes.json();

      // Check if destination exists
      const destRes = await fetch(
        `https://horizon-testnet.stellar.org/accounts/${sendTo}`
      );

      let transaction;

      if (destRes.ok) {
        // Destination exists — use payment operation
        transaction = new TransactionBuilder(
          {
            accountId: () => walletKeys.publicKey,
            sequenceNumber: () => accountData.sequence,
            incrementSequenceNumber: () => {},
          } as unknown as Parameters<typeof TransactionBuilder.prototype.addOperation>[0] extends never ? never : ConstructorParameters<typeof TransactionBuilder>[0],
          {
            fee: BASE_FEE,
            networkPassphrase: Networks.TESTNET,
          }
        )
          .addOperation(
            Operation.payment({
              destination: sendTo,
              asset: Asset.native(),
              amount: amount.toFixed(7),
            })
          )
          .setTimeout(30)
          .build();
      } else {
        // Destination doesn't exist — use create account
        transaction = new TransactionBuilder(
          {
            accountId: () => walletKeys.publicKey,
            sequenceNumber: () => accountData.sequence,
            incrementSequenceNumber: () => {},
          } as unknown as ConstructorParameters<typeof TransactionBuilder>[0],
          {
            fee: BASE_FEE,
            networkPassphrase: Networks.TESTNET,
          }
        )
          .addOperation(
            Operation.createAccount({
              destination: sendTo,
              startingBalance: amount.toFixed(7),
            })
          )
          .setTimeout(30)
          .build();
      }

      // Sign
      const keypair = Keypair.fromSecret(walletKeys.privateKey);
      transaction.sign(keypair);

      // Submit
      const submitRes = await fetch(
        "https://horizon-testnet.stellar.org/transactions",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `tx=${encodeURIComponent(transaction.toXDR())}`,
        }
      );

      if (!submitRes.ok) {
        const errData = await submitRes.json().catch(() => null);
        throw new Error(
          errData?.extras?.result_codes?.operations?.join(", ") ??
            "Transaction failed"
        );
      }

      const submitData = await submitRes.json();
      setSendSuccess(submitData.hash);
      setSendTo("");
      setSendAmount("");
      setSendMemo("");

      // Refresh data
      fetchBalances(walletKeys.publicKey);
      fetchOperations(walletKeys.publicKey);
    } catch (err) {
      setSendError(err instanceof Error ? err.message : String(err));
    } finally {
      setSending(false);
    }
  };

  // Get operation display info
  const getOpInfo = (op: HorizonOperation) => {
    switch (op.type) {
      case "payment": {
        const isSent = op.from === publicKey;
        return {
          label: isSent ? "Sent" : "Received",
          amount: op.amount ?? "0",
          asset: op.asset_code ?? "XLM",
          icon: isSent ? ArrowUpRight : ArrowDownLeft,
          color: isSent ? "text-red-500" : "text-emerald-500",
          prefix: isSent ? "-" : "+",
          peer: isSent ? op.to : op.from,
        };
      }
      case "create_account": {
        const isFunder = op.funder === publicKey;
        return {
          label: isFunder ? "Funded Account" : "Account Created",
          amount: op.starting_balance ?? "0",
          asset: "XLM",
          icon: isFunder ? ArrowUpRight : ArrowDownLeft,
          color: isFunder ? "text-red-500" : "text-emerald-500",
          prefix: isFunder ? "-" : "+",
          peer: isFunder ? op.account : op.funder,
        };
      }
      case "invoke_host_function":
        return {
          label: "Contract Call",
          amount: null,
          asset: "",
          icon: Landmark,
          color: "text-blue-500",
          prefix: "",
          peer: null,
        };
      default:
        return {
          label: op.type.replace(/_/g, " "),
          amount: null,
          asset: "",
          icon: Wallet,
          color: "text-muted-foreground",
          prefix: "",
          peer: null,
        };
    }
  };

  /* ---------------------------------------------------------------- */
  /*  No wallet — show setup                                           */
  /* ---------------------------------------------------------------- */
  if (!publicKey && !balanceLoading) {
    return (
      <div className="p-4 md:p-6 space-y-6 max-w-3xl mx-auto">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">Wallet</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create a Stellar wallet to get started.
          </p>
        </div>
        <WalletPinDialog mode="create" onSuccess={setWalletKeys} />
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */
  return (
    <div className="p-4 md:p-6 space-y-6 max-w-3xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">Wallet</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your Stellar wallet and transactions.
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRefresh}
          disabled={balanceLoading}
        >
          <RefreshCw
            className={`size-4 ${balanceLoading ? "animate-spin" : ""}`}
          />
        </Button>
      </div>

      {/* Balance card */}
      <Card className="border-primary/20 bg-primary/[0.03]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wallet className="size-5 text-primary" />
            Wallet Balance
          </CardTitle>
          <CardDescription>
            {publicKey && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 font-mono text-xs hover:text-foreground transition-colors mt-1"
              >
                {shortenAddress(publicKey, 8)}
                {copied ? (
                  <Check className="size-3 text-emerald-500" />
                ) : (
                  <Copy className="size-3" />
                )}
              </button>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {balanceLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Loading balance...
              </span>
            </div>
          ) : (
            <>
              {/* XLM balance */}
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold tabular-nums">
                    {fmtXlm(xlmAmount)}
                  </span>
                  <span className="text-lg text-muted-foreground font-medium">
                    XLM
                  </span>
                </div>
                {balances.length > 1 && (
                  <div className="mt-3 space-y-1.5">
                    {balances
                      .filter((b) => b.asset_type !== "native")
                      .map((b) => (
                        <div
                          key={`${b.asset_code}-${b.asset_issuer}`}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-muted-foreground">
                            {b.asset_code ?? b.asset_type}
                          </span>
                          <span className="font-medium tabular-nums">
                            {fmtXlm(b.balance)}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {xlmAmount > 0 ? (
                  <>
                    <Button className="flex-1" onClick={handleSendClick}>
                      <Send className="size-4" />
                      Send
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setWithdrawOpen(true)}
                    >
                      <Landmark className="size-4" />
                      Withdraw
                    </Button>
                  </>
                ) : (
                  <div className="rounded-xl bg-muted/50 p-4 text-center w-full">
                    <p className="text-sm text-muted-foreground">
                      No funds available. Get credit to receive funds.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
          <CardDescription>Last 10 transactions on your wallet</CardDescription>
        </CardHeader>
        <CardContent>
          {opsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">
                Loading transactions...
              </span>
            </div>
          ) : operations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="size-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
                <Wallet className="size-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                No transactions yet
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {operations.map((op) => {
                const info = getOpInfo(op);
                const Icon = info.icon;

                return (
                  <a
                    key={op.id}
                    href={`https://stellar.expert/explorer/testnet/tx/${op.transaction_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/40 transition-colors group"
                  >
                    {/* Icon */}
                    <div
                      className={`size-9 rounded-lg flex items-center justify-center shrink-0 bg-muted`}
                    >
                      <Icon className={`size-4 ${info.color}`} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{info.label}</p>
                        <ExternalLink className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {info.peer
                          ? shortenAddress(info.peer)
                          : timeAgo(op.created_at)}
                      </p>
                    </div>

                    {/* Amount + time */}
                    <div className="text-right shrink-0">
                      {info.amount ? (
                        <p
                          className={`text-sm font-medium tabular-nums ${info.color}`}
                        >
                          {info.prefix}
                          {fmtXlm(info.amount)} {info.asset}
                        </p>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          {info.label}
                        </Badge>
                      )}
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {timeAgo(op.created_at)}
                      </p>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ---- Send Dialog ---- */}
      <Dialog
        open={sendOpen}
        onOpenChange={(open) => {
          setSendOpen(open);
          if (!open) {
            setSendError(null);
            setSendSuccess(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send XLM</DialogTitle>
            <DialogDescription>
              Transfer XLM to another Stellar wallet address.
            </DialogDescription>
          </DialogHeader>

          {sendSuccess ? (
            <div className="space-y-4 py-2">
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center space-y-2">
                <Check className="size-8 text-emerald-500 mx-auto" />
                <p className="text-sm font-medium">Transaction Sent</p>
                <a
                  href={`https://stellar.expert/explorer/testnet/tx/${sendSuccess}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-primary hover:underline inline-flex items-center gap-1"
                >
                  {shortenAddress(sendSuccess, 10)}
                  <ExternalLink className="size-3" />
                </a>
              </div>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => {
                  setSendOpen(false);
                  setSendSuccess(null);
                }}
              >
                Done
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="send-to">Destination Address</Label>
                  <Input
                    id="send-to"
                    placeholder="G..."
                    value={sendTo}
                    onChange={(e) => setSendTo(e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="send-amount">Amount (XLM)</Label>
                    <button
                      className="text-xs text-primary hover:underline"
                      onClick={() => {
                        const max = Math.max(0, xlmAmount - 1.5);
                        setSendAmount(max.toFixed(7));
                      }}
                    >
                      Max: {fmtXlm(Math.max(0, xlmAmount - 1.5))}
                    </button>
                  </div>
                  <Input
                    id="send-amount"
                    type="number"
                    placeholder="0.00"
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                    className="tabular-nums"
                  />
                </div>

                {sendError && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 flex items-start gap-2">
                    <AlertTriangle className="size-4 text-destructive shrink-0 mt-0.5" />
                    <p className="text-xs text-destructive">{sendError}</p>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setSendOpen(false)}
                  disabled={sending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSend}
                  disabled={sending || !sendTo || !sendAmount}
                >
                  {sending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                  {sending ? "Sending..." : "Send"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ---- Withdraw (Anchor off-ramp) Dialog ---- */}
      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Withdraw to Fiat</DialogTitle>
            <DialogDescription>
              Convert your XLM to fiat currency via Stellar Anchor.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 text-center space-y-2">
              <AlertTriangle className="size-8 text-amber-500 mx-auto" />
              <p className="text-sm font-medium">Coming Soon</p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Fiat off-ramp via Stellar Anchor will be available soon.
                You&apos;ll be able to withdraw to your bank account directly.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setWithdrawOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---- PIN unlock for send ---- */}
      {needsPin && (
        <Dialog open={needsPin} onOpenChange={setNeedsPin}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Unlock Wallet</DialogTitle>
              <DialogDescription>
                Enter your PIN to unlock the wallet for sending.
              </DialogDescription>
            </DialogHeader>
            <WalletPinDialog
              mode={walletMode}
              onSuccess={(keys) => {
                setWalletKeys(keys);
                setNeedsPin(false);
                setSendOpen(true);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
