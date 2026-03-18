"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export function useMatchBankOffers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (loanApplicationId: string) =>
      api.post("/api/v1/banks/match-offers", { loan_application_id: loanApplicationId }),
    onSuccess: (_, loanApplicationId) => {
      queryClient.invalidateQueries({ queryKey: ["bank-offers", loanApplicationId] });
    },
  });
}
