"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { ProcessReferralRequest, ProcessPayoutRequest } from "@/types/referral";

export function useProcessReferral() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProcessReferralRequest) =>
      api.post("/api/v1/referrals/process", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["referrals"] });
    },
  });
}

export function useProcessPayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProcessPayoutRequest) =>
      api.post("/api/v1/referrals/payouts/process", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payouts"] });
    },
  });
}
