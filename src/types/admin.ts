export interface AdminDashboardStats {
  total_users: number;
  new_users_this_month: number;
  total_applications: number;
  applications_by_status: Record<string, number>;
  applications_this_month: number;
  total_disbursed: number;
  disbursed_amount_total: number;
  conversion_rate: number;
  average_loan_amount: number;
  top_countries: Array<{ country: string; count: number }>;
  top_banks: Array<{ bank: string; count: number }>;
  pending_documents: number;
  active_referrals: number;
  pending_payouts: number;
  contact_submissions_new: number;
  counselor_caseloads: Array<{ counselor_id: string; caseload: number }>;
}
