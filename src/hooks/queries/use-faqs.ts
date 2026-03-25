"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { FAQ } from "@/types/faq";

export function useFaqs() {
  return useQuery({
    queryKey: ["faqs"],
    queryFn: () => api.get<FAQ[]>("/api/v1/admin/faqs"),
  });
}
