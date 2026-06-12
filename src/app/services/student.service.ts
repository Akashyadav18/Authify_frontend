import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StudentReq, StudentRes } from '../core/models/student.model';
import { PagedResponse } from '../core/models/pagination.model';
import { StudentQueryParams } from '../core/models/student-query.model';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private baseUrl = environment.studentApi;

  constructor(private http: HttpClient) {}

  getAllStudents(query: StudentQueryParams): Observable<PagedResponse<StudentRes>> {
    let params = new HttpParams()
      .set('pageNo', query.pageNo.toString())
      .set('pageSize', query.pageSize.toString())
      .set('sortBy', query.sortBy)
      .set('sortDir', query.sortDir);

    if (query.search?.trim()) {
      params = params.set('search', query.search.trim());
    }

    return this.http.get<PagedResponse<StudentRes>>(`${this.baseUrl}/getAllStudents`, { params });
  }

  getStudentById(stdId: string): Observable<StudentRes> {
    return this.http.get<StudentRes>(`${this.baseUrl}/getStudentByStdId/${stdId}`);
  }

  createStudent(payload: StudentReq): Observable<StudentRes> {
    return this.http.post<StudentRes>(`${this.baseUrl}/createStudent`, payload);
  }

  updateStudent(stdId: string, payload: StudentReq): Observable<StudentRes> {
    return this.http.put<StudentRes>(`${this.baseUrl}/updateStudent/${stdId}`, payload);
  }

  /** Backend returns plain String on delete — use responseType: 'text' */
  deleteStudent(stdId: string): Observable<string> {
    return this.http.delete(`${this.baseUrl}/deleteStudent/${stdId}`, {
      responseType: 'text',
    });
  }
}
