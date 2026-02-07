import { ReclaimProofRequest } from "@reclaimprotocol/js-sdk";

/* ------------------------------------------------------------------ */
/*  Fetch a proof request from our backend API route                   */
/* ------------------------------------------------------------------ */

interface InitOptions {
  /** Optional user/session identifier passed as context */
  userId?: string;
  /** Optional message passed as context */
  message?: string;
}

/**
 * Fetches an initialized Reclaim proof request from the backend.
 * The backend keeps APP_SECRET secure; the frontend only gets
 * the serialized proof-request object.
 */
export async function getProofRequest(
  options?: InitOptions
): Promise<ReclaimProofRequest> {
  const params = new URLSearchParams();
  if (options?.userId) params.set("userId", options.userId);
  if (options?.message) params.set("message", options.message);

  const qs = params.toString();
  const url = `/api/reclaim${qs ? `?${qs}` : ""}`;

  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.error ?? "Failed to get proof request");
  }

  // Re-hydrate the proof request object on the frontend
  const proofRequest = await ReclaimProofRequest.fromJsonString(
    data.proofRequest
  );

  return proofRequest;
}

/* ------------------------------------------------------------------ */
/*  Start a verification session                                       */
/* ------------------------------------------------------------------ */

interface VerifyOptions extends InitOptions {
  /** Called when the proof is successfully generated */
  onSuccess?: (proof: unknown) => void;
  /** Called if the user cancels or an error occurs */
  onError?: (error: Error) => void;
}

/**
 * Full flow: fetches a proof request from the backend,
 * generates a verification URL, and starts a session.
 *
 * Returns the verification request URL (QR code / deep link).
 */
export async function startVerification(
  options?: VerifyOptions
): Promise<string> {
  const proofRequest = await getProofRequest(options);

  // Generate the verification request URL
  const requestUrl = await proofRequest.getRequestUrl();

  // Start the session and listen for proof / errors
  await proofRequest.startSession({
    onSuccess: (proof) => {
      options?.onSuccess?.(proof);
    },
    onError: (error) => {
      options?.onError?.(
        error instanceof Error ? error : new Error(String(error))
      );
    },
  });

  return requestUrl;
}
