/* ------------------------------------------------------------------ */
/*  Insurance Claims — Types & localStorage Store                      */
/* ------------------------------------------------------------------ */

export type ClaimStatus =
  | "processing"
  | "credit-ready"
  | "deposited"
  | "partially-withdrawn"
  | "fully-withdrawn";

export interface InsuranceClaim {
  id: string;
  claimNumber: string;
  insurer: string;
  claimAmount: number;
  creditAmount: number;
  tokenId: string;
  status: ClaimStatus;
  fileName: string;
  fileSize: number;
  createdAt: string;
  depositedAt?: string;
  walletDepositAmount: number;
  withdrawnAmount: number;
}

const STORAGE_KEY = "hypermonks_claims";
const WALLET_KEY = "hypermonks_wallet_balance";

/* ---- Read ---- */

export function getClaims(): InsuranceClaim[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as InsuranceClaim[]) : [];
  } catch {
    return [];
  }
}

export function getClaimById(id: string): InsuranceClaim | undefined {
  return getClaims().find((c) => c.id === id);
}

/* ---- Write ---- */

export function saveClaim(claim: InsuranceClaim): void {
  const claims = getClaims();
  const idx = claims.findIndex((c) => c.id === claim.id);
  if (idx >= 0) {
    claims[idx] = claim;
  } else {
    claims.unshift(claim); // newest first
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(claims));
}

export function updateClaim(
  id: string,
  updates: Partial<InsuranceClaim>
): InsuranceClaim | undefined {
  const claims = getClaims();
  const idx = claims.findIndex((c) => c.id === id);
  if (idx < 0) return undefined;
  claims[idx] = { ...claims[idx], ...updates };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(claims));
  return claims[idx];
}

export function deleteClaim(id: string): void {
  const claims = getClaims().filter((c) => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(claims));
}

/* ---- Wallet balance ---- */

export function getWalletBalance(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(WALLET_KEY);
    return raw ? Number(raw) : 0;
  } catch {
    return 0;
  }
}

export function setWalletBalance(balance: number): void {
  localStorage.setItem(WALLET_KEY, String(Math.round(balance * 100) / 100));
}

/* ---- Helpers ---- */

export function generateClaimId(): string {
  return `claim_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function generateTokenId(): string {
  return `HM-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function getStatusLabel(status: ClaimStatus): string {
  switch (status) {
    case "processing":
      return "Processing";
    case "credit-ready":
      return "Credit Ready";
    case "deposited":
      return "Deposited";
    case "partially-withdrawn":
      return "Partially Withdrawn";
    case "fully-withdrawn":
      return "Fully Withdrawn";
  }
}

export function getStatusColor(status: ClaimStatus): string {
  switch (status) {
    case "processing":
      return "text-amber-500";
    case "credit-ready":
      return "text-blue-500";
    case "deposited":
      return "text-emerald-500";
    case "partially-withdrawn":
      return "text-orange-500";
    case "fully-withdrawn":
      return "text-muted-foreground";
  }
}
