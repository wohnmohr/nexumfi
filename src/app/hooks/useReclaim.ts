// hooks/useReclaim.js
import { useState, useCallback } from 'react';
import { Proof, ReclaimProofRequest } from '@reclaimprotocol/js-sdk';

export function useReclaim() {
  const [proofs, setProofs] = useState<Proof[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetLoading = useCallback(() => {
    setIsLoading(false);
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
          resetLoading();
          setError(null);
        },
      });

      await reclaimProofRequest.triggerReclaimFlow();

      await reclaimProofRequest.startSession({
        onSuccess: async (proofs) => {
          reclaimProofRequest.closeModal();
          setProofs(proofs as unknown as Proof[]);
          //await uploadProofs(proofs);
          console.log(proofs as unknown as Proof[]);
          setIsLoading(false);
        },
        onError: (err: unknown) => {
          reclaimProofRequest.closeModal();
          setError(err instanceof Error ? err.message : String(err));
          setIsLoading(false);
        },
      });
    } catch (err: any) {
      setError(err instanceof Error ? err.message : String(err));
      setIsLoading(false);
    }
  }, [resetLoading]);

  return { proofs, isLoading, error, startVerification };
}
