// hooks/useReclaim.js
import { useState, useCallback, useRef, useEffect } from 'react';
import { Proof, ReclaimProofRequest } from '@reclaimprotocol/js-sdk';
import { apiFetch } from '@/lib/api-fetch';
import { createClient } from '@/lib/supabase/client';

const STATUS_POLL_INTERVAL_MS = 3000;

export interface CreditData {
  user_id: string;
  credit_line: number;
  currency: string;
  extracted_username: string;
  context_message: string;
  session_id: string;
  raw_session?: Record<string, unknown>;
}

export function useReclaim() {
  const [proofs, setProofs] = useState<Proof[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creditData, setCreditData] = useState<CreditData | null>(null);
  const [sessionStatus, setSessionStatus] = useState<string | null>(null);
  const statusPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const clearStatusPoll = useCallback(() => {
    if (statusPollRef.current) {
      clearInterval(statusPollRef.current);
      statusPollRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearStatusPoll();
  }, [clearStatusPoll]);

  const setMockCreditData = useCallback(() => {
    setCreditData({
      user_id: 'mock-user-123',
      credit_line: 5000,
      currency: 'USDT',
      extracted_username: 'Test User',
      context_message: 'Mock credit for testing withdraw API',
      session_id: `mock-session-${Date.now()}`,
    });
  }, []);

  const startVerification = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch config from backend
      const response = await fetch('/api/reclaim');
      const { proofRequest } = await response.json();

      const reclaimProofRequest = await ReclaimProofRequest.fromJsonString(
        proofRequest
      );
      console.log('ReclaimProofRequest created:', reclaimProofRequest);

      // Handle modal close (user cancels verification)
      reclaimProofRequest.setModalOptions({
        modalPopupTimer: 5, // Auto-close after 5 minutes (default: 1)
        onClose: () => {
          clearStatusPoll();
          resetLoading();
          setError(null);
        },
      });

      await reclaimProofRequest.triggerReclaimFlow();

      // Poll listen/status API – when status is MOBILE_SUBMITTED, call /api/credit
      const statusUrl = reclaimProofRequest.getStatusUrl();
      statusPollRef.current = setInterval(async () => {
        try {
          const res = await apiFetch(statusUrl, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          });
          const data = await res.json();
          const status = data?.session?.status;
          
          // Update session status for UI monitoring
          if (status) {
            setSessionStatus(status);
          }
          
          if (status === 'MOBILE_SUBMITTED') {
            clearStatusPoll();
            setIsLoading(true); // Show loading while fetching credit data
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
            const creditUrl = baseUrl ? `${baseUrl}/api/credit` : '/api/credit';
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (session?.access_token) {
              headers['Authorization'] = `Bearer ${session.access_token}`;
            }
            const creditRes = await apiFetch(creditUrl, {
              method: 'POST',
              headers,
              body: JSON.stringify(data),
            });
            if (creditRes.ok) {
              const creditJson = await creditRes.json();
              if (creditJson?.user_id != null && creditJson?.credit_line != null) {
                setCreditData({
                  user_id: creditJson.user_id,
                  credit_line: creditJson.credit_line,
                  currency: creditJson.currency ?? 'USDT',
                  extracted_username: creditJson.extracted_username ?? '',
                  context_message: creditJson.context_message ?? '',
                  session_id: creditJson.session_id ?? '',
                  raw_session: creditJson.raw_session,
                });
                setIsLoading(false); // Credit data loaded, ready for next step
              } else {
                setIsLoading(false);
              }
            } else {
              setIsLoading(false);
            }
          }
        } catch {
          // Ignore poll errors; startSession handles the main flow
        }
      }, STATUS_POLL_INTERVAL_MS);

      await reclaimProofRequest.startSession({
        onSuccess: async (proofs) => {
          clearStatusPoll();
          reclaimProofRequest.closeModal();
          setProofs(proofs as unknown as Proof[]);
          console.log(proofs as unknown as Proof[]);
          setIsLoading(false);
        },
        onError: (err: unknown) => {
          clearStatusPoll();
          reclaimProofRequest.closeModal();
          setError(err instanceof Error ? err.message : String(err));
          setIsLoading(false);
        },
      });
    } catch (err: unknown) {
      clearStatusPoll();
      setError(err instanceof Error ? err.message : String(err));
      setIsLoading(false);
    }
  }, [resetLoading, clearStatusPoll]);

  return { proofs, isLoading, error, startVerification, creditData, setMockCreditData, sessionStatus };
}
