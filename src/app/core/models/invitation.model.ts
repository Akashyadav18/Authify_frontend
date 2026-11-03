export interface InviteRequest {
  email: string;
  role: string;
}

export interface SetupAccountRequest {
  token: string;
  name: string;
  password: string;
}

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'REVOKED' | 'EXPIRED';

export interface Invitation {
  id: number;
  email: string;
  role: string;
  status: InvitationStatus;
  createdAt?: string;
  expiresAt?: string;
}

