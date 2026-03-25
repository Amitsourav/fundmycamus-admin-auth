export interface GuestChat {
  id: string;
  name: string;
  phone: string;
  source_page: string;
  message_count: number;
  last_message_at: string;
  created_at: string;
}

export interface GuestMessage {
  id: string;
  sender: "user" | "bot";
  message: string;
  matched_faq: string | null;
  created_at: string;
}

export interface GuestConversation {
  guest: {
    id: string;
    name: string;
    phone: string;
    created_at: string;
  };
  messages: GuestMessage[];
}
