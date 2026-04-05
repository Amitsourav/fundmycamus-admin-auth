export interface LandingLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  loan_status: string;
  consent: boolean;
  created_at: string;
}

export interface LandingLeadsResponse {
  success: boolean;
  data: LandingLead[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
