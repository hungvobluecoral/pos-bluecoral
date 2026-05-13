// ─── Submit Registration (public) ────────────────────────────────────────────

export interface SubmitRegistrationRequest {
  /** Owner's full name */
  name: string;
  /** Owner's email — used for login and invite */
  email: string;
  /** Business / store name */
  businessName: string;
}

export interface SubmitRegistrationResponse {
  registrationId: string;
  status: 'PENDING';
  message: string;
}

// ─── List Registrations (SA) ─────────────────────────────────────────────────

export type RegistrationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface RegistrationSummary {
  id: string;
  name: string;
  email: string;
  businessName: string;
  status: RegistrationStatus;
  reviewNote: string | null;
  createdAt: string;
}

export interface ListRegistrationsResponse {
  items: RegistrationSummary[];
  total: number;
}

// ─── Approve Registration (SA) ───────────────────────────────────────────────

export interface ApproveRegistrationResponse {
  registrationId: string;
  tenantId: string;
  userId: string;
  /** Raw invite token — send by email to the owner so they can set their password */
  rawInviteToken: string;
  inviteTokenExpiresAt: string;
}

// ─── Reject Registration (SA) ────────────────────────────────────────────────

export interface RejectRegistrationRequest {
  reviewNote: string;
}

export interface RejectRegistrationResponse {
  registrationId: string;
  status: 'REJECTED';
}
