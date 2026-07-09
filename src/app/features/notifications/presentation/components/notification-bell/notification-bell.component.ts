import {
  Component, inject, signal, OnInit, DestroyRef, HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { AppStore } from '../../../../../core/state/app.store';
import { NotificationService } from '../../../services/notification.service';
import { AdminNotification } from '../../../domain/notification.model';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="notif-bell" [class.open]="open()">

      <!-- Bell button -->
      <button class="bell-btn" (click)="toggleOpen()" title="Notifications">
        <span class="material-symbols-rounded">notifications</span>
        @if (appStore.notifications() > 0) {
          <span class="badge">{{ appStore.notifications() > 99 ? '99+' : appStore.notifications() }}</span>
        }
      </button>

      <!-- Dropdown -->
      @if (open()) {
        <div class="dropdown animate-scale-in">

          <!-- Dropdown header -->
          <div class="dropdown-header">
            <span class="dropdown-title">Notifications</span>
            @if (appStore.notifications() > 0) {
              <button class="mark-all-btn" (click)="markAllRead()" [disabled]="markingAll()">
                @if (markingAll()) { <span class="material-symbols-rounded spinning">progress_activity</span> }
                Mark all read
              </button>
            }
          </div>

          <!-- List -->
          <div class="notif-list">
            @if (isLoading()) {
              <div class="empty-state">
                <span class="material-symbols-rounded spinning load-spinner">progress_activity</span>
                <span>Loading…</span>
              </div>
            } @else if (notifications().length === 0) {
              <div class="empty-state">
                <span class="material-symbols-rounded empty-icon">notifications_none</span>
                <span>All caught up!</span>
                <small>No new notifications</small>
              </div>
            } @else {
              @for (n of notifications(); track n.id) {
                <div class="notif-item" [class.unread]="!n.isRead" (click)="onItemClick(n)">
                  <div class="notif-icon" [style.background]="typeBg(n.type)">
                    <span class="material-symbols-rounded" [style.color]="typeColor(n.type)">
                      {{ typeIcon(n.type) }}
                    </span>
                  </div>
                  <div class="notif-content">
                    <div class="notif-title">{{ n.title }}</div>
                    <div class="notif-message">{{ n.message }}</div>
                    <div class="notif-time">{{ timeAgo(n.createdAt) }}</div>
                  </div>
                  @if (!n.isRead) {
                    <div class="unread-dot"></div>
                  }
                </div>
              }
            }
          </div>

          <!-- Footer -->
          <div class="dropdown-footer">
            <a routerLink="/notifications" class="view-all-link" (click)="open.set(false)">
              <span class="material-symbols-rounded">open_in_new</span>
              View all notifications
            </a>
          </div>

        </div>
      }
    </div>
  `,
  styles: [`
    .notif-bell { position: relative; }

    .bell-btn {
      width: 36px; height: 36px;
      border-radius: 8px; border: none;
      background: transparent;
      color: var(--color-text-secondary);
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all var(--transition-fast);
      flex-shrink: 0;
      position: relative;

      span.material-symbols-rounded { font-size: 20px; }

      &:hover { background: var(--color-surface-2); color: var(--color-text-primary); }
      .open & { background: var(--color-surface-2); color: var(--color-primary); }
    }

    .badge {
      position: absolute;
      top: 4px; right: 4px;
      min-width: 16px; height: 16px;
      background: var(--color-error);
      border-radius: 99px;
      font-size: 0.5625rem;
      font-weight: 700;
      color: white;
      display: flex; align-items: center; justify-content: center;
      border: 2px solid var(--color-surface);
      padding: 0 3px;
      line-height: 1;
    }

    .dropdown {
      position: absolute;
      right: 0; top: calc(100% + 8px);
      width: 360px;
      background: var(--color-surface);
      border: 1px solid var(--color-border-light);
      border-radius: 14px;
      box-shadow: var(--shadow-xl);
      z-index: 200;
      overflow: hidden;
      display: flex; flex-direction: column;
      max-height: 520px;
    }

    .dropdown-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 16px;
      border-bottom: 1px solid var(--color-border-light);
      flex-shrink: 0;
    }
    .dropdown-title {
      font-size: 0.9375rem; font-weight: 700;
      color: var(--color-text-primary);
    }
    .mark-all-btn {
      font-size: 0.75rem; font-weight: 600;
      color: var(--color-primary);
      border: none; background: transparent; cursor: pointer;
      display: flex; align-items: center; gap: 4px;
      padding: 4px 8px; border-radius: 6px;
      font-family: inherit;
      &:hover:not(:disabled) { background: rgba(26,122,74,0.08); }
      &:disabled { opacity: 0.5; cursor: not-allowed; }
      span { font-size: 14px; }
    }

    .notif-list {
      flex: 1; overflow-y: auto;
      min-height: 80px;
    }

    .empty-state {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 6px; padding: 32px 16px;
      color: var(--color-text-muted);
      font-size: 0.875rem;

      .empty-icon { font-size: 36px; color: var(--color-border); font-variation-settings: 'FILL' 1; }
      small { font-size: 0.75rem; }
    }

    .notif-item {
      display: flex; align-items: flex-start; gap: 12px;
      padding: 12px 16px;
      cursor: pointer;
      transition: background var(--transition-fast);
      border-bottom: 1px solid var(--color-border-light);
      position: relative;

      &:last-child { border-bottom: none; }
      &:hover { background: var(--color-surface-2); }
      &.unread { background: rgba(26,122,74,0.03); }
    }

    .notif-icon {
      width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      span { font-size: 18px; font-variation-settings: 'FILL' 1; }
    }

    .notif-content { flex: 1; min-width: 0; }
    .notif-title {
      font-size: 0.8125rem; font-weight: 600;
      color: var(--color-text-primary);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .notif-message {
      font-size: 0.75rem; color: var(--color-text-secondary);
      margin-top: 2px;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .notif-time {
      font-size: 0.6875rem; color: var(--color-text-muted); margin-top: 4px;
    }

    .unread-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: var(--color-primary);
      flex-shrink: 0; margin-top: 4px;
    }

    .dropdown-footer {
      padding: 10px 16px;
      border-top: 1px solid var(--color-border-light);
      flex-shrink: 0;
    }
    .view-all-link {
      display: flex; align-items: center; justify-content: center; gap: 6px;
      font-size: 0.8125rem; font-weight: 600;
      color: var(--color-primary);
      text-decoration: none;
      padding: 7px; border-radius: 8px;
      transition: background var(--transition-fast);
      &:hover { background: rgba(26,122,74,0.08); }
      span { font-size: 15px; }
    }

    @keyframes spin { to { transform: rotate(360deg); } }
    .spinning { animation: spin 0.8s linear infinite; display: inline-block; }
    .load-spinner { font-size: 24px; color: var(--color-primary); }

    @keyframes scale-in {
      from { opacity: 0; transform: scale(0.95) translateY(-4px); }
      to   { opacity: 1; transform: scale(1)    translateY(0); }
    }
    .animate-scale-in { animation: scale-in 0.15s ease; }
  `],
})
export class NotificationBellComponent implements OnInit {
  readonly appStore = inject(AppStore);
  private readonly svc = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly open         = signal(false);
  readonly isLoading    = signal(false);
  readonly markingAll   = signal(false);
  readonly notifications = signal<AdminNotification[]>([]);

  private pollSub?: Subscription;
  private loaded = false;

  ngOnInit(): void {
    this.fetchUnreadCount();

    this.pollSub = interval(60_000).subscribe(() => this.fetchUnreadCount());
    this.destroyRef.onDestroy(() => this.pollSub?.unsubscribe());
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent): void {
    if (!(e.target as HTMLElement).closest('.notif-bell')) {
      this.open.set(false);
    }
  }

  toggleOpen(): void {
    const next = !this.open();
    this.open.set(next);
    if (next && !this.loaded) {
      this.loadNotifications();
    }
  }

  private fetchUnreadCount(): void {
    this.svc.getUnreadCount().subscribe({
      next: count => this.appStore.setNotifications(count),
      error: () => {},
    });
  }

  private loadNotifications(): void {
    this.isLoading.set(true);
    this.svc.list({ limit: 10 }).subscribe({
      next: res => {
        this.notifications.set(res.data);
        this.loaded = true;
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  onItemClick(n: AdminNotification): void {
    if (!n.isRead) {
      this.svc.markAsRead(n.id).subscribe({
        next: updated => {
          this.notifications.update(list =>
            list.map(item => item.id === n.id ? { ...item, ...updated, isRead: true } : item)
          );
          this.appStore.setNotifications(Math.max(0, this.appStore.notifications() - 1));
        },
        error: () => {},
      });
    }
  }

  markAllRead(): void {
    this.markingAll.set(true);
    this.svc.markAllAsRead().subscribe({
      next: () => {
        this.notifications.update(list => list.map(n => ({ ...n, isRead: true })));
        this.appStore.setNotifications(0);
        this.markingAll.set(false);
      },
      error: () => this.markingAll.set(false),
    });
  }

  typeIcon(type: string): string {
    const map: Record<string, string> = {
      order_placed:        'shopping_cart',
      order_confirmed:     'check_circle',
      order_cancelled:     'cancel',
      order_agent_confirmed: 'person_check',
      produce_submitted:   'eco',
      produce_approved:    'verified',
      produce_rejected:    'block',
      dispatch_created:    'local_shipping',
      dispatch_en_route:   'route',
      dispatch_delivered:  'done_all',
      chat_message:        'chat',
      system:              'info',
    };
    return map[type] ?? 'notifications';
  }

  typeColor(type: string): string {
    if (type.startsWith('order'))    return '#0284c7';
    if (type.startsWith('produce'))  return '#1a7a4a';
    if (type.startsWith('dispatch')) return '#7c3aed';
    if (type === 'chat_message')     return '#d97706';
    return '#64748b';
  }

  typeBg(type: string): string {
    if (type.startsWith('order'))    return 'rgba(2,132,199,0.1)';
    if (type.startsWith('produce'))  return 'rgba(26,122,74,0.1)';
    if (type.startsWith('dispatch')) return 'rgba(124,58,237,0.1)';
    if (type === 'chat_message')     return 'rgba(217,119,6,0.1)';
    return 'rgba(100,116,139,0.1)';
  }

  timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const s = Math.floor(diff / 1000);
    if (s < 60)   return 'just now';
    const m = Math.floor(s / 60);
    if (m < 60)   return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24)   return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 7)    return `${d}d ago`;
    return new Date(iso).toLocaleDateString('en-GH', { day: 'numeric', month: 'short' });
  }
}
