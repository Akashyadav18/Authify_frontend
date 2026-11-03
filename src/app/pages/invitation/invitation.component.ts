import { Component, signal, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InvitationService } from '../../core/services/invitation.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { Invitation, InviteRequest } from '../../core/models/invitation.model';

const INVITE_ROLES = ['TEACHER', 'STUDENT', 'STAFF'];

@Component({
  selector: 'app-invitation',
  standalone: true,
  imports: [NavbarComponent, FormsModule, ConfirmDialogComponent],
  templateUrl: './invitation.component.html',
  styleUrl: './invitation.component.css',
})
export class InvitationComponent implements OnInit {
  private invitationService = inject(InvitationService);
  private toast = inject(ToastService);

  readonly roles = INVITE_ROLES;

  // List state
  invitations = signal<Invitation[]>([]);
  loading = signal(true);
  loadError = signal('');

  // Modal state
  showModal = signal(false);

  // Form fields
  email = '';
  role = 'STUDENT';
  sending = signal(false);

  // Per-row action loading
  processingId = signal<number | null>(null);

  // Confirm dialog
  showConfirm = false;
  confirmTitle = '';
  confirmMessage = '';
  private pendingAction: (() => void) | null = null;

  ngOnInit() {
    this.loadInvitations();
  }

  loadInvitations() {
    this.loading.set(true);
    this.loadError.set('');
    this.invitationService.getInvitations().subscribe({
      next: (list) => {
        this.invitations.set(list);
        this.loading.set(false);
      },
      error: (err) => {
        // API may not support list yet — show empty state gracefully
        const msg = err?.error?.message ?? '';
        if (err.status === 404 || err.status === 405) {
          this.invitations.set([]);
          this.loading.set(false);
        } else {
          this.loadError.set(msg || 'Could not load invitations.');
          this.loading.set(false);
        }
      },
    });
  }

  openModal() {
    this.email = '';
    this.role = 'STUDENT';
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  onSend() {
    if (!this.email.trim()) {
      this.toast.error('Please enter an email address.');
      return;
    }
    if (!this.role) {
      this.toast.error('Please select a role.');
      return;
    }

    const req: InviteRequest = { email: this.email.trim(), role: this.role };
    this.sending.set(true);

    this.invitationService.sendInvitation(req).subscribe({
      next: (msg: string) => {
        this.toast.success(msg || `Invitation sent to ${this.email}.`);
        this.email = '';
        this.role = 'STUDENT';
        this.sending.set(false);
        this.closeModal();
        this.loadInvitations();
      },
      error: (err: { error?: { message?: string } }) => {
        this.toast.error(err?.error?.message ?? 'Failed to send invitation. Please try again.');
        this.sending.set(false);
      },
    });
  }

  onResend(inv: Invitation) {
    this.processingId.set(inv.id);
    this.invitationService.resend(inv.id).subscribe({
      next: (msg: string) => {
        this.toast.success(msg || `Invitation resent to ${inv.email}.`);
        this.processingId.set(null);
      },
      error: (err: { error?: { message?: string } }) => {
        this.toast.error(err?.error?.message ?? 'Failed to resend invitation.');
        this.processingId.set(null);
      },
    });
  }

  onRevoke(inv: Invitation) {
    this.confirmTitle = 'Revoke Invitation';
    this.confirmMessage = `Revoke invitation for ${inv.email}? They will no longer be able to use the setup link.`;
    this.showConfirm = true;
    this.pendingAction = () => this.doRevoke(inv);
  }

  confirmAction() {
    this.showConfirm = false;
    this.pendingAction?.();
    this.pendingAction = null;
  }

  cancelAction() {
    this.showConfirm = false;
    this.pendingAction = null;
  }

  private doRevoke(inv: Invitation) {
    this.processingId.set(inv.id);
    this.invitationService.revoke(inv.id).subscribe({
      next: (msg: string) => {
        this.toast.info(msg || `Invitation for ${inv.email} revoked.`);
        this.invitations.update((list) => list.filter((i) => i.id !== inv.id));
        this.processingId.set(null);
      },
      error: (err: { error?: { message?: string } }) => {
        this.toast.error(err?.error?.message ?? 'Failed to revoke invitation.');
        this.processingId.set(null);
      },
    });
  }

  statusBadgeClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'ACCEPTED':  return 'status-accepted';
      case 'REVOKED':   return 'status-revoked';
      case 'EXPIRED':   return 'status-expired';
      default:          return 'status-pending';
    }
  }

  roleBadgeClass(role: string): string {
    switch (role?.toUpperCase()) {
      case 'TEACHER': return 'role-teacher';
      case 'STAFF':   return 'role-staff';
      default:        return 'role-student';
    }
  }

  getInitial(email: string): string {
    return email ? email.charAt(0).toUpperCase() : '?';
  }
}
