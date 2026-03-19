export const LoanStatus = {
  APPLIED: "applied",
  DOCS_RECEIVED: "docs_received",
  UNDER_REVIEW: "under_review",
  LOAN_LOGIN: "loan_login",
  SANCTION: "sanction",
  PROCESSING_FEE: "processing_fee",
  DISBURSED: "disbursed",
  REJECTED: "rejected",
  WITHDRAWN: "withdrawn",
} as const;

export const VALID_LOAN_TRANSITIONS: Record<string, string[]> = {
  [LoanStatus.APPLIED]: [LoanStatus.DOCS_RECEIVED, LoanStatus.REJECTED, LoanStatus.WITHDRAWN],
  [LoanStatus.DOCS_RECEIVED]: [LoanStatus.UNDER_REVIEW, LoanStatus.REJECTED, LoanStatus.WITHDRAWN],
  [LoanStatus.UNDER_REVIEW]: [LoanStatus.LOAN_LOGIN, LoanStatus.REJECTED, LoanStatus.WITHDRAWN],
  [LoanStatus.LOAN_LOGIN]: [LoanStatus.SANCTION, LoanStatus.REJECTED, LoanStatus.WITHDRAWN],
  [LoanStatus.SANCTION]: [LoanStatus.PROCESSING_FEE, LoanStatus.REJECTED, LoanStatus.WITHDRAWN],
  [LoanStatus.PROCESSING_FEE]: [LoanStatus.DISBURSED, LoanStatus.REJECTED, LoanStatus.WITHDRAWN],
  [LoanStatus.DISBURSED]: [],
  [LoanStatus.REJECTED]: [],
  [LoanStatus.WITHDRAWN]: [],
};

export const DocumentStatus = {
  PENDING_REVIEW: "pending_review",
  UNDER_REVIEW: "under_review",
  VERIFIED: "verified",
  REJECTED: "rejected",
  EXPIRED: "expired",
} as const;

export const DocumentType = {
  PASSPORT: "passport",
  PAN_CARD: "pan_card",
  AADHAR: "aadhar",
  OFFER_LETTER: "offer_letter",
  TRANSCRIPT: "transcript",
  SOP: "sop",
  LOR: "lor",
  RESUME: "resume",
  BANK_STATEMENT: "bank_statement",
  ITR: "itr",
  SALARY_SLIP: "salary_slip",
  PROPERTY_DOCS: "property_docs",
  CO_APPLICANT_DOCS: "co_applicant_docs",
  PHOTO: "photo",
  OTHER: "other",
} as const;

export const UserRole = {
  USER: "user",
  COUNSELOR: "counselor",
  ADMIN: "admin",
} as const;

export const ContactStatus = {
  NEW: "new",
  CONTACTED: "contacted",
  RESOLVED: "resolved",
  SPAM: "spam",
} as const;

export const ReferralStatus = {
  SIGNED_UP: "signed_up",
  APPLIED: "applied",
  SANCTIONED: "sanctioned",
  DISBURSED: "disbursed",
  PAID: "paid",
  EXPIRED: "expired",
} as const;

export const PayoutStatus = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
  REVERSED: "reversed",
} as const;

export const NotificationType = {
  WELCOME: "welcome",
  APPLICATION_UPDATE: "application_update",
  DOCUMENT_UPDATE: "document_update",
  COUNSELOR_ASSIGNED: "counselor_assigned",
  BANK_OFFERS: "bank_offers",
  REFERRAL_UPDATE: "referral_update",
  PAYOUT_UPDATE: "payout_update",
  GENERAL: "general",
} as const;

export const BankOfferStatus = {
  PENDING: "pending",
  PRESENTED: "presented",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
} as const;

export const LOAN_STATUS_OPTIONS = Object.values(LoanStatus);
export const DOCUMENT_STATUS_OPTIONS = Object.values(DocumentStatus);
export const CONTACT_STATUS_OPTIONS = Object.values(ContactStatus);
export const PAYOUT_STATUS_OPTIONS = Object.values(PayoutStatus);
export const NOTIFICATION_TYPE_OPTIONS = Object.values(NotificationType);
export const USER_ROLE_OPTIONS = Object.values(UserRole);
