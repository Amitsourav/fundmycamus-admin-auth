export interface Bank {
  id: string;
  name: string;
  logo_url?: string;
  min_loan_amount: number;
  max_loan_amount: number;
  interest_rate_min: number;
  interest_rate_max: number;
  processing_fee_text?: string;
  processing_fee_min_pct: number;
  processing_fee_max_pct: number;
  max_tenure_years: number;
  collateral_required: boolean;
  collateral_free_limit: number;
  supported_countries?: string[];
  supported_course_levels?: string[];
  min_co_applicant_income?: number;
  approval_time_text?: string;
  approval_time_days?: number;
  features?: string[];
  is_active: boolean;
  display_order: number;
}

export interface LoanBank {
  id: string;
  loan_application_id: string;
  bank_name: string;
  status: string;
  remarks?: string;
  created_at: string;
  updated_at: string;
}

export interface BankOffer {
  id: string;
  loan_application_id: string;
  bank_id: string;
  interest_rate: number;
  loan_amount: number;
  tenure_years: number;
  monthly_emi: number;
  processing_fee: number;
  total_interest: number;
  total_cost: number;
  is_best_offer: boolean;
  status: string;
  matched_by?: string;
  created_at: string;
  updated_at: string;
}
