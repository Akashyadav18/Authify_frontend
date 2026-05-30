import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TeacherReq, TeacherRes } from '../core/models/teacher.model';

@Injectable({
  providedIn: 'root',
})
export class TeacherService {
  private baseUrl = environment.teacherApi;

  constructor(private http: HttpClient) {}

  getAllTeachers(): Observable<TeacherRes[]> {
    return this.http.get<TeacherRes[]>(`${this.baseUrl}/getAllTeachers`);
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
