"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { LoanApplication } from "@/types/loan";
import type { BankOffer } from "@/types/bank";

interface UseLoansParams {
  status?: string;
  counselor_id?: string;
}

export function useLoans(params: UseLoansParams = {}) {
  return useQuery({
    queryKey: ["loans", params],
    queryFn: () =>
      api.get<LoanApplication[]>("/api/v1/loans", {
        status: params.status,
        counselor_id: params.counselor_id,
      }),
  });
}

export function useLoan(loanId: string) {
  return useQuery({
    queryKey: ["loans", loanId],
    queryFn: () => api.get<LoanApplication>(`/api/v1/loans/${loanId}`),
    enabled: !!loanId,
  });
}

export function useBankOffers(loanId: string) {
  return useQuery({
    queryKey: ["bank-offers", loanId],
    queryFn: () => api.get<BankOffer[]>(`/api/v1/banks/offers/${loanId}`),
    enabled: !!loanId,
  });
}
