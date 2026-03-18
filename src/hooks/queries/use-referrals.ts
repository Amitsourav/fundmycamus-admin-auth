"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { Referral, ReferralPayout } from "@/types/referral";

export function useReferrals() {
  return useQuery({
    queryKey: ["referrals"],
    queryFn: () => api.get<Referral[]>("/api/v1/referrals"),
  });
}

export function usePayouts(status?: string) {
  return useQuery({
    queryKey: ["payouts", status],
    queryFn: () =>
      api.get<ReferralPayout[]>("/api/v1/referrals/payouts", { status }),
  });
}
