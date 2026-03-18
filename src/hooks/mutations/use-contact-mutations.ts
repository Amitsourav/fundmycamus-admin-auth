"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { ContactSubmission, ContactStatusUpdate } from "@/types/contact";

export function useUpdateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ submissionId, data }: { submissionId: string; data: ContactStatusUpdate }) =>
      api.patch<ContactSubmission>(`/api/v1/contacts/${submissionId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
}
