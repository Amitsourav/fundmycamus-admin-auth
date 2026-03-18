export interface Counselor {
  id: string;
  user_id?: string;
  name: string;
  title?: string;
  email: string;
  phone?: string;
  whatsapp_number?: string;
  avatar_url?: string;
  available_hours?: string;
  max_active_cases: number;
  current_active_cases: number;
  specializations?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CounselorCreate {
  name: string;
  title?: string;
  email: string;
  phone?: string;
  whatsapp_number?: string;
  available_hours?: string;
  max_active_cases?: number;
  specializations?: string[];
  user_id?: string;
}

export interface CounselorUpdate {
  name?: string;
  title?: string;
  email?: string;
  phone?: string;
  whatsapp_number?: string;
  available_hours?: string;
  max_active_cases?: number;
  specializations?: string[];
  is_active?: boolean;
}

export interface AssignCounselorRequest {
  loan_application_id: string;
  counselor_id?: string;
}
