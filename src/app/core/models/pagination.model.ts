/** Generic paginated response returned by getAllStudents / getAllTeachers */
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
