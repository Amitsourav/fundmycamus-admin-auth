export interface Conversation {
  user_id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  last_message_at: string;
  unread_count: number;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  sender_id: string;
  sender_role: "user" | "counselor" | "admin";
  message: string;
  is_read: boolean;
  created_at: string;
}
