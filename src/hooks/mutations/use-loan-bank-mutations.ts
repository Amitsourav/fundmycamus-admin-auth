"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export function useAddLoanBank() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ loanId, bank_name, remarks }: { loanId: string; bank_name: string; remarks?: string }) =>
      api.post(`/api/v1/loans/${loanId}/banks`, { bank_name, remarks }),
    onSuccess: (_, { loanId }) => {
      queryClient.invalidateQueries({ queryKey: ["loan-banks", loanId] });
      queryClient.invalidateQueries({ queryKey: ["loans", loanId] });
    },
  });
}

export function useUpdateLoanBankStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ loanId, bankAppId, status, remarks }: { loanId: string; bankAppId: string; status?: string; remarks?: string }) =>
      api.patch(`/api/v1/loans/${loanId}/banks/${bankAppId}`, { status, remarks }),
    onSuccess: (_, { loanId }) => {
      queryClient.invalidateQueries({ queryKey: ["loan-banks", loanId] });
      queryClient.invalidateQueries({ queryKey: ["loans", loanId] });
    },
  });
}
