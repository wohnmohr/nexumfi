/**
 * AML check: returns blocked reason if vendor or policy_holder has AML status
 * that is not CLEAR. Used by login flow and middleware to block entire account access.
 */

import { apiFetch } from "./api-fetch";

export type AmlBlockedReason = "FLAGGED" | "ERROR";

export interface AmlCheckResult {
  blocked: boolean;
  reason?: AmlBlockedReason;
}

export async function checkAmlStatus(
  accessToken: string
): Promise<AmlCheckResult> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) return { blocked: false };

    const res = await apiFetch(`${baseUrl}/api/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) return { blocked: false };

    const data = (await res.json()) as {
      vendor?: { aml_status?: string | null } | null;
      policy_holder?: { aml_status?: string | null } | null;
    };

    const amlStatus =
      data.vendor?.aml_status ?? data.policy_holder?.aml_status;

    if (
      amlStatus == null ||
      amlStatus === "" ||
      amlStatus === "CLEAR"
    ) {
      return { blocked: false };
    }

    const reason: AmlBlockedReason =
      amlStatus === "FLAGGED" ? "FLAGGED" : "ERROR";
    return { blocked: true, reason };
  } catch {
    return { blocked: false };
  }
}
