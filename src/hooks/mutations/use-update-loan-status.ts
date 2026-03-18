"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { LoanApplication, LoanStatusUpdate } from "@/types/loan";

export function useUpdateLoanStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ loanId, data }: { loanId: string; data: LoanStatusUpdate }) =>
      api.patch<LoanApplication>(`/api/v1/loans/${loanId}/status`, data),
    onSuccess: (_, { loanId }) => {
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      queryClient.invalidateQueries({ queryKey: ["loans", loanId] });
    },
  });
}
