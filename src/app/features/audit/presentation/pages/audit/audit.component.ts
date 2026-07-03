import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { DataTableComponent, Column, TableAction } from '../../../../../shared/components/data-table/data-table.component';

type AuditRecord = Record<string, unknown> & AuditLog;

interface AuditLog {
  id: string;
  action: string;
  module: string;
  user: string;
  role: string;
  entityId: string;
  changes: string;
  ip: string;
  createdAt: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

const MOCK_AUDIT: AuditLog[] = [
  { id: 'LOG-001', action: 'USER_LOGIN', module: 'Authentication', user: 'Kwame Asante', role: 'Super Admin', entityId: 'USR-0001', changes: 'Successful login from Accra', ip: '192.168.1.101', createdAt: new Date().toISOString(), severity: 'low' },
  { id: 'LOG-002', action: 'PAYMENT_APPROVED', module: 'Payments', user: 'Kofi Boateng', role: 'Finance Manager', entityId: 'PAY-000421', changes: '₵12,450 approved for 18 farmers', ip: '192.168.1.205', createdAt: new Date(Date.now() - 3600000).toISOString(), severity: 'medium' },
  { id: 'LOG-003', action: 'AGENT_TRANSFERRED', module: 'Agents', user: 'Abena Mensah', role: 'Operations Manager', entityId: 'AGT-0023', changes: 'Agent moved from Ashanti to Eastern Region', ip: '192.168.1.88', createdAt: new Date(Date.now() - 7200000).toISOString(), severity: 'medium' },
  { id: 'LOG-004', action: 'LBC_SUSPENDED', module: 'LBC', user: 'Kwame Asante', role: 'Super Admin', entityId: 'LBC-0015', changes: 'LBC suspended: non-compliance violation', ip: '192.168.1.101', createdAt: new Date(Date.now() - 10800000).toISOString(), severity: 'high' },
  { id: 'LOG-005', action: 'PRODUCE_REJECTED', module: 'Produce', user: 'QA Team', role: 'QA Officer', entityId: 'PRD-00182', changes: '0.8t of cocoa rejected: Grade C sub-standard', ip: '192.168.1.77', createdAt: new Date(Date.now() - 14400000).toISOString(), severity: 'medium' },
  { id: 'LOG-006', action: 'FAILED_LOGIN_ATTEMPT', module: 'Authentication', user: 'Unknown', role: '—', entityId: '—', changes: '5 failed login attempts for ops@soiltech.com', ip: '203.0.113.42', createdAt: new Date(Date.now() - 18000000).toISOString(), severity: 'critical' },
  { id: 'LOG-007', action: 'SETTINGS_UPDATED', module: 'Settings', user: 'Kwame Asante', role: 'Super Admin', entityId: 'SYS-001', changes: 'Cocoa price updated: Grade A ₵8.20 → ₵8.50', ip: '192.168.1.101', createdAt: new Date(Date.now() - 86400000).toISOString(), severity: 'high' },
  { id: 'LOG-008', action: 'FARMER_APPROVED', module: 'Farmers', user: 'QA Team', role: 'QA Officer', entityId: 'FMR-04821', changes: 'KYC verified and farmer account activated', ip: '192.168.1.77', createdAt: new Date(Date.now() - 172800000).toISOString(), severity: 'low' },
];

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, DataTableComponent],
  template: `
    <div class="page-container">
      <app-page-header
        title="Audit Logs"
        subtitle="Complete record of user activities, system events, and security logs"
        icon="history"
        [badge]="MOCK_AUDIT.length"
        [breadcrumbs]="[{ label: 'Home', url: '/dashboard' }, { label: 'Audit Logs' }]"
      >
        <button class="btn btn-secondary btn-sm">
          <span class="material-symbols-rounded">download</span> Export Logs
        </button>
        <button class="btn btn-secondary btn-sm">
          <span class="material-symbols-rounded">filter_alt</span> Advanced Filter
        </button>
      </app-page-header>

      <!-- Security summary -->
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin-bottom:20px">
        @for (s of securityStats; track s.label) {
          <div style="background:var(--color-surface);border:1px solid var(--color-border-light);border-radius:var(--radius-md);padding:14px;border-left:3px solid" [style.border-left-color]="s.color">
            <div style="font-size:1.5rem;font-weight:800;color:var(--color-text-primary);letter-spacing:-0.03em" [style.color]="s.color">{{ s.value }}</div>
            <div style="font-size:0.8125rem;color:var(--color-text-secondary);font-weight:500;margin-top:4px">{{ s.label }}</div>
          </div>
        }
      </div>

      <app-data-table
        [data]="logs()"
        [columns]="columns"
        [loading]="loading()"
        searchPlaceholder="Search audit logs by user, action, module..."
      />
    </div>
  `
})
export class AuditComponent implements OnInit {
  readonly MOCK_AUDIT = MOCK_AUDIT;
  readonly logs = signal(MOCK_AUDIT as AuditRecord[]);
  readonly loading = signal(false);

  readonly securityStats = [
    { label: 'Total Events (24h)', value: '1,248', color: '#1a7a4a' },
    { label: 'Failed Logins', value: '17', color: '#dc2626' },
    { label: 'High Severity', value: '8', color: '#d97706' },
    { label: 'Critical Events', value: '2', color: '#dc2626' },
  ];

  readonly columns: Column<AuditRecord>[] = [
    { key: 'id', label: 'Log ID', width: '110px' },
    { key: 'action', label: 'Action', sortable: true, format: (v) => String(v).replace(/_/g, ' ') },
    { key: 'module', label: 'Module', sortable: true },
    { key: 'user', label: 'User', type: 'avatar', sortable: true },
    { key: 'role', label: 'Role' },
    { key: 'entityId', label: 'Entity ID' },
    { key: 'changes', label: 'Details' },
    { key: 'ip', label: 'IP Address' },
    {
      key: 'severity', label: 'Severity', type: 'status',
      statusMap: {
        low: { label: 'Low', class: 'badge--success' },
        medium: { label: 'Medium', class: 'badge--info' },
        high: { label: 'High', class: 'badge--warning' },
        critical: { label: 'Critical', class: 'badge--error' },
      }
    },
    { key: 'createdAt', label: 'Timestamp', type: 'date', sortable: true },
  ];

  ngOnInit(): void {
    this.loading.set(true);
    setTimeout(() => this.loading.set(false), 600);
  }
}
