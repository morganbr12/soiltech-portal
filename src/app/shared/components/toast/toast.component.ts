import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (t of svc.toasts(); track t.id) {
        <div class="toast" [class]="'toast--' + t.type">
          <span class="material-symbols-rounded toast-icon">{{ icon(t.type) }}</span>
          <span class="toast-msg">{{ t.message }}</span>
          <button class="toast-close" (click)="svc.dismiss(t.id)">
            <span class="material-symbols-rounded">close</span>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 24px; right: 24px;
      z-index: 9999;
      display: flex; flex-direction: column; gap: 8px;
      pointer-events: none;
    }

    .toast {
      display: flex; align-items: center; gap: 10px;
      padding: 12px 14px;
      border-radius: 10px;
      min-width: 280px; max-width: 400px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      font-size: 0.875rem; font-weight: 500;
      pointer-events: all;
      animation: slide-in 0.2s ease;
    }

    @keyframes slide-in {
      from { opacity: 0; transform: translateX(20px); }
      to   { opacity: 1; transform: translateX(0); }
    }

    .toast--success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; }
    .toast--error   { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; }
    .toast--warning { background: #fffbeb; border: 1px solid #fde68a; color: #92400e; }
    .toast--info    { background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; }

    .toast-icon { font-size: 18px; flex-shrink: 0; font-variation-settings: 'FILL' 1; }
    .toast-msg  { flex: 1; line-height: 1.4; }

    .toast-close {
      width: 24px; height: 24px; border-radius: 6px; border: none;
      background: transparent; cursor: pointer; padding: 0;
      display: flex; align-items: center; justify-content: center;
      opacity: 0.6; flex-shrink: 0; color: inherit;
      &:hover { opacity: 1; background: rgba(0,0,0,0.08); }
      span { font-size: 16px; }
    }
  `],
})
export class ToastComponent {
  readonly svc = inject(ToastService);

  icon(type: string): string {
    const map: Record<string, string> = {
      success: 'check_circle',
      error:   'error',
      warning: 'warning',
      info:    'info',
    };
    return map[type] ?? 'notifications';
  }
}
