"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { Document, DocumentReview } from "@/types/document";

export function useReviewDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ docId, data }: { docId: string; data: DocumentReview }) =>
      api.patch<Document>(`/api/v1/documents/${docId}/review`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}
