"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { Profile } from "@/types/user";
import type { PaginatedResponse } from "@/types/common";

interface UseUsersParams {
  page?: number;
  page_size?: number;
  role?: string;
  search?: string;
}

export function useUsers(params: UseUsersParams = {}) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () =>
      api.get<PaginatedResponse<Profile>>("/api/v1/users", {
        page: params.page || 1,
        page_size: params.page_size || 25,
        role: params.role,
        search: params.search,
      }),
  });
}

export function useUser(userId: string) {
  return useQuery({
    queryKey: ["users", userId],
    queryFn: () => api.get<Profile>(`/api/v1/users/${userId}`),
    enabled: !!userId,
  });
}
