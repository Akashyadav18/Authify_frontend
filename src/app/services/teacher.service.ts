import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TeacherReq, TeacherRes } from '../core/models/teacher.model';
import { PagedResponse, TeacherQueryParams } from '../core/models/pagination.model';

@Injectable({
  providedIn: 'root',
})
export class TeacherService {
  private baseUrl = environment.teacherApi;

  constructor(private http: HttpClient) {}

  getAllTeachers(params: TeacherQueryParams): Observable<PagedResponse<TeacherRes>> {
    let httpParams = new HttpParams()
      .set('pageNo', params.pageNo.toString())
      .set('pageSize', params.pageSize.toString())
      .set('sortBy', params.sortBy)
      .set('sortDir', params.sortDir);

    if (params.id?.trim())            httpParams = httpParams.set('id', params.id.trim());
    if (params.name?.trim())          httpParams = httpParams.set('name', params.name.trim());
    if (params.qualification?.trim()) httpParams = httpParams.set('qualification', params.qualification.trim());
    if (params.startDate)             httpParams = httpParams.set('startDate', params.startDate);
    if (params.endDate)               httpParams = httpParams.set('endDate', params.endDate);

    return this.http.get<PagedResponse<TeacherRes>>(`${this.baseUrl}/getAllTeachers`, { params: httpParams });
  }

  getTeacherById(id: number): Observable<TeacherRes> {
    return this.http.get<TeacherRes>(`${this.baseUrl}/getTeacherById/${id}`);
  }

  createTeacher(payload: TeacherReq): Observable<TeacherRes> {
    return this.http.post<TeacherRes>(`${this.baseUrl}/createTeacher`, payload);
  }

  updateTeacher(id: number, payload: TeacherReq): Observable<TeacherRes> {
    return this.http.put<TeacherRes>(`${this.baseUrl}/updateTeacher/${id}`, payload);
  }

  /** Backend returns plain String on delete — use responseType: 'text' */
  deleteTeacher(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/deleteTeacher/${id}`, {
      responseType: 'text',
    });
  }
}
