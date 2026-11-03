import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PendingUser } from '../models/approval.model';

@Injectable({ providedIn: 'root' })
export class ApprovalService {
  private http = inject(HttpClient);
  private readonly base = environment.adminApiUrl;

  getPendingUsers(): Observable<PendingUser[]> {
    return this.http.get<PendingUser[]>(`${this.base}/approval/pending-users`);
  }

  approve(id: number): Observable<string> {
    return this.http.put(`${this.base}/approval/approve/${id}`, {}, { responseType: 'text' });
  }

  reject(id: number): Observable<string> {
    return this.http.put(`${this.base}/approval/reject/${id}`, {}, { responseType: 'text' });
  }
}

