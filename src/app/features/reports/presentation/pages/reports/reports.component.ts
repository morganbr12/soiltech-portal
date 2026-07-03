import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';

interface ReportCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  bg: string;
  type: 'daily' | 'weekly' | 'monthly' | 'regional' | 'custom';
  lastGenerated: string;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent],
  template: `
    <div class="page-container">
      <app-page-header
        title="Reports"
        subtitle="Generate, schedule and export comprehensive operational reports"
        icon="assessment"
        [breadcrumbs]="[{ label: 'Home', url: '/dashboard' }, { label: 'Reports' }]"
      >
        <button class="btn btn-secondary btn-sm">
          <span class="material-symbols-rounded">schedule</span> Schedule Report
        </button>
        <button class="btn btn-primary btn-sm">
          <span class="material-symbols-rounded">add</span> Custom Report
        </button>
      </app-page-header>

      <!-- Report Type Tabs -->
      <div style="display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap">
        @for (tab of reportTabs; track tab.id) {
          <button
            class="btn btn-sm"
            [class.btn-primary]="activeTab() === tab.id"
            [class.btn-secondary]="activeTab() !== tab.id"
            (click)="activeTab.set(tab.id)"
          >
            <span class="material-symbols-rounded">{{ tab.icon }}</span>
            {{ tab.label }}
          </button>
        }
      </div>

      <!-- Report Cards -->
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px" class="stagger-children">
        @for (report of filteredReports(); track report.id) {
          <div class="animate-slide-up card" style="padding:20px;cursor:pointer" (click)="generateReport(report)">
            <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:16px">
              <div [style.background]="report.bg" style="width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
                <span class="material-symbols-rounded" [style.color]="report.color" style="font-size:22px;font-variation-settings:'FILL' 1">{{ report.icon }}</span>
              </div>
              <div style="flex:1">
                <div style="font-weight:700;font-size:0.9375rem;color:var(--color-text-primary)">{{ report.title }}</div>
                <div style="font-size:0.8125rem;color:var(--color-text-secondary);margin-top:3px;line-height:1.4">{{ report.description }}</div>
              </div>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between">
              <span style="font-size:0.75rem;color:var(--color-text-muted)">Last generated: {{ report.lastGenerated }}</span>
              <div style="display:flex;gap:6px">
                <button class="btn btn-ghost btn-sm" style="padding:4px 8px" title="Export PDF">
                  <span class="material-symbols-rounded" style="font-size:16px;color:#dc2626">picture_as_pdf</span>
                </button>
                <button class="btn btn-ghost btn-sm" style="padding:4px 8px" title="Export Excel">
                  <span class="material-symbols-rounded" style="font-size:16px;color:#16a34a">table_chart</span>
                </button>
                <button class="btn btn-primary btn-sm">
                  <span class="material-symbols-rounded" style="font-size:14px">play_arrow</span>
                  Generate
                </button>
              </div>
            </div>
          </div>
        }
      </div>

    </div>
  `
})
export class ReportsComponent {
  readonly activeTab = signal('all');

  readonly reportTabs = [
    { id: 'all', label: 'All Reports', icon: 'folder' },
    { id: 'daily', label: 'Daily', icon: 'today' },
    { id: 'weekly', label: 'Weekly', icon: 'date_range' },
    { id: 'monthly', label: 'Monthly', icon: 'calendar_month' },
    { id: 'regional', label: 'Regional', icon: 'map' },
  ];

  readonly reports: ReportCard[] = [
    { id: '1', title: 'Daily Collection Report', description: 'Summary of all produce collected by LBCs and agents for the day', icon: 'eco', color: '#1a7a4a', bg: 'rgba(26,122,74,0.1)', type: 'daily', lastGenerated: 'Today 6:00 AM' },
    { id: '2', title: 'Weekly Agent Performance', description: 'Performance metrics for all agents — farmers visited, produce collected', icon: 'badge', color: '#0284c7', bg: 'rgba(2,132,199,0.1)', type: 'weekly', lastGenerated: 'Last Monday' },
    { id: '3', title: 'Monthly Revenue Report', description: 'Full financial summary including payments, commissions, and outstanding amounts', icon: 'payments', color: '#16a34a', bg: 'rgba(22,163,74,0.1)', type: 'monthly', lastGenerated: 'June 30, 2026' },
    { id: '4', title: 'Regional Overview Report', description: 'Breakdown by region — farmers, agents, farms, produce and revenue', icon: 'map', color: '#7c3aed', bg: 'rgba(124,58,237,0.1)', type: 'regional', lastGenerated: 'Yesterday' },
    { id: '5', title: 'LBC Performance Report', description: 'LBC compliance scores, agent headcount, and produce volumes', icon: 'business_center', color: '#d97706', bg: 'rgba(217,119,6,0.1)', type: 'monthly', lastGenerated: 'July 1, 2026' },
    { id: '6', title: 'Logistics & Delivery Report', description: 'Fleet utilization, delivery success rates, and route efficiency', icon: 'local_shipping', color: '#0891b2', bg: 'rgba(8,145,178,0.1)', type: 'weekly', lastGenerated: 'This week' },
    { id: '7', title: 'Warehouse Inventory Report', description: 'Stock levels, incoming/outgoing produce, and capacity utilization', icon: 'warehouse', color: '#64748b', bg: 'rgba(100,116,139,0.1)', type: 'daily', lastGenerated: 'Today 8:00 AM' },
    { id: '8', title: 'Farmer Payment Report', description: 'All farmer payments — processed, pending, failed with reconciliation data', icon: 'account_balance_wallet', color: '#1a7a4a', bg: 'rgba(26,122,74,0.1)', type: 'monthly', lastGenerated: 'July 1, 2026' },
    { id: '9', title: 'Daily Driver Activity', description: 'Driver trips, mileage, hours online, and delivery completions', icon: 'drive_eta', color: '#dc2626', bg: 'rgba(220,38,38,0.1)', type: 'daily', lastGenerated: 'Today' },
    { id: '10', title: 'Crop Analytics Report', description: 'Grade distribution, price trends, and seasonal yield forecasts', icon: 'analytics', color: '#7c3aed', bg: 'rgba(124,58,237,0.1)', type: 'monthly', lastGenerated: 'June 30, 2026' },
  ];

  readonly filteredReports = () => {
    if (this.activeTab() === 'all') return this.reports;
    return this.reports.filter(r => r.type === this.activeTab());
  };

  generateReport(report: ReportCard): void {
    console.log('Generating report:', report.title);
  }
}
