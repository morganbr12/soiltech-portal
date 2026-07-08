import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { CustomerStore } from '../../../store/customer.store';
import { CustomerTier, CustomerStatus } from '../../../domain/customer.model';

interface NotifTemplate {
  id: string;
  title: string;
  body: string;
  category: string;
  icon: string;
}

@Component({
  selector: 'app-customer-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  template: `
    <div class="page-container">
      <app-page-header
        title="Customer Notifications"
        subtitle="Send targeted push notifications and messages to buyers"
        icon="notifications_active"
        [breadcrumbs]="[{ label: 'Home', url: '/dashboard' }, { label: 'Customers', url: '/customers' }, { label: 'Notifications' }]"
      >
        <button class="btn btn-secondary btn-sm" (click)="toggleHistory()">
          <span class="material-symbols-rounded">history</span> History
        </button>
      </app-page-header>

      <!-- Stats Row -->
      <div class="notif-stats stagger-children">
        @for (stat of stats; track stat.label) {
          <div class="notif-stat animate-slide-up">
            <div class="ns-icon" [style.background]="stat.bg">
              <span class="material-symbols-rounded" [style.color]="stat.color">{{ stat.icon }}</span>
            </div>
            <div>
              <div class="ns-value">{{ stat.value }}</div>
              <div class="ns-label">{{ stat.label }}</div>
            </div>
          </div>
        }
      </div>

      <div class="notif-layout">
        <!-- Compose Panel -->
        <div class="compose-panel">
          <h3 class="panel-title">Compose Notification</h3>

          <!-- Target Audience -->
          <div class="form-section">
            <div class="form-label">Target Audience</div>
            <div class="audience-chips">
              @for (a of audiences(); track a.value) {
                <div class="audience-chip" [class.selected]="selectedAudience() === a.value" (click)="selectAudience(a.value)">
                  <span class="material-symbols-rounded">{{ a.icon }}</span>
                  <span>{{ a.label }}</span>
                  <span class="chip-count">{{ a.count }}</span>
                </div>
              }
            </div>
          </div>

          <!-- Channel -->
          <div class="form-section">
            <div class="form-label">Channel</div>
            <div class="channel-row">
              @for (ch of channels; track ch.value) {
                <label class="channel-option">
                  <input type="checkbox" [checked]="selectedChannels.includes(ch.value)" (change)="toggleChannel(ch.value)">
                  <span class="material-symbols-rounded">{{ ch.icon }}</span>
                  {{ ch.label }}
                </label>
              }
            </div>
          </div>

          <!-- Templates -->
          <div class="form-section">
            <div class="form-label">Quick Templates</div>
            <div class="template-list">
              @for (t of templates; track t.id) {
                <div class="template-item" (click)="applyTemplate(t)">
                  <span class="material-symbols-rounded template-icon">{{ t.icon }}</span>
                  <div>
                    <div class="template-title">{{ t.title }}</div>
                    <div class="template-preview">{{ t.body.substring(0, 60) }}...</div>
                  </div>
                  <span class="template-cat">{{ t.category }}</span>
                </div>
              }
            </div>
          </div>

          <!-- Compose Form -->
          <div class="form-section">
            <div class="form-label">Notification Title</div>
            <input type="text" class="form-input" [(ngModel)]="notifTitle" placeholder="Enter notification title">
          </div>
          <div class="form-section">
            <div class="form-label">Message Body</div>
            <textarea class="form-input" rows="4" [(ngModel)]="notifBody" placeholder="Enter your message..."></textarea>
          </div>

          <!-- Schedule -->
          <div class="form-section">
            <div class="form-label">Send Option</div>
            <div class="send-options">
              <label class="radio-option">
                <input type="radio" name="sendOpt" value="now" [(ngModel)]="sendOption"> Send Now
              </label>
              <label class="radio-option">
                <input type="radio" name="sendOpt" value="schedule" [(ngModel)]="sendOption"> Schedule
              </label>
            </div>
            @if (sendOption === 'schedule') {
              <input type="datetime-local" class="form-input" [(ngModel)]="scheduledAt" style="margin-top:8px">
            }
          </div>

          <div class="compose-footer">
            <div class="recipient-count">
              <span class="material-symbols-rounded">people</span>
              {{ recipientCount() }} recipients
            </div>
            <button class="btn btn-primary" [disabled]="!canSend() || store.isSendingNotif()" (click)="sendNotification()">
              <span class="material-symbols-rounded">send</span>
              {{ store.isSendingNotif() ? 'Sending...' : (sendOption === 'schedule' ? 'Schedule' : 'Send Now') }}
            </button>
          </div>
        </div>

        <!-- Preview Panel -->
        <div class="preview-panel">
          <h3 class="panel-title">Preview</h3>

          <!-- Phone mockup -->
          <div class="phone-mockup">
            <div class="phone-notch"></div>
            <div class="phone-screen">
              <div class="phone-status-bar">
                <span>9:41</span>
                <div style="display:flex;gap:4px">
                  <span class="material-symbols-rounded" style="font-size:14px">signal_cellular_alt</span>
                  <span class="material-symbols-rounded" style="font-size:14px">wifi</span>
                  <span class="material-symbols-rounded" style="font-size:14px">battery_full</span>
                </div>
              </div>
              <div class="phone-content">
                @if (notifTitle || notifBody) {
                  <div class="notif-preview-card animate-fade-in">
                    <div class="notif-preview-header">
                      <div class="notif-app-icon">🌱</div>
                      <span class="notif-app-name">SoilTech</span>
                      <span class="notif-time">now</span>
                    </div>
                    <div class="notif-preview-title">{{ notifTitle || 'Notification Title' }}</div>
                    <div class="notif-preview-body">{{ notifBody || 'Your message will appear here...' }}</div>
                  </div>
                } @else {
                  <div class="phone-home-icons">
                    <div class="home-row">
                      @for (icon of homeIcons; track icon) {
                        <div class="home-icon"></div>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Sent Stats -->
          <h3 class="panel-title" style="margin-top:24px">Recent Campaigns</h3>
          <div class="sent-list">
            @if (store.isLoadingNotifs()) {
              <p style="font-size:0.875rem;color:var(--color-text-muted);padding:12px 0">Loading history...</p>
            }
            @for (s of store.notifHistory(); track s.id) {
              <div class="sent-item">
                <div class="sent-info">
                  <div class="sent-title">{{ s.title }}</div>
                  <div class="sent-meta">{{ s.target }} · {{ s.sentAt }}</div>
                </div>
                <div class="sent-metrics">
                  <div class="metric">
                    <div class="metric-value">{{ s.sent }}</div>
                    <div class="metric-label">Sent</div>
                  </div>
                  <div class="metric">
                    <div class="metric-value" style="color:#16a34a">{{ s.delivered }}</div>
                    <div class="metric-label">Delivered</div>
                  </div>
                  <div class="metric">
                    <div class="metric-value" style="color:#0284c7">{{ s.opened }}</div>
                    <div class="metric-label">Opened</div>
                  </div>
                  <div class="metric">
                    <div class="metric-value" style="color:#7c3aed">{{ s.sent > 0 ? Math.round(s.opened / s.sent * 100) : 0 }}%</div>
                    <div class="metric-label">Open Rate</div>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notif-stats { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; margin-bottom: 20px; }
    .notif-stat { background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: var(--radius-md); padding: 14px; display: flex; align-items: center; gap: 12px; }
    .ns-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; span { font-size: 20px; font-variation-settings: 'FILL' 1; } }
    .ns-value { font-size: 1.375rem; font-weight: 700; color: var(--color-text-primary); line-height: 1; }
    .ns-label { font-size: 0.75rem; color: var(--color-text-muted); margin-top: 2px; }

    .notif-layout { display: grid; grid-template-columns: 1fr 380px; gap: 20px; align-items: flex-start; }

    .compose-panel, .preview-panel { background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: var(--radius-lg); padding: 20px; }
    .panel-title { font-size: 0.9375rem; font-weight: 700; color: var(--color-text-primary); margin-bottom: 16px; }

    .form-section { margin-bottom: 16px; }
    .form-label { font-size: 0.8125rem; font-weight: 600; color: var(--color-text-secondary); margin-bottom: 8px; }
    .form-input { width: 100%; border: 1px solid var(--color-border); border-radius: 8px; padding: 10px 12px; font-size: 0.875rem; font-family: inherit; background: var(--color-surface); color: var(--color-text-primary); box-sizing: border-box; resize: none; &:focus { outline: none; border-color: var(--color-primary); } }

    .audience-chips { display: flex; flex-wrap: wrap; gap: 8px; }
    .audience-chip { display: flex; align-items: center; gap: 6px; padding: 8px 14px; border: 1.5px solid var(--color-border); border-radius: 99px; cursor: pointer; font-size: 0.8125rem; color: var(--color-text-secondary); transition: all var(--transition-fast); &.selected { border-color: var(--color-primary); background: rgba(26,122,74,0.08); color: var(--color-primary); } span.material-symbols-rounded { font-size: 16px; } }
    .chip-count { background: var(--color-border-light); font-size: 0.6875rem; font-weight: 700; padding: 1px 6px; border-radius: 99px; }

    .channel-row { display: flex; gap: 12px; flex-wrap: wrap; }
    .channel-option { display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 0.875rem; color: var(--color-text-secondary); input { cursor: pointer; } span { font-size: 18px; } }

    .template-list { display: flex; flex-direction: column; gap: 6px; max-height: 160px; overflow-y: auto; }
    .template-item { display: flex; align-items: center; gap: 10px; padding: 10px; border: 1px solid var(--color-border-light); border-radius: 8px; cursor: pointer; transition: all var(--transition-fast); &:hover { border-color: var(--color-primary); background: rgba(26,122,74,0.05); } }
    .template-icon { font-size: 20px; color: var(--color-primary); flex-shrink: 0; }
    .template-title { font-size: 0.8125rem; font-weight: 600; color: var(--color-text-primary); }
    .template-preview { font-size: 0.75rem; color: var(--color-text-muted); }
    .template-cat { font-size: 0.6875rem; padding: 2px 8px; background: var(--color-border-light); border-radius: 99px; color: var(--color-text-muted); margin-left: auto; white-space: nowrap; }

    .send-options { display: flex; gap: 16px; }
    .radio-option { display: flex; align-items: center; gap: 6px; font-size: 0.875rem; color: var(--color-text-secondary); cursor: pointer; }

    .compose-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--color-border-light); }
    .recipient-count { display: flex; align-items: center; gap: 6px; font-size: 0.875rem; color: var(--color-text-muted); span { font-size: 18px; } }

    .phone-mockup { width: 240px; height: 420px; background: #1e293b; border-radius: 36px; margin: 0 auto; padding: 12px 8px; box-shadow: 0 20px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1); position: relative; }
    .phone-notch { width: 80px; height: 24px; background: #1e293b; border-radius: 0 0 16px 16px; margin: 0 auto 8px; position: relative; z-index: 1; }
    .phone-screen { background: white; border-radius: 28px; height: calc(100% - 36px); overflow: hidden; }
    .phone-status-bar { display: flex; justify-content: space-between; align-items: center; padding: 8px 16px 4px; font-size: 0.75rem; font-weight: 600; color: #0f172a; }
    .phone-content { padding: 8px; }
    .notif-preview-card { background: rgba(255,255,255,0.95); border-radius: 16px; padding: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); backdrop-filter: blur(10px); }
    .notif-preview-header { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
    .notif-app-icon { width: 18px; height: 18px; border-radius: 4px; font-size: 12px; display: flex; align-items: center; justify-content: center; }
    .notif-app-name { font-size: 0.6875rem; font-weight: 600; color: #475569; flex: 1; }
    .notif-time { font-size: 0.6875rem; color: #94a3b8; }
    .notif-preview-title { font-size: 0.75rem; font-weight: 700; color: #0f172a; margin-bottom: 3px; }
    .notif-preview-body { font-size: 0.6875rem; color: #475569; line-height: 1.4; }
    .phone-home-icons { padding: 16px 8px; }
    .home-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
    .home-icon { aspect-ratio: 1; border-radius: 10px; background: var(--color-border-light); }

    .sent-list { display: flex; flex-direction: column; gap: 10px; }
    .sent-item { border: 1px solid var(--color-border-light); border-radius: var(--radius-md); padding: 14px; }
    .sent-title { font-size: 0.875rem; font-weight: 600; color: var(--color-text-primary); }
    .sent-meta { font-size: 0.75rem; color: var(--color-text-muted); margin-top: 2px; }
    .sent-metrics { display: flex; gap: 16px; margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--color-border-light); }
    .metric { text-align: center; }
    .metric-value { font-size: 1rem; font-weight: 700; color: var(--color-text-primary); }
    .metric-label { font-size: 0.6875rem; color: var(--color-text-muted); }
  `]
})
export class CustomerNotificationsComponent implements OnInit {
  protected readonly store = inject(CustomerStore);
  readonly Math = Math;

  notifTitle = '';
  notifBody = '';
  sendOption = 'now';
  scheduledAt = '';
  selectedChannels: string[] = ['push'];
  readonly selectedAudience = signal('all');
  readonly showHistory = signal(false);

  readonly audiences = computed(() => {
    const s = this.store.customerSummary();
    return [
      { label: 'All Customers', value: 'all', icon: 'people', count: s.total },
      { label: 'Active', value: 'active', icon: 'person_check', count: s.active },
      { label: 'Inactive 30d', value: 'inactive', icon: 'person_off', count: Math.floor(s.total * 0.18) },
      { label: 'Gold+', value: 'gold', icon: 'star', count: 0 },
      { label: 'Unverified', value: 'unverified', icon: 'pending', count: s.pending },
    ];
  });

  readonly channels = [
    { label: 'Push', value: 'push', icon: 'notifications' },
    { label: 'SMS', value: 'sms', icon: 'sms' },
    { label: 'Email', value: 'email', icon: 'email' },
    { label: 'In-App', value: 'inapp', icon: 'chat_bubble' },
  ];

  readonly templates: NotifTemplate[] = [
    { id: 't1', title: 'New Produce Available', body: 'Fresh maize is now available at GHS 2.50/kg from our partner farms. Order now while stocks last!', category: 'Marketing', icon: 'eco' },
    { id: 't2', title: 'Order Delivery Update', body: 'Your order ORD-XXXX has been dispatched and will be delivered within 24 hours.', category: 'Transactional', icon: 'local_shipping' },
    { id: 't3', title: 'Wallet Top-Up Bonus', body: 'Top up your wallet with GHS 500+ and get 5% bonus credit. Offer ends this Friday!', category: 'Promotion', icon: 'card_giftcard' },
    { id: 't4', title: 'Complete Verification', body: 'Please complete your account verification to access all features and place larger orders.', category: 'Onboarding', icon: 'verified_user' },
    { id: 't5', title: 'Price Alert', body: 'Cassava prices have dropped by 12% this week. Check the latest market rates in the app.', category: 'Alert', icon: 'trending_down' },
  ];

  readonly homeIcons = [1, 2, 3, 4, 5, 6, 7, 8];

  readonly stats = [
    { label: 'Total Sent', value: '12,450', icon: 'send', color: '#1a7a4a', bg: 'rgba(26,122,74,0.1)' },
    { label: 'Avg Delivery', value: '96.2%', icon: 'local_post_office', color: '#0284c7', bg: 'rgba(2,132,199,0.1)' },
    { label: 'Avg Open Rate', value: '62.5%', icon: 'mark_email_read', color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
    { label: 'Active Subscribers', value: '—', icon: 'notifications_active', color: '#d97706', bg: 'rgba(217,119,6,0.1)' },
  ];

  readonly recipientCount = computed(() => {
    const s = this.store.customerSummary();
    switch (this.selectedAudience()) {
      case 'all': return s.total;
      case 'active': return s.active;
      case 'inactive': return Math.floor(s.total * 0.18);
      case 'gold': return 0;
      case 'unverified': return s.pending;
      default: return 0;
    }
  });

  readonly canSend = computed(() =>
    this.notifTitle.trim().length > 0 && this.notifBody.trim().length > 0 && this.selectedChannels.length > 0
  );

  ngOnInit(): void {
    this.store.loadCustomers({});
    this.store.loadNotifHistory();
  }

  selectAudience(val: string): void { this.selectedAudience.set(val); }

  toggleChannel(val: string): void {
    if (this.selectedChannels.includes(val)) {
      this.selectedChannels = this.selectedChannels.filter(c => c !== val);
    } else {
      this.selectedChannels = [...this.selectedChannels, val];
    }
  }

  applyTemplate(t: NotifTemplate): void { this.notifTitle = t.title; this.notifBody = t.body; }
  toggleHistory(): void { this.showHistory.update(v => !v); }

  sendNotification(): void {
    if (!this.canSend()) return;
    this.store.sendNotification(
      {
        title: this.notifTitle,
        body: this.notifBody,
        target: this.selectedAudience(),
        category: 'general',
        channels: this.selectedChannels,
        scheduledAt: this.sendOption === 'schedule' ? this.scheduledAt : undefined,
      },
      {
        onSuccess: () => {
          this.notifTitle = '';
          this.notifBody = '';
          this.store.loadNotifHistory();
        },
        onError: (e) => console.error(e),
      }
    );
  }
}
