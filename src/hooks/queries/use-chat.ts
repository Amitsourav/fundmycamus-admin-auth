"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { Conversation, ChatMessage } from "@/types/chat";

export function useConversations() {
  return useQuery({
    queryKey: ["chat", "conversations"],
    queryFn: () => api.get<Conversation[]>("/api/v1/chat/conversations"),
    refetchInterval: 5000,
  });
}

export function useMessages(userId: string, since?: string) {
  return useQuery({
    queryKey: ["chat", "messages", userId, since],
    queryFn: () =>
      api.get<ChatMessage[]>("/api/v1/chat/messages", {
        user_id: userId,
        ...(since ? { since } : {}),
      }),
    enabled: !!userId,
    refetchInterval: 3000,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ["chat", "unread"],
    queryFn: () => api.get<{ count: number }>("/api/v1/chat/unread"),
    refetchInterval: 10000,
  });
}
