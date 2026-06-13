// ── Paginated response wrapper (matches backend shape) ──────────────
export interface PagedResponse<T> {
  currentPage: number;
  data: T[];
  firstPage: boolean;
  lastPage: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

// ── Student list query params ───────────────────────────────────────
export interface StudentQueryParams {
  pageNo: number;
  pageSize: number;
  sortBy: string;
  sortDir: string;
  search?: string;
}

// ── Teacher list query params ───────────────────────────────────────
export interface TeacherQueryParams {
  pageNo: number;
  pageSize: number;
  sortBy: string;
  sortDir: string;
  id?: string;
  name?: string;
  qualification?: string;
  startDate?: string;   // yyyy-MM-dd
  endDate?: string;     // yyyy-MM-dd
}
