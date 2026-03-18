"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { Counselor } from "@/types/counselor";

export function useCounselors() {
  return useQuery({
    queryKey: ["counselors"],
    queryFn: () => api.get<Counselor[]>("/api/v1/counselors"),
  });
}

export function useCounselor(counselorId: string) {
  return useQuery({
    queryKey: ["counselors", counselorId],
    queryFn: () => api.get<Counselor>(`/api/v1/counselors/${counselorId}`),
    enabled: !!counselorId,
  });
}
