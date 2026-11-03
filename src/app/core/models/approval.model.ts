export type AccountStatus = 'APPROVED' | 'REJECTED' | 'PENDING';

export interface PendingUser {
  id: number;
  name: string;
  email: string;
  status: AccountStatus;
}

