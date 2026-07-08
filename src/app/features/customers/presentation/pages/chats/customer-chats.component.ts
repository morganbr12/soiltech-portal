import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { DataTableComponent, Column, TableAction } from '../../../../../shared/components/data-table/data-table.component';
import { CustomerStore } from '../../../store/customer.store';
import { CustomerChat, ChatStatus } from '../../../domain/customer.model';

type ChatRow = CustomerChat & Record<string, unknown>;

@Component({
  selector: 'app-customer-chats',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent, DataTableComponent],
  template: `
    <div class="page-container">
      <app-page-header
        title="Customer Chats"
        subtitle="Monitor and manage customer support conversations"
        icon="chat"
        [badge]="store.openChats()"
        [breadcrumbs]="[{ label: 'Home', url: '/dashboard' }, { label: 'Customers', url: '/customers' }, { label: 'Chats' }]"
      >
        <button class="btn btn-secondary btn-sm" (click)="escalateSelected()">
          <span class="material-symbols-rounded">escalator_warning</span> Escalate
        </button>
      </app-page-header>

      <!-- Stats -->
      <div class="quick-stats stagger-children">
        @for (stat of stats(); track stat.label) {
          <div class="quick-stat animate-slide-up">
            <div class="qs-icon" [style.background]="stat.bg">
              <span class="material-symbols-rounded" [style.color]="stat.color">{{ stat.icon }}</span>
            </div>
            <div>
              <div class="qs-value">{{ stat.value }}</div>
              <div class="qs-label">{{ stat.label }}</div>
            </div>
          </div>
        }
      </div>

      <!-- Chat Layout -->
      <div class="chat-layout">
        <!-- Chat List Panel -->
        <div class="chat-list-panel">
          <div class="chat-panel-header">
            <div class="filter-tabs compact">
              @for (tab of tabs(); track tab.value) {
                <button class="filter-tab" [class.active]="activeTab() === tab.value" (click)="setTab(tab.value)">
                  {{ tab.label }}
                  @if (tab.badge) { <span class="tab-badge">{{ tab.badge }}</span> }
                </button>
              }
            </div>
          </div>
          <div class="chat-list">
            @for (chat of filteredChats(); track chat.id) {
              <div class="chat-item" [class.active]="selectedChat()?.id === chat.id" [class.unread]="chat.unreadCount > 0" (click)="selectChat(chat)">
                <div class="chat-avatar">{{ chat.customerName[0] }}</div>
                <div class="chat-item-info">
                  <div class="chat-item-top">
                    <span class="chat-customer">{{ chat.customerName }}</span>
                    <span class="chat-time">{{ formatTime(chat.lastMessageAt) }}</span>
                  </div>
                  <div class="chat-preview">{{ chat.lastMessage }}</div>
                  <div class="chat-meta">
                    <span class="chat-topic">{{ chat.topic }}</span>
                    <span class="badge" [class]="statusBadge(chat.status)">{{ chat.status }}</span>
                  </div>
                </div>
                @if (chat.unreadCount > 0) {
                  <div class="unread-badge">{{ chat.unreadCount }}</div>
                }
              </div>
            }
          </div>
        </div>

        <!-- Chat Detail Panel -->
        <div class="chat-detail-panel">
          @if (selectedChat()) {
            <div class="chat-detail animate-fade-in">
              <div class="chat-detail-header">
                <div class="chat-detail-avatar">{{ selectedChat()!.customerName[0] }}</div>
                <div class="chat-detail-info">
                  <h3>{{ selectedChat()!.customerName }}</h3>
                  <p>{{ selectedChat()!.topic }} · {{ selectedChat()!.region }}</p>
                </div>
                <div style="margin-left:auto;display:flex;gap:8px">
                  <span class="badge" [class]="statusBadge(selectedChat()!.status)">{{ selectedChat()!.status }}</span>
                  <button class="btn btn-ghost btn-sm" (click)="resolveChat(selectedChat()!)">
                    <span class="material-symbols-rounded">check_circle</span> Resolve
                  </button>
                </div>
              </div>

              <!-- Simulated Messages -->
              <div class="messages-area">
                @for (msg of sampleMessages; track msg.id) {
                  <div class="message" [class.from-agent]="msg.isAgent">
                    <div class="msg-bubble">{{ msg.text }}</div>
                    <div class="msg-time">{{ msg.time }}</div>
                  </div>
                }
              </div>

              <!-- Reply Box -->
              <div class="reply-box">
                <div class="reply-input-wrap">
                  <textarea
                    class="reply-input"
                    rows="3"
                    placeholder="Type your reply..."
                    [(ngModel)]="replyText"
                  ></textarea>
                  <div class="reply-actions">
                    <button class="btn btn-ghost btn-sm">
                      <span class="material-symbols-rounded">attach_file</span>
                    </button>
                    <button class="btn btn-ghost btn-sm">
                      <span class="material-symbols-rounded">emoji_emotions</span>
                    </button>
                    <button class="btn btn-primary btn-sm" style="margin-left:auto" (click)="sendReply()">
                      <span class="material-symbols-rounded">send</span> Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          } @else {
            <div class="empty-chat">
              <span class="material-symbols-rounded">chat_bubble_outline</span>
              <h3>Select a conversation</h3>
              <p>Choose a chat from the list to view and respond</p>
            </div>
          }
        </div>
      </div>

      <!-- Table View -->
      <div style="margin-top:20px">
        <h3 style="font-size:0.9375rem;font-weight:700;color:var(--color-text-primary);margin-bottom:12px">All Conversations</h3>
        <app-data-table
          [data]="store.chats()"
          [columns]="columns"
          [actions]="tableActions"
          [loading]="store.isLoadingChats()"
          [searchable]="true"
          searchPlaceholder="Search conversations..."
        />
      </div>
    </div>
  `,
  styles: [`
    .quick-stats { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; margin-bottom: 20px; }
    .quick-stat { background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: var(--radius-md); padding: 14px; display: flex; align-items: center; gap: 12px; }
    .qs-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; span { font-size: 20px; font-variation-settings: 'FILL' 1; } }
    .qs-value { font-size: 1.375rem; font-weight: 700; color: var(--color-text-primary); line-height: 1; }
    .qs-label { font-size: 0.75rem; color: var(--color-text-muted); margin-top: 2px; }

    .chat-layout {
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: 16px;
      height: 520px;
    }

    .chat-list-panel { background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: var(--radius-lg); display: flex; flex-direction: column; overflow: hidden; }
    .chat-panel-header { padding: 12px; border-bottom: 1px solid var(--color-border-light); }
    .filter-tabs { display: flex; gap: 4px; }
    .filter-tab { flex: 1; padding: 5px 8px; border: none; border-radius: 6px; cursor: pointer; background: transparent; font-size: 0.8125rem; font-weight: 500; color: var(--color-text-secondary); transition: all var(--transition-fast); font-family: inherit; display: flex; align-items: center; justify-content: center; gap: 4px; &.active { background: var(--color-primary); color: white; } }
    .tab-badge { background: #dc2626; color: white; font-size: 0.625rem; font-weight: 700; padding: 1px 5px; border-radius: 99px; }
    .chat-list { flex: 1; overflow-y: auto; }

    .chat-item {
      display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px;
      cursor: pointer; border-bottom: 1px solid var(--color-border-light);
      transition: background var(--transition-fast); position: relative;
      &:hover { background: var(--color-surface-2); }
      &.active { background: rgba(26,122,74,0.07); border-left: 3px solid var(--color-primary); }
      &.unread .chat-customer { font-weight: 700; }
    }
    .chat-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--color-primary-dark), var(--color-primary-light)); color: white; display: flex; align-items: center; justify-content: center; font-size: 0.875rem; font-weight: 700; flex-shrink: 0; }
    .chat-item-info { flex: 1; min-width: 0; }
    .chat-item-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px; }
    .chat-customer { font-size: 0.875rem; color: var(--color-text-primary); }
    .chat-time { font-size: 0.6875rem; color: var(--color-text-muted); }
    .chat-preview { font-size: 0.8125rem; color: var(--color-text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 4px; }
    .chat-meta { display: flex; align-items: center; gap: 6px; }
    .chat-topic { font-size: 0.6875rem; color: var(--color-text-muted); }
    .unread-badge { position: absolute; right: 14px; top: 14px; width: 18px; height: 18px; background: var(--color-primary); color: white; border-radius: 50%; font-size: 0.6875rem; font-weight: 700; display: flex; align-items: center; justify-content: center; }

    .chat-detail-panel { background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: var(--radius-lg); display: flex; flex-direction: column; overflow: hidden; }
    .chat-detail { display: flex; flex-direction: column; height: 100%; }
    .chat-detail-header { display: flex; align-items: center; gap: 12px; padding: 16px 20px; border-bottom: 1px solid var(--color-border-light); }
    .chat-detail-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--color-primary-dark), var(--color-primary-light)); color: white; display: flex; align-items: center; justify-content: center; font-size: 1rem; font-weight: 700; flex-shrink: 0; }
    .chat-detail-info h3 { font-size: 0.9375rem; font-weight: 700; color: var(--color-text-primary); }
    .chat-detail-info p { font-size: 0.75rem; color: var(--color-text-muted); }

    .messages-area { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
    .message { display: flex; flex-direction: column; align-items: flex-start; max-width: 70%; &.from-agent { align-self: flex-end; align-items: flex-end; } }
    .msg-bubble { background: var(--color-surface-2); border: 1px solid var(--color-border-light); border-radius: 12px 12px 12px 4px; padding: 10px 14px; font-size: 0.875rem; color: var(--color-text-primary); .from-agent & { background: var(--color-primary); color: white; border-color: var(--color-primary); border-radius: 12px 12px 4px 12px; } }
    .msg-time { font-size: 0.6875rem; color: var(--color-text-muted); margin-top: 3px; }

    .reply-box { border-top: 1px solid var(--color-border-light); padding: 12px 16px; }
    .reply-input { width: 100%; border: 1px solid var(--color-border); border-radius: 10px; padding: 10px 14px; font-size: 0.875rem; font-family: inherit; background: var(--color-surface); color: var(--color-text-primary); resize: none; box-sizing: border-box; }
    .reply-actions { display: flex; align-items: center; gap: 6px; margin-top: 8px; }

    .empty-chat { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; color: var(--color-text-muted); span.material-symbols-rounded { font-size: 48px; } h3 { font-size: 1rem; font-weight: 600; color: var(--color-text-secondary); } p { font-size: 0.875rem; } }
  `]
})
export class CustomerChatsComponent implements OnInit {
  protected readonly store = inject(CustomerStore);

