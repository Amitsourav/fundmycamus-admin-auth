export interface LoanApplication {
  id: string;
  application_id: string;
  user_id: string;
  status: string;
  full_name: string;
  gender: string;
  email: string;
  phone: string;
  is_whatsapp: boolean;
  has_offer_letter: boolean;
  university_app_status?: string;
  course_start_year: number;
  course_start_month: string;
  course_level: string;
  course_degree: string;
  course_name: string;
  target_country: string;
  target_college: string;
  loan_amount: number;
  has_collateral: boolean;
  co_applicant_income: number;
  existing_emis: number;
  bank_name: string | null;
  hear_about_us?: string;
  assigned_counselor_id?: string;
  submitted_at?: string;
  last_status_change_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface LoanStatusUpdate {
  status: string;
  notes?: string;
}
