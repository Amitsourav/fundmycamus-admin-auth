"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { ContactSubmission } from "@/types/contact";

export function useContacts(status?: string) {
  return useQuery({
    queryKey: ["contacts", status],
    queryFn: () =>
      api.get<ContactSubmission[]>("/api/v1/contacts", { status }),
  });
}