  readonly activeTab = signal<string>('all');
  readonly selectedChat = signal<ChatRow | null>(null);
  replyText = '';

  readonly stats = computed(() => {
    const s = this.store.chatSummary();
    const unread = this.store.chats().reduce((sum, c) => sum + c.unreadCount, 0);
    return [
      { label: 'Open Chats', value: s.open, icon: 'chat', color: '#1a7a4a', bg: 'rgba(26,122,74,0.1)' },
      { label: 'Escalated', value: s.escalated, icon: 'escalator_warning', color: '#dc2626', bg: 'rgba(220,38,38,0.1)' },
      { label: 'Pending', value: s.pending, icon: 'pending', color: '#d97706', bg: 'rgba(217,119,6,0.1)' },
      { label: 'Resolved', value: s.resolved, icon: 'check_circle', color: '#16a34a', bg: 'rgba(22,163,74,0.1)' },
      { label: 'Unread Msgs', value: unread, icon: 'mark_unread_chat_alt', color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
    ];
  });

  readonly tabs = computed(() => {
    const s = this.store.chatSummary();
    return [
      { label: 'All', value: 'all', badge: 0 },
      { label: 'Open', value: ChatStatus.OPEN, badge: s.open },
      { label: 'Escalated', value: ChatStatus.ESCALATED, badge: s.escalated },
      { label: 'Resolved', value: ChatStatus.RESOLVED, badge: 0 },
    ];
  });

  readonly sampleMessages = [
    { id: 1, text: 'Hello, I have not received my order yet.', isAgent: false, time: '10:23 AM' },
    { id: 2, text: 'Hi! Sorry to hear that. Can you share your order ID?', isAgent: true, time: '10:25 AM' },
    { id: 3, text: 'My order is ORD-0042. I placed it 5 days ago.', isAgent: false, time: '10:26 AM' },
    { id: 4, text: 'Let me check that for you right away. One moment please.', isAgent: true, time: '10:28 AM' },
    { id: 5, text: 'I can see your order is currently in processing. It should be delivered within 2 days.', isAgent: true, time: '10:30 AM' },
  ];

  readonly filteredChats = computed(() => {
    const tab = this.activeTab();
    const chats = this.store.chats() as ChatRow[];
    if (tab === 'all') return chats;
    return chats.filter(c => c.status === tab);
  });

  readonly columns: Column<ChatRow>[] = [
    { key: 'id', label: 'Chat ID', width: '110px' },
    { key: 'customerName', label: 'Customer', type: 'avatar', sortable: true },
    { key: 'topic', label: 'Topic', sortable: true },
    { key: 'agentName', label: 'Assigned Agent' },
    { key: 'region', label: 'Region', sortable: true },
    { key: 'unreadCount', label: 'Unread', type: 'number', align: 'center', sortable: true },
    { key: 'lastMessage', label: 'Last Message' },
    { key: 'status', label: 'Status', type: 'status', statusMap: {
      [ChatStatus.OPEN]: { label: 'Open', class: 'badge--success' },
      [ChatStatus.PENDING]: { label: 'Pending', class: 'badge--warning' },
      [ChatStatus.ESCALATED]: { label: 'Escalated', class: 'badge--error' },
      [ChatStatus.RESOLVED]: { label: 'Resolved', class: 'badge--neutral' },
    }},
    { key: 'lastMessageAt', label: 'Last Message', type: 'date', sortable: true },
  ];

  readonly tableActions: TableAction<ChatRow>[] = [
    { label: 'Open', icon: 'open_in_new', handler: (r) => this.selectChat(r) },
    { label: 'Resolve', icon: 'check_circle', condition: (r) => r.status !== ChatStatus.RESOLVED,
      handler: (r) => this.resolveChat(r) },
    { label: 'Escalate', icon: 'escalator_warning', color: '#dc2626',
      condition: (r) => r.status === ChatStatus.OPEN,
      handler: (r) => this.store.escalateChat(r.id, { onSuccess: () => {}, onError: (e) => console.error(e) }) },
  ];

  ngOnInit(): void {
    this.store.loadChats({});
  }

  setTab(val: string): void { this.activeTab.set(val); }

  selectChat(c: ChatRow): void { this.selectedChat.set(c); }

  escalateSelected(): void { console.log('escalate'); }

  sendReply(): void {
    if (!this.replyText.trim() || !this.selectedChat()) return;
    this.store.sendChatMessage(this.selectedChat()!.id, this.replyText, () => {});
    this.replyText = '';
  }

  resolveChat(c: ChatRow): void {
    this.store.resolveChat(c.id, { onSuccess: () => {}, onError: (e) => console.error(e) });
  }

  statusBadge(s: string): string {
    const map: Record<string, string> = {
      [ChatStatus.OPEN]: 'badge--success', [ChatStatus.PENDING]: 'badge--warning',
      [ChatStatus.ESCALATED]: 'badge--error', [ChatStatus.RESOLVED]: 'badge--neutral',
    };
    return map[s] ?? 'badge--neutral';
  }

  formatTime(iso: string): string {
    const d = new Date(iso);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 60000);
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return d.toLocaleDateString('en-GH', { month: 'short', day: 'numeric' });
  }
}
