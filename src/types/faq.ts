export interface QuickReply {
  label: string;
  action: "message" | "link" | "handoff";
  url?: string;
}

export interface FAQ {
  id: string;
  category: string;
  keywords: string[];
  response: string;
  quick_replies: string; // JSON string of QuickReply[]
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface FAQCreate {
  category: string;
  keywords: string[];
  response: string;
  quick_replies: string;
  is_active: boolean;
  priority: number;
}

export interface FAQUpdate extends Partial<FAQCreate> {}
