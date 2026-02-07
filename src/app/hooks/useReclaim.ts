// hooks/useReclaim.js
import { useState, useCallback } from 'react';
import { Proof, ReclaimProofRequest } from '@reclaimprotocol/js-sdk';
 
export function useReclaim() {
  const [proofs, setProofs] = useState<Proof[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
 
  const startVerification = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
 
      // Fetch config from backend
      const response = await fetch('/api/reclaim');
      const { reclaimProofRequestConfig } = await response.json();
 
      const reclaimProofRequest = await ReclaimProofRequest.fromJsonString(
        reclaimProofRequestConfig
      );
 
      await reclaimProofRequest.triggerReclaimFlow();
 
      await reclaimProofRequest.startSession({
        onSuccess: async (proofs) => {
          setProofs(proofs as unknown as Proof[]);
          //await uploadProofs(proofs);
          console.log(proofs as unknown as Proof[]);
          setIsLoading(false);
        },
        onError: (err: any) => {
          setError(err.message);
          setIsLoading(false);
        }
      });
    } catch (err:any) {
      setError(err.message);
      setIsLoading(false);
    }
  }, []);
 
  return { proofs, isLoading, error, startVerification };
}