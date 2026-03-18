"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { Document } from "@/types/document";

export function useDocumentsForReview(status?: string) {
  return useQuery({
    queryKey: ["documents", "review", status],
    queryFn: () =>
      api.get<Document[]>("/api/v1/documents/review", { status }),
  });
}

export function useUserDocuments(userId: string) {
  return useQuery({
    queryKey: ["documents", "user", userId],
    queryFn: () =>
      api.get<Document[]>("/api/v1/documents/review", { user_id: userId }),
    enabled: !!userId,
  });
}
