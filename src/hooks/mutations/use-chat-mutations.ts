"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ user_id, message }: { user_id: string; message: string }) =>
      api.post("/api/v1/chat/send", { user_id, message }),
    onSuccess: (_, { user_id }) => {
      queryClient.invalidateQueries({ queryKey: ["chat", "messages", user_id] });
      queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] });
    },
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ user_id }: { user_id: string }) =>
      api.patch("/api/v1/chat/messages/read", { user_id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] });
      queryClient.invalidateQueries({ queryKey: ["chat", "unread"] });
    },
  });
}
