export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  message?: string;
  loan_type?: string;
  status: string;
  assigned_to?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ContactStatusUpdate {
  status: string;
  admin_notes?: string;
}
