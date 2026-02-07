/* ------------------------------------------------------------------ */
/*  Insurer KYC types, constants & localStorage helpers                */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = "hypermonks_insurers";

/* ---- Country-specific options ---- */

export const INDIA_INSURER_TYPES = [
  { value: "life_insurance", label: "Life Insurance" },
  { value: "general_insurance", label: "General Insurance" },
  { value: "health_insurance", label: "Health Insurance" },
  { value: "reinsurance", label: "Reinsurance" },
  { value: "other", label: "Other" },
];

export const US_INSURER_TYPES = [
  { value: "property_casualty", label: "Property & Casualty" },
  { value: "life_insurance", label: "Life Insurance" },
  { value: "health_insurance", label: "Health Insurance" },
  { value: "reinsurance", label: "Reinsurance" },
  { value: "other", label: "Other" },
];

/* ---- Interfaces ---- */

export interface InsurerAddress {
  line1: string;
  line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface IndiaBankAccount {
  ifsc: string;
  account_holder_name: string;
  account_number: string;
}

export interface USBankAccount {
  routing_number: string;
  account_holder_name: string;
  account_number: string;
}

export interface KeyPerson {
  name: string;
  designation: string;
  email: string;
  phone: string;
}

export interface Insurer {
  id: string;
  company_name: string;
  country: "IN" | "US";
  insurer_type: string;
  /* India regulatory */
  irdai_registration_number?: string;
  cin?: string;
  pan?: string;
  gstin?: string;
  /* US regulatory */
  naic_code?: string;
  state_of_domicile?: string;
  ein?: string;
  /* Shared */
  address: InsurerAddress;
  india_bank?: IndiaBankAccount;
  us_bank?: USBankAccount;
  key_personnel: KeyPerson[];
  /* Meta */
  status: "draft" | "pending_verification" | "verified" | "rejected";
  created_at: string;
  updated_at: string;
}

/* ---- Helpers ---- */

export function generateInsurerId(): string {
  return `INS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

export function getInsurers(): Insurer[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveInsurer(insurer: Insurer): void {
  const insurers = getInsurers();
  insurers.unshift(insurer);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(insurers));
}

export function getInsurerById(id: string): Insurer | undefined {
  return getInsurers().find((i) => i.id === id);
}

export function getStatusLabel(status: Insurer["status"]): string {
  switch (status) {
    case "draft":
      return "Draft";
    case "pending_verification":
      return "Pending Verification";
    case "verified":
      return "Verified";
    case "rejected":
      return "Rejected";
    default:
      return status;
  }
}

export function getStatusColor(status: Insurer["status"]): string {
  switch (status) {
    case "draft":
      return "text-muted-foreground";
    case "pending_verification":
      return "text-amber-500";
    case "verified":
      return "text-emerald-500";
    case "rejected":
      return "text-destructive";
    default:
      return "";
  }
}

export function getInsurerTypeLabel(
  country: "IN" | "US",
  type: string
): string {
  const list =
    country === "IN" ? INDIA_INSURER_TYPES : US_INSURER_TYPES;
  return list.find((t) => t.value === type)?.label ?? type;
}

export function maskValue(value: string, visibleChars = 4): string {
  if (value.length <= visibleChars) return value;
  return "\u2022".repeat(value.length - visibleChars) + value.slice(-visibleChars);
}
