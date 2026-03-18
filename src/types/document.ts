export interface Document {
  id: string;
  user_id: string;
  document_type: string;
  file_name: string;
  file_url: string;
  file_size?: number;
  mime_type?: string;
  status: string;
  rejection_reason?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentReview {
  status: "verified" | "rejected";
  rejection_reason?: string;
}
