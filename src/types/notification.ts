export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface SendNotificationRequest {
  user_id: string;
  type: string;
  title: string;
  message: string;
  email?: boolean;
  link?: string;
  metadata?: Record<string, unknown>;
}
