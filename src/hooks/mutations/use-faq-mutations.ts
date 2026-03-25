"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { FAQCreate, FAQUpdate } from "@/types/faq";

export function useCreateFaq() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FAQCreate) =>
      api.post("/api/v1/admin/faqs", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
    },
  });
}

export function useUpdateFaq() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: FAQUpdate & { id: string }) =>
      api.patch(`/api/v1/admin/faqs/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
    },
  });
}

export function useDeleteFaq() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete(`/api/v1/admin/faqs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
    },
  });
}
