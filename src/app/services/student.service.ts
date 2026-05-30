import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StudentReq, StudentRes } from '../core/models/student.model';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private baseUrl = environment.studentApi;

  constructor(private http: HttpClient) {}

  getAllStudents(): Observable<StudentRes[]> {
    return this.http.get<StudentRes[]>(`${this.baseUrl}/getAllStudents`);
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

