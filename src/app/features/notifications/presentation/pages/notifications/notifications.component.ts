import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';

interface Notification {
  id: string;
  type: 'sms' | 'push' | 'email' | 'system';
  title: string;
  message: string;
  recipient: string;
  status: 'sent' | 'pending' | 'failed';
  time: string;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  template: `
    <div class="page-container">
      <app-page-header
        title="Notifications"
        subtitle="Send and manage SMS, push, email notifications and system alerts"
        icon="notifications"
        [breadcrumbs]="[{ label: 'Home', url: '/dashboard' }, { label: 'Notifications' }]"
      >
        <button class="btn btn-primary btn-sm">
          <span class="material-symbols-rounded">send</span> Send Notification
        </button>
      </app-page-header>

      <div style="display:grid;grid-template-columns:1fr 340px;gap:16px">

        <!-- Notification list -->
        <div class="card" style="padding:0;overflow:hidden">
          <div style="padding:14px 16px;border-bottom:1px solid var(--color-border-light);display:flex;align-items:center;justify-content:space-between">
            <div style="display:flex;gap:8px">
              @for (tab of notifTabs; track tab.id) {
                <button class="filter-tab" [class.active]="activeType() === tab.id" (click)="activeType.set(tab.id)" style="padding:4px 12px;border:none;border-radius:6px;cursor:pointer;font-size:0.8125rem;background:transparent;font-family:inherit;color:var(--color-text-secondary)">
                  <span class="material-symbols-rounded" style="font-size:14px;vertical-align:middle">{{ tab.icon }}</span>
                  {{ tab.label }}
                </button>
              }
            </div>
            <span style="font-size:0.8125rem;color:var(--color-text-muted)">{{ notifications.length }} total</span>
          </div>

          <div>
            @for (n of notifications; track n.id) {
              <div style="display:flex;gap:12px;padding:14px 16px;border-bottom:1px solid var(--color-border-light);cursor:pointer;transition:background var(--transition-fast)" onmouseover="this.style.background='var(--color-surface-2)'" onmouseout="this.style.background=''">
                <div [style.background]="getTypeBg(n.type)" style="width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
                  <span class="material-symbols-rounded" [style.color]="getTypeColor(n.type)" style="font-size:18px;font-variation-settings:'FILL' 1">{{ getTypeIcon(n.type) }}</span>
                </div>
                <div style="flex:1;min-width:0">
                  <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px">
                    <div style="font-weight:600;font-size:0.875rem;color:var(--color-text-primary)">{{ n.title }}</div>
                    <span class="badge" [class]="n.status === 'sent' ? 'badge--success' : n.status === 'failed' ? 'badge--error' : 'badge--warning'" style="flex-shrink:0">{{ n.status }}</span>
                  </div>
                  <div style="font-size:0.8125rem;color:var(--color-text-secondary);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ n.message }}</div>
                  <div style="font-size:0.75rem;color:var(--color-text-muted);margin-top:4px">{{ n.recipient }} · {{ n.time }}</div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Compose panel -->
        <div class="card" style="padding:20px;height:fit-content">
          <h3 style="font-size:1rem;font-weight:700;color:var(--color-text-primary);margin-bottom:16px">Send Notification</h3>

          <div class="form-group">
            <label class="form-label">Channel</label>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
              @for (ch of channels; track ch.id) {
                <button class="channel-btn" [class.selected]="selectedChannel() === ch.id" (click)="selectedChannel.set(ch.id)">
                  <span class="material-symbols-rounded">{{ ch.icon }}</span>
                  {{ ch.label }}
                </button>
              }
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Recipients</label>
            <select style="width:100%;padding:8px 10px;border:1.5px solid var(--color-border);border-radius:8px;background:var(--color-surface);font-size:0.875rem;color:var(--color-text-primary)">
              <option>All Farmers</option>
              <option>All Agents</option>
              <option>Active Drivers</option>
              <option>All LBC Managers</option>
              <option>Specific User...</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Title</label>
            <input type="text" placeholder="Notification title" style="width:100%;padding:8px 10px;border:1.5px solid var(--color-border);border-radius:8px;background:var(--color-surface);font-size:0.875rem;color:var(--color-text-primary);outline:none">
          </div>

          <div class="form-group">
            <label class="form-label">Message</label>
            <textarea rows="4" placeholder="Enter your message..." style="width:100%;padding:8px 10px;border:1.5px solid var(--color-border);border-radius:8px;background:var(--color-surface);font-size:0.875rem;color:var(--color-text-primary);outline:none;resize:vertical;font-family:inherit"></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Schedule</label>
            <select style="width:100%;padding:8px 10px;border:1.5px solid var(--color-border);border-radius:8px;background:var(--color-surface);font-size:0.875rem;color:var(--color-text-primary)">
              <option>Send Now</option>
              <option>Schedule for later</option>
            </select>
          </div>

          <button class="btn btn-primary" style="width:100%">
            <span class="material-symbols-rounded">send</span> Send Notification
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .filter-tab.active { background: rgba(26,122,74,0.1) !important; color: var(--color-primary) !important; font-weight: 600 !important; }

    .channel-btn {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 10px; border: 1.5px solid var(--color-border-light);
      border-radius: 8px; cursor: pointer; background: var(--color-surface-2);
      font-size: 0.8125rem; color: var(--color-text-secondary); font-family: inherit;
      transition: all var(--transition-fast);

      span { font-size: 16px; }

      &.selected { border-color: var(--color-primary); background: rgba(26,122,74,0.08); color: var(--color-primary); }
    }
  `]
})
export class NotificationsComponent {
  readonly activeType = signal('all');
  readonly selectedChannel = signal('sms');

