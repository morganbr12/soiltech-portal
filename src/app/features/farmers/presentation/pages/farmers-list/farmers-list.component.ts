import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { DataTableComponent, Column, TableAction } from '../../../../../shared/components/data-table/data-table.component';
import { RegisterFarmerModalComponent } from '../../components/register-farmer-modal/register-farmer-modal.component';
import { EditFarmerModalComponent } from '../../components/edit-farmer-modal/edit-farmer-modal.component';
import { FarmerStore } from '../../../store/farmer.store';
import { Farmer } from '../../../domain/farmer.model';
import { EntityStatus } from '../../../../../core/enums/status.enum';

@Component({
  selector: 'app-farmers-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent, DataTableComponent, RegisterFarmerModalComponent, EditFarmerModalComponent],
  template: `
    <div class="page-container">
      <app-page-header
        title="Farmer Management"
        subtitle="Register, verify, and manage farmers across all regions"
        icon="person_pin"
        [badge]="store.total()"
        [breadcrumbs]="[{ label: 'Home', url: '/dashboard' }, { label: 'Farmers' }]"
      >
        <button class="btn btn-secondary btn-sm" (click)="onExport()">
          <span class="material-symbols-rounded">download</span> Export
        </button>
        <button class="btn btn-primary btn-sm" (click)="showRegisterModal.set(true)">
          <span class="material-symbols-rounded">person_add</span> Register Farmer
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

      <!-- Filters -->
      <div class="filter-bar">
        <div class="filter-tabs">
          @for (tab of statusTabs(); track tab.value) {
            <button class="filter-tab" [class.active]="activeStatus() === tab.value" (click)="setStatus(tab.value)">
              {{ tab.label }}
              <span class="tab-count">{{ tab.count }}</span>
            </button>
          }
        </div>
        <div class="filter-right">
          <select class="filter-select" [(ngModel)]="regionFilter" (change)="applyFilters()">
            <option value="">All Regions</option>
            @for (r of store.regions(); track r) { <option [value]="r">{{ r }}</option> }
          </select>
        </div>
      </div>

      <!-- Error -->
      @if (store.error() && !store.isLoading()) {
        <div class="error-banner">
          <span class="material-symbols-rounded">error_outline</span>
          <span>{{ store.error() }}</span>
          <button class="btn btn-ghost btn-sm" (click)="applyFilters()">
            <span class="material-symbols-rounded">refresh</span> Retry
          </button>
        </div>
      }

      <app-data-table
        [data]="store.farmers()"
        [columns]="columns"
        [actions]="actions"
        [loading]="store.isLoading()"
        [selectable]="true"
        [searchable]="true"
        searchPlaceholder="Search by name, ID, phone, region..."
        (onSelectionChange)="onSelectionChange($event)"
      />
    </div>

    @if (showRegisterModal()) {
      <app-register-farmer-modal
        (closed)="showRegisterModal.set(false)"
        (registered)="onRegistered()"
      />
    }

    @if (editingFarmer()) {
      <app-edit-farmer-modal
        [farmer]="editingFarmer()!"
        (closed)="editingFarmer.set(null)"
        (updated)="onRegistered()"
      />
    }

    <!-- Approve dialog -->
    @if (approvingFarmer()) {
      <div class="confirm-backdrop" (click)="approvingFarmer.set(null)">
        <div class="confirm-dialog" (click)="$event.stopPropagation()">
          <div class="confirm-icon confirm-icon--success">
            <span class="material-symbols-rounded">how_to_reg</span>
          </div>
          <h3 class="confirm-title">Approve Farmer</h3>
          <p class="confirm-msg">
            Approve <strong>{{ approvingFarmer()!.fullName }}</strong>?
            This sets KYC as verified and changes their status to Approved.
          </p>
          <div class="confirm-actions">
            <button class="btn btn-ghost" (click)="approvingFarmer.set(null)" [disabled]="isProcessing()">Cancel</button>
            <button class="btn-approve" (click)="confirmApprove()" [disabled]="isProcessing()">
              @if (isProcessing()) { <span class="btn-spinner"></span> Approving… }
              @else { <span class="material-symbols-rounded">check_circle</span> Approve }
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Reject dialog -->
    @if (rejectingFarmer()) {
      <div class="confirm-backdrop" (click)="rejectingFarmer.set(null)">
        <div class="confirm-dialog" (click)="$event.stopPropagation()">
          <div class="confirm-icon confirm-icon--warning">
            <span class="material-symbols-rounded">cancel</span>
          </div>
          <h3 class="confirm-title">Reject Farmer</h3>
          <p class="confirm-msg">
            Reject <strong>{{ rejectingFarmer()!.fullName }}</strong>? Provide a reason below (optional).
          </p>
          <textarea class="reject-reason" [(ngModel)]="rejectReason" placeholder="Reason for rejection…" rows="3"></textarea>
          @if (processError()) { <p class="confirm-error">{{ processError() }}</p> }
          <div class="confirm-actions">
            <button class="btn btn-ghost" (click)="rejectingFarmer.set(null); processError.set('')" [disabled]="isProcessing()">Cancel</button>
            <button class="btn-danger" (click)="confirmReject()" [disabled]="isProcessing()">
              @if (isProcessing()) { <span class="btn-spinner"></span> Rejecting… }
              @else { <span class="material-symbols-rounded">cancel</span> Reject }
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Delete dialog -->
    @if (deletingFarmer()) {
      <div class="confirm-backdrop" (click)="deletingFarmer.set(null)">
        <div class="confirm-dialog" (click)="$event.stopPropagation()">
          <div class="confirm-icon confirm-icon--danger">
            <span class="material-symbols-rounded">person_remove</span>
          </div>
          <h3 class="confirm-title">Delete Farmer</h3>
          <p class="confirm-msg">
            Delete <strong>{{ deletingFarmer()!.fullName }}</strong>? This action cannot be undone.
          </p>
          @if (processError()) { <p class="confirm-error">{{ processError() }}</p> }
          <div class="confirm-actions">
            <button class="btn btn-ghost" (click)="deletingFarmer.set(null); processError.set('')" [disabled]="isProcessing()">Cancel</button>
            <button class="btn-danger" (click)="confirmDelete()" [disabled]="isProcessing()">
              @if (isProcessing()) { <span class="btn-spinner"></span> Deleting… }
              @else { <span class="material-symbols-rounded">delete</span> Delete }
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .error-banner { display: flex; align-items: center; gap: 10px; padding: 12px 16px; margin-bottom: 16px; background: rgba(220,38,38,0.06); border: 1px solid rgba(220,38,38,0.2); border-radius: var(--radius-md); color: var(--color-error); font-size: 0.875rem; font-weight: 500; span.material-symbols-rounded { font-size: 20px; font-variation-settings: 'FILL' 1; flex-shrink: 0; } span:not(.material-symbols-rounded) { flex: 1; } }
    .quick-stats { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; margin-bottom: 20px; }
    .quick-stat { background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: var(--radius-md); padding: 14px; display: flex; align-items: center; gap: 12px; }
    .qs-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; span { font-size: 20px; font-variation-settings: 'FILL' 1; } }
    .qs-value { font-size: 1.375rem; font-weight: 700; color: var(--color-text-primary); line-height: 1; }
    .qs-label { font-size: 0.75rem; color: var(--color-text-muted); margin-top: 2px; }
    .filter-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; gap: 12px; flex-wrap: wrap; }
    .filter-tabs { display: flex; gap: 4px; background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: 10px; padding: 4px; }
    .filter-tab { display: flex; align-items: center; gap: 6px; padding: 6px 14px; border: none; border-radius: 7px; cursor: pointer; background: transparent; font-size: 0.875rem; font-weight: 500; color: var(--color-text-secondary); transition: all var(--transition-fast); font-family: inherit; &.active { background: var(--color-primary); color: white; .tab-count { background: rgba(255,255,255,0.25); color: white; } } }
    .tab-count { background: var(--color-border-light); color: var(--color-text-muted); font-size: 0.6875rem; font-weight: 700; padding: 1px 6px; border-radius: 99px; }
    .filter-right { display: flex; gap: 8px; align-items: center; }
    .filter-select { border: 1px solid var(--color-border); border-radius: 8px; padding: 7px 12px; font-size: 0.875rem; background: var(--color-surface); color: var(--color-text-primary); cursor: pointer; }

    .confirm-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(3px); z-index: 1100; display: flex; align-items: center; justify-content: center; padding: 16px; animation: cfade 150ms ease; }
    @keyframes cfade { from { opacity: 0; } to { opacity: 1; } }
    .confirm-dialog { background: var(--color-surface); border-radius: var(--radius-lg); box-shadow: var(--shadow-xl); padding: 36px 32px 28px; max-width: 400px; width: 100%; text-align: center; animation: cpop 180ms cubic-bezier(0.16,1,0.3,1); }
    @keyframes cpop { from { opacity: 0; transform: scale(0.93) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
    .confirm-icon { width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 18px; span { font-size: 30px; font-variation-settings: 'FILL' 1; } &--success { background: rgba(22,163,74,0.1); span { color: #16a34a; } } &--warning { background: rgba(217,119,6,0.1); span { color: #d97706; } } &--danger { background: rgba(220,38,38,0.1); span { color: var(--color-error); } } }
    .confirm-title { font-size: 1.125rem; font-weight: 700; color: var(--color-text-primary); margin: 0 0 10px; }
    .confirm-msg { font-size: 0.9rem; color: var(--color-text-secondary); line-height: 1.6; margin: 0 0 16px; strong { color: var(--color-text-primary); font-weight: 600; } }
    .confirm-error { font-size: 0.8125rem; color: var(--color-error); font-weight: 500; background: rgba(220,38,38,0.08); border: 1px solid rgba(220,38,38,0.2); border-radius: var(--radius-sm); padding: 8px 12px; margin: 0 0 16px; text-align: left; }
    .confirm-actions { display: flex; gap: 10px; justify-content: center; }
    .reject-reason { width: 100%; box-sizing: border-box; padding: 10px 12px; border: 1.5px solid var(--color-border); border-radius: var(--radius-sm); font-size: 0.875rem; font-family: inherit; color: var(--color-text-primary); background: var(--color-surface); resize: vertical; outline: none; margin-bottom: 16px; &:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(26,122,74,0.12); } }
    .btn-danger { display: inline-flex; align-items: center; gap: 6px; padding: 10px 22px; border: none; border-radius: var(--radius-sm); cursor: pointer; font-size: 0.9rem; font-weight: 600; font-family: inherit; background: var(--color-error); color: white; transition: opacity var(--transition-fast); span.material-symbols-rounded { font-size: 17px; } &:hover:not(:disabled) { opacity: 0.88; } &:disabled { opacity: 0.55; cursor: not-allowed; } }
    .btn-approve { display: inline-flex; align-items: center; gap: 6px; padding: 10px 22px; border: none; border-radius: var(--radius-sm); cursor: pointer; font-size: 0.9rem; font-weight: 600; font-family: inherit; background: #16a34a; color: white; transition: opacity var(--transition-fast); span.material-symbols-rounded { font-size: 17px; } &:hover:not(:disabled) { opacity: 0.88; } &:disabled { opacity: 0.55; cursor: not-allowed; } }
    .btn-spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.35); border-top-color: white; border-radius: 50%; animation: spin 0.65s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class FarmersListComponent implements OnInit {
  readonly store = inject(FarmerStore);
  readonly activeStatus = signal('all');
  readonly showRegisterModal = signal(false);
  readonly editingFarmer = signal<Farmer | null>(null);
  readonly approvingFarmer = signal<Farmer | null>(null);
  readonly rejectingFarmer = signal<Farmer | null>(null);
  readonly deletingFarmer = signal<Farmer | null>(null);
  readonly isProcessing = signal(false);
  readonly processError = signal('');
  regionFilter = '';
  rejectReason = '';

  readonly stats = computed(() => [
    { label: 'Total Farmers', value: this.store.total(),         icon: 'person_pin',   color: '#1a7a4a', bg: 'rgba(26,122,74,0.1)'  },
    { label: 'Approved',      value: this.store.totalApproved(), icon: 'how_to_reg',   color: '#16a34a', bg: 'rgba(22,163,74,0.1)'  },
    { label: 'Pending',       value: this.store.totalPending(),  icon: 'pending',      color: '#d97706', bg: 'rgba(217,119,6,0.1)'  },
    { label: 'Rejected',      value: this.store.totalRejected(), icon: 'person_off',   color: '#dc2626', bg: 'rgba(220,38,38,0.1)'  },
  ]);

  readonly statusTabs = computed(() => [
    { label: 'All',      value: 'all',                    count: this.store.total()         },
    { label: 'Approved', value: EntityStatus.APPROVED,    count: this.store.totalApproved() },
    { label: 'Pending',  value: EntityStatus.PENDING,     count: this.store.totalPending()  },
    { label: 'Rejected', value: EntityStatus.REJECTED,    count: this.store.totalRejected() },
  ]);

  readonly columns: Column<Farmer>[] = [
    { key: 'farmerCode',    label: 'Farmer ID',     width: '120px', sortable: true },
    { key: 'fullName',      label: 'Name',          type: 'avatar', sortable: true },
    { key: 'phone',         label: 'Phone' },
    { key: 'agentName',     label: 'Agent',         sortable: true },
    { key: 'region',        label: 'Region',        sortable: true },
    { key: 'farmsCount',    label: 'Farms',         align: 'center', sortable: true },
    { key: 'totalFarmSize', label: 'Farm Size (ha)', align: 'right', sortable: true },
    { key: 'cropTypes',     label: 'Crops',         format: (v) => Array.isArray(v) ? (v as string[]).join(', ') : '' },
    { key: 'kycVerified',   label: 'KYC',           align: 'center', format: (v) => v ? 'Verified' : 'Pending' },
    {
      key: 'status', label: 'Status', type: 'status',
      statusMap: {
        [EntityStatus.APPROVED]: { label: 'Approved', class: 'badge--success' },
        [EntityStatus.PENDING]:  { label: 'Pending',  class: 'badge--warning' },
        [EntityStatus.REJECTED]: { label: 'Rejected', class: 'badge--error'   },
      }
    },
    { key: 'joinedDate', label: 'Joined', type: 'date', sortable: true },
  ];

  readonly actions: TableAction<Farmer>[] = [
    { label: 'View Profile', icon: 'visibility', handler: (row) => console.log('view', row.id) },
    { label: 'Edit',    icon: 'edit',         handler: (row) => this.editingFarmer.set(row) },
    {
      label: 'Approve', icon: 'check_circle',
      condition: (row) => row.status === EntityStatus.PENDING,
      handler: (row) => this.approvingFarmer.set(row),
    },
    {
      label: 'Reject', icon: 'cancel',
      condition: (row) => row.status === EntityStatus.PENDING,
      handler: (row) => { this.rejectReason = ''; this.rejectingFarmer.set(row); },
    },
    { label: 'Delete', icon: 'delete', color: '#dc2626', handler: (row) => this.deletingFarmer.set(row) },
  ];

  ngOnInit(): void {
    this.store.load({});
  }

  setStatus(status: string): void {
    this.activeStatus.set(status);
    this.applyFilters();
  }

  applyFilters(): void {
    this.store.load({
      status: this.activeStatus() === 'all' ? undefined : this.activeStatus(),
      region: this.regionFilter || undefined,
    });
  }

  onSelectionChange(rows: Farmer[]): void {
    this.store.setSelectedIds(rows.map(r => r.id));
  }

  onRegistered(): void {
    this.store.load({
      status: this.activeStatus() === 'all' ? undefined : this.activeStatus(),
      region: this.regionFilter || undefined,
    });
  }

  onExport(): void {
    console.log('export farmers');
  }

  confirmApprove(): void {
    const farmer = this.approvingFarmer();
    if (!farmer || this.isProcessing()) return;
    this.isProcessing.set(true);
    this.store.approve(farmer.id, {
      onSuccess: () => { this.isProcessing.set(false); this.approvingFarmer.set(null); },
      onError: (msg) => { this.isProcessing.set(false); this.processError.set(msg); },
    });
  }

  confirmReject(): void {
    const farmer = this.rejectingFarmer();
    if (!farmer || this.isProcessing()) return;
    this.isProcessing.set(true);
    this.processError.set('');
    this.store.reject(farmer.id, this.rejectReason, {
      onSuccess: () => { this.isProcessing.set(false); this.rejectingFarmer.set(null); this.rejectReason = ''; },
      onError: (msg) => { this.isProcessing.set(false); this.processError.set(msg); },
    });
  }

  confirmDelete(): void {
    const farmer = this.deletingFarmer();
    if (!farmer || this.isProcessing()) return;
    this.isProcessing.set(true);
    this.processError.set('');
    this.store.deleteOne(farmer.id, {
      onSuccess: () => { this.isProcessing.set(false); this.deletingFarmer.set(null); this.processError.set(''); },
      onError: (msg) => { this.isProcessing.set(false); this.processError.set(msg); },
    });
  }
}
