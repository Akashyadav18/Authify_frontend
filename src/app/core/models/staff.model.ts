export interface StaffResponse {
  id: number;
  name: string;
  section: string;
  role: string;
  UpdatedBy: string;       // ⚠️ capital U — matches backend field name exactly
  createdAt: string;
  createdBy: string;
  updatedAt: string;
}

export interface KeysetPagedResponse {
  data: StaffResponse[];
  pageSize: number;
  nextCursor: number | null;
  hasNext: boolean;
}