  readonly notifTabs = [
    { id: 'all', label: 'All', icon: 'notifications' },
    { id: 'sms', label: 'SMS', icon: 'sms' },
    { id: 'push', label: 'Push', icon: 'notifications_active' },
    { id: 'email', label: 'Email', icon: 'mail' },
  ];

  readonly channels = [
    { id: 'sms', label: 'SMS', icon: 'sms' },
    { id: 'push', label: 'Push', icon: 'notifications_active' },
    { id: 'email', label: 'Email', icon: 'mail' },
    { id: 'all', label: 'All', icon: 'campaign' },
  ];

  readonly notifications: Notification[] = [
    { id: '1', type: 'sms', title: 'Payment Alert', message: 'Your payment of ₵1,200 has been approved and processed.', recipient: 'All Active Farmers', status: 'sent', time: '2 min ago' },
    { id: '2', type: 'push', title: 'New Collection Available', message: 'Cocoa collection is open in Ashanti Region. Submit produce now.', recipient: 'Ashanti Farmers', status: 'sent', time: '1h ago' },
    { id: '3', type: 'email', title: 'Weekly Performance Report', message: 'Your weekly summary is ready. View your performance metrics.', recipient: 'All LBC Managers', status: 'sent', time: '3h ago' },
    { id: '4', type: 'system', title: 'System Maintenance Notice', message: 'Scheduled downtime on July 5th, 2:00–4:00 AM GMT.', recipient: 'All Users', status: 'pending', time: '5h ago' },
    { id: '5', type: 'sms', title: 'Price Update', message: 'Cocoa Grade A price updated to ₵8.50/kg effective Monday.', recipient: 'Western Region Agents', status: 'failed', time: '1 day ago' },
    { id: '6', type: 'push', title: 'Vehicle Breakdown Alert', message: 'Driver reported breakdown on Route RT-44 near Techiman.', recipient: 'Logistics Team', status: 'sent', time: '1 day ago' },
  ];

  getTypeIcon(type: string): string {
    const map: Record<string, string> = { sms: 'sms', push: 'notifications_active', email: 'mail', system: 'warning' };
    return map[type] ?? 'notifications';
  }

  getTypeColor(type: string): string {
    const map: Record<string, string> = { sms: '#0284c7', push: '#7c3aed', email: '#1a7a4a', system: '#d97706' };
    return map[type] ?? '#64748b';
  }

  getTypeBg(type: string): string {
    const map: Record<string, string> = { sms: 'rgba(2,132,199,0.1)', push: 'rgba(124,58,237,0.1)', email: 'rgba(26,122,74,0.1)', system: 'rgba(217,119,6,0.1)' };
    return map[type] ?? 'rgba(100,116,139,0.1)';
  }
}
