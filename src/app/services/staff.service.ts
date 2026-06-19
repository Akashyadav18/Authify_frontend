import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { KeysetPagedResponse } from '../core/models/staff.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StaffService {
  private baseUrl = environment.staffApi;

  constructor(private http: HttpClient) {}

  getAllStaffs(size: number, cursor?: number | null): Observable<KeysetPagedResponse> {
    let params = new HttpParams().set('size', size.toString());
    if (cursor != null) {
      params = params.set('cursor', cursor.toString());
    }
    return this.http.get<KeysetPagedResponse>(`${this.baseUrl}/getAllStaffs`, { params });
  }
}
