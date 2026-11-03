import { Component, signal, inject, OnInit } from '@angular/core';
import { ApprovalService } from '../../core/services/approval.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { PendingUser } from '../../core/models/approval.model';

@Component({
  selector: 'app-approval',
  standalone: true,
  imports: [NavbarComponent, ConfirmDialogComponent],
  templateUrl: './approval.component.html',
  styleUrl: './approval.component.css',
})
export class ApprovalComponent implements OnInit {
  private approvalService = inject(ApprovalService);
  private toast = inject(ToastService);

  pendingUsers = signal<PendingUser[]>([]);
  loading = signal(true);
  loadError = signal('');

  // Confirm dialog state
  showConfirm = false;
  confirmTitle = '';
  confirmMessage = '';
  private pendingAction: (() => void) | null = null;

  // Per-row loading (prevent double-click)
  processingId = signal<number | null>(null);

  ngOnInit() {
    this.loadPending();
  }

  loadPending() {
    this.loading.set(true);
    this.loadError.set('');
    this.approvalService.getPendingUsers().subscribe({
      next: (users) => {
        this.pendingUsers.set(users);
        this.loading.set(false);
      },
      error: (err) => {
        this.loadError.set(err?.error?.message ?? 'Could not load pending requests.');
        this.loading.set(false);
      },
    });
  }

  onApprove(user: PendingUser) {
    this.processingId.set(user.id);
    this.approvalService.approve(user.id).subscribe({
      next: () => {
        this.toast.success(`${user.name} has been approved.`);
        this.removeRow(user.id);
        this.processingId.set(null);
      },
      error: (err) => {
        this.toast.error(err?.error?.message ?? 'Approval failed. Please try again.');
        this.processingId.set(null);
      },
    });
  }

  onReject(user: PendingUser) {
    this.confirmTitle = 'Reject User';
    this.confirmMessage = `Reject ${user.name}'s registration request? They will be notified.`;
    this.showConfirm = true;
    this.pendingAction = () => this.doReject(user);
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

  private doReject(user: PendingUser) {
    this.processingId.set(user.id);
    this.approvalService.reject(user.id).subscribe({
      next: () => {
        this.toast.info(`${user.name}'s request has been rejected.`);
        this.removeRow(user.id);
        this.processingId.set(null);
      },
      error: (err) => {
        this.toast.error(err?.error?.message ?? 'Rejection failed. Please try again.');
        this.processingId.set(null);
      },
    });
  }

  private removeRow(id: number) {
    this.pendingUsers.update((list) => list.filter((u) => u.id !== id));
  }
}
