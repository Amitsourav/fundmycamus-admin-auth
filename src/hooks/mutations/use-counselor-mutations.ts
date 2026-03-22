"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { Counselor, CounselorCreate, CounselorUpdate, AssignCounselorRequest } from "@/types/counselor";

export function useCreateCounselor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CounselorCreate) =>
      api.post<Counselor & { temp_password?: string }>("/api/v1/counselors", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["counselors"] });
    },
  });
}

export function useUpdateCounselor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ counselorId, data }: { counselorId: string; data: CounselorUpdate }) =>
      api.patch<Counselor>(`/api/v1/counselors/${counselorId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["counselors"] });
    },
  });
}

export function useAssignCounselor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AssignCounselorRequest) =>
      api.post("/api/v1/counselors/assign", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      queryClient.invalidateQueries({ queryKey: ["counselors"] });
    },
  });
}
