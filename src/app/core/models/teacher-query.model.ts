/** Query params sent to GET /api/getAllTeachers */
export interface TeacherQueryParams {
  pageNo: number;         // 1-based
  pageSize: number;
  sortBy: string;         // id | name | qualification
  sortDir: string;        // ASC | DESC  (uppercase — backend expects this)
  id?: number;            // filter by teacher numeric id (Long)
  name?: string;          // filter by name (partial)
  qualification?: string; // filter by qualification (partial)
  startDate?: string;     // created-from, format yyyy-MM-dd
  endDate?: string;       // created-to,   format yyyy-MM-dd
}
