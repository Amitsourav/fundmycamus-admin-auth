"use client";

import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { SendNotificationRequest } from "@/types/notification";

export function useSendNotification() {
  return useMutation({
    mutationFn: (data: SendNotificationRequest) =>
      api.post("/api/v1/notifications/send", data),
  });
}
