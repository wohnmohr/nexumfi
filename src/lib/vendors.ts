/* ------------------------------------------------------------------ */
/*  Vendor (Buyer) KYC types, constants & localStorage helpers         */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = "hypermonks_vendors";

/* ---- Country & entity-type options ---- */

export type Country = "IN" | "US";

export const COUNTRY_OPTIONS = [
  { value: "IN" as const, label: "India" },
  { value: "US" as const, label: "United States" },
];

export const INDIA_ENTITY_TYPES = [
  { value: "proprietorship", label: "Proprietorship" },
  { value: "partnership", label: "Partnership" },
  { value: "huf", label: "Hindu Undivided Family (HUF)" },
  { value: "company", label: "Company" },
  { value: "llp", label: "Limited Liability Partnership (LLP)" },
  { value: "other", label: "Other" },
];

export const US_ENTITY_TYPES = [
  { value: "sole_proprietorship", label: "Sole Proprietorship" },
  { value: "llc", label: "Limited Liability Company (LLC)" },
  { value: "corporation", label: "Corporation" },
  { value: "partnership", label: "Partnership" },
  { value: "trust", label: "Trust" },
  { value: "other", label: "Other" },
];

export const INDIA_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
  "West Bengal", "Delhi", "Jammu & Kashmir", "Ladakh", "Chandigarh",
  "Puducherry", "Lakshadweep", "Andaman & Nicobar Islands",
  "Dadra & Nagar Haveli and Daman & Diu",
];

export const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
  "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
  "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
  "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
  "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
  "New Hampshire", "New Jersey", "New Mexico", "New York",
  "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
  "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
  "West Virginia", "Wisconsin", "Wyoming", "District of Columbia",
];

/* ---- KYC sub-types ---- */

export interface KycIndia {
  entity_type: string;
  pan: string;
  cin_or_llpin?: string;
}

export interface KycUS {
  entity_type: string;
  ein: string;
  state_of_incorporation: string;
}

/* ---- Main Vendor (Buyer) type ---- */

export interface Vendor {
  id: string;
  buyer_country: Country;
  legal_name: string;
  contact_email: string;
  kyc_india?: KycIndia;
  kyc_us?: KycUS;
  /* Meta */
  status: "draft" | "pending_verification" | "verified" | "rejected";
  created_at: string;
  updated_at: string;
}

/* ---- Helpers ---- */

export function generateVendorId(): string {
  return `VND-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

export function getVendors(): Vendor[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveVendor(vendor: Vendor): void {
  const vendors = getVendors();
  vendors.unshift(vendor);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(vendors));
}

export function getVendorById(id: string): Vendor | undefined {
  return getVendors().find((v) => v.id === id);
}

export function getStatusLabel(status: Vendor["status"]): string {
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

export function getStatusColor(status: Vendor["status"]): string {
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

export function maskValue(value: string, visibleChars = 4): string {
  if (value.length <= visibleChars) return value;
  return "\u2022".repeat(value.length - visibleChars) + value.slice(-visibleChars);
}

export function getEntityLabel(country: Country, entityType: string): string {
  const list = country === "IN" ? INDIA_ENTITY_TYPES : US_ENTITY_TYPES;
  return list.find((e) => e.value === entityType)?.label ?? entityType;
}
