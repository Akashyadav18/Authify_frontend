import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TeacherReq, TeacherRes } from '../core/models/teacher.model';
import { PagedResponse } from '../core/models/pagination.model';
import { TeacherQueryParams } from '../core/models/teacher-query.model';

@Injectable({
  providedIn: 'root',
})
export class TeacherService {
  private baseUrl = environment.teacherApi;

  constructor(private http: HttpClient) {}

  getAllTeachers(query: TeacherQueryParams): Observable<PagedResponse<TeacherRes>> {
    let params = new HttpParams()
      .set('pageNo', query.pageNo.toString())
      .set('pageSize', query.pageSize.toString())
      .set('sortBy', query.sortBy)
      .set('sortDir', query.sortDir);

    if (query.id)                        params = params.set('id', query.id.toString());
    if (query.name?.trim())              params = params.set('name', query.name.trim());
    if (query.qualification?.trim())     params = params.set('qualification', query.qualification.trim());
    if (query.startDate)                 params = params.set('startDate', query.startDate);
    if (query.endDate)                   params = params.set('endDate', query.endDate);

    return this.http.get<PagedResponse<TeacherRes>>(`${this.baseUrl}/getAllTeachers`, { params });
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
