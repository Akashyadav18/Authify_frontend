import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Invitation, InviteRequest, SetupAccountRequest } from '../models/invitation.model';

@Injectable({ providedIn: 'root' })
export class InvitationService {
  private http = inject(HttpClient);
  private readonly adminBase = environment.adminApiUrl;
  private readonly invitationBase = environment.invitationUrl;

  /** List pending invitations from /api/admin/invitations/pending */
  getPendingInvitations(): Observable<Invitation[]> {
    return this.http.get<Invitation[]>(`${this.adminBase}/invitations/pending`).pipe(
      catchError((err) => {
        // Fallback to /api/admin/invitations if /pending is 404
        if (err.status === 404) {
          return this.http.get<Invitation[]>(`${this.adminBase}/invitations`);
        }
        return throwError(() => err);
      }),
    );
  }

  /** Alias used by InvitationComponent on load */
  getInvitations(): Observable<Invitation[]> {
    return this.getPendingInvitations();
  }

  sendInvitation(req: InviteRequest): Observable<string> {
    return this.http.post(`${this.adminBase}/invitations/send`, req, { responseType: 'text' });
  }

  resend(id: number): Observable<string> {
    return this.http.post(`${this.adminBase}/invitations/${id}/resend`, {}, { responseType: 'text' });
  }

  revoke(id: number): Observable<string> {
    return this.http.delete(`${this.adminBase}/invitations/${id}/revoke`, { responseType: 'text' });
  }

  setupAccount(req: SetupAccountRequest): Observable<string> {
    return this.http
      .post(`${this.invitationBase}/setup-account`, req, { responseType: 'text' })
      .pipe(
        catchError((err) => {
          if (err.status === 404) {
            return this.http.post(`${environment.apiBaseUrl}/setup-account`, req, { responseType: 'text' });
          }
          return throwError(() => err);
        }),
      );
  }
}
