/** Query params sent to GET /api/getAllStudents */
export interface StudentQueryParams {
  pageNo: number;       // 1-based
  pageSize: number;
  sortBy: string;       // id | username | rollNo | gender
  sortDir: string;      // asc | desc  (lowercase — backend expects this)
  search?: string;      // combined search: username, fullName, rollNo
}
