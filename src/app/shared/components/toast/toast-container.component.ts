import { Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  template: `
    <div class="toast-container" aria-live="polite">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast toast-{{ toast.type }}" (click)="toastService.dismiss(toast.id)">
          <span class="toast-icon">
            @if (toast.type === 'success') { ✓ }
            @else if (toast.type === 'error') { ✕ }
            @else { ℹ }
          </span>
          <span class="toast-msg">{{ toast.message }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 1.25rem;
      right: 1.25rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      pointer-events: none;
    }
    .toast {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      border: 1px solid;
      pointer-events: all;
      cursor: pointer;
      animation: toastIn 0.22s ease forwards;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      min-width: 260px;
      max-width: 360px;
      background: #ffffff;
    }
    .toast-success {
      border-color: #bbf7d0;
      color: #15803d;
      border-left: 4px solid #16a34a;
    }
    .toast-error {
      border-color: #fecaca;
      color: #dc2626;
      border-left: 4px solid #dc2626;
    }
    .toast-info {
      border-color: #bfdbfe;
      color: #1d4ed8;
      border-left: 4px solid #2563eb;
    }
    .toast-icon {
      font-size: 0.9375rem;
      font-weight: 700;
      flex-shrink: 0;
    }
    .toast-msg { line-height: 1.4; color: #111827; }
    @keyframes toastIn {
      from { opacity: 0; transform: translateX(20px); }
      to   { opacity: 1; transform: translateX(0); }
    }
  `],
})
export class ToastContainerComponent {
  toastService = inject(ToastService);
}
