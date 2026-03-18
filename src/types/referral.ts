export interface Referral {
  id: string;
  referrer_id: string;
  referee_id?: string;
  referral_code: string;
  status: string;
  loan_application_id?: string;
  referral_number?: number;
  created_at: string;
  updated_at: string;
}

export interface ReferralPayout {
  id: string;
  referral_id: string;
  user_id: string;
  amount: number;
  milestone_bonus: number;
  payout_type: string;
  status: string;
  razorpay_payout_id?: string;
  failure_reason?: string;
  processed_at?: string;
  processed_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ProcessReferralRequest {
  action: string;
  referee_user_id: string;
  referral_code?: string;
  loan_application_id?: string;
}

export interface ProcessPayoutRequest {
  payout_id: string;
  bank_account_details?: {
    account_number: string;
    ifsc_code: string;
    account_holder_name: string;
  };
}
