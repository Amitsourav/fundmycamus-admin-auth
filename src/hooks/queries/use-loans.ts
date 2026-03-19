"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { LoanApplication } from "@/types/loan";
import type { BankOffer, LoanBank } from "@/types/bank";
import type { Document } from "@/types/document";

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

export function useLoanBanks(loanId: string) {
  return useQuery({
    queryKey: ["loan-banks", loanId],
    queryFn: () => api.get<LoanBank[]>(`/api/v1/loans/${loanId}/banks`),
    enabled: !!loanId,
  });
}

export interface RequiredDocument {
  document_type: string;
  required: boolean;
  uploaded: boolean;
  status?: string;
  file_name?: string;
  document_id?: string;
  mime_type?: string;
}

export function useLoanDocuments(loanId: string) {
  return useQuery({
    queryKey: ["loan-documents", loanId],
    queryFn: () => api.get<RequiredDocument[]>("/api/v1/documents/required", { loan_application_id: loanId }),
    enabled: !!loanId,
  });
}
