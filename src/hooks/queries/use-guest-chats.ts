"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { GuestChat, GuestConversation } from "@/types/guest-chat";

export function useGuestChats() {
  return useQuery({
    queryKey: ["guest-chats"],
    queryFn: () => api.get<GuestChat[]>("/api/v1/admin/guest-chats"),
  });
}

export function useGuestConversation(guestId: string) {
  return useQuery({
    queryKey: ["guest-chats", guestId],
    queryFn: () => api.get<GuestConversation>(`/api/v1/admin/guest-chats/${guestId}`),
    enabled: !!guestId,
  });
}
