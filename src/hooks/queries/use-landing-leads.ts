"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { LandingLeadsResponse } from "@/types/landing-lead";

interface UseLandingLeadsParams {
  page?: number;
  limit?: number;
}

export function useLandingLeads(params: UseLandingLeadsParams = {}) {
  return useQuery({
    queryKey: ["landing-leads", params],
    queryFn: () =>
      api.get<LandingLeadsResponse>("/api/v1/admin/landing-leads", {
        page: params.page || 1,
        limit: params.limit || 20,
      }),
  });
}
