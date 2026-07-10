import { Component, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgApexchartsModule } from 'ng-apexcharts';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { CustomerStore } from '../../../store/customer.store';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, NgApexchartsModule, PageHeaderComponent],
  template: `
    <div class="page-container">
      <app-page-header
        title="Customer Dashboard"
        subtitle="Buyers performance overview and key metrics"
        icon="people"
        [breadcrumbs]="[{ label: 'Home', url: '/dashboard' }, { label: 'Customers' }]"
      >
        <button class="btn btn-secondary btn-sm">
          <span class="material-symbols-rounded">download</span> Export
        </button>
        <a routerLink="/customers/list" class="btn btn-primary btn-sm">
          <span class="material-symbols-rounded">people</span> All Customers
        </a>
      </app-page-header>

      <!-- KPI Grid -->
      <div class="kpi-grid stagger-children">
        @for (kpi of kpis(); track kpi.label) {
          <div class="kpi-card animate-slide-up">
            <div class="kpi-icon" [style.background]="kpi.bg">
              <span class="material-symbols-rounded" [style.color]="kpi.color">{{ kpi.icon }}</span>
            </div>
            <div class="kpi-body">
              <div class="kpi-value">{{ kpi.value }}</div>
              <div class="kpi-label">{{ kpi.label }}</div>
              <div class="kpi-delta" [class.positive]="kpi.delta > 0" [class.negative]="kpi.delta < 0">
                <span class="material-symbols-rounded">{{ kpi.delta >= 0 ? 'trending_up' : 'trending_down' }}</span>
                {{ kpi.delta > 0 ? '+' : '' }}{{ kpi.delta }}% vs last month
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Charts Row 1 -->
      <div class="chart-row">
        <div class="chart-card">
          <div class="chart-header">
            <div>
              <h3 class="chart-title">Customer Growth</h3>
              <p class="chart-subtitle">New customers registered per month</p>
            </div>
          </div>
          <apx-chart
            [series]="growthChart().series"
            [chart]="growthChart().chart"
            [xaxis]="growthChart().xaxis"
            [stroke]="growthChart().stroke"
            [fill]="growthChart().fill"
            [colors]="growthChart().colors"
            [dataLabels]="growthChart().dataLabels"
            [grid]="growthChart().grid"
            [tooltip]="growthChart().tooltip"
          />
        </div>

        <div class="chart-card" style="max-width:340px;flex-shrink:0">
          <div class="chart-header">
            <div>
              <h3 class="chart-title">Customer Tiers</h3>
              <p class="chart-subtitle">Distribution by tier</p>
            </div>
          </div>
          <apx-chart
            [series]="tierChart().series"
            [chart]="tierChart().chart"
            [labels]="tierChart().labels"
            [colors]="tierChart().colors"
            [legend]="tierChart().legend"
            [dataLabels]="tierChart().dataLabels"
            [plotOptions]="tierChart().plotOptions"
          />
        </div>
      </div>

      <!-- Charts Row 2 + Top Customers -->
      <div class="chart-row">
        <div class="chart-card">
          <div class="chart-header">
            <div>
              <h3 class="chart-title">Revenue from Customers</h3>
              <p class="chart-subtitle">Monthly buyer spend (GHS)</p>
            </div>
          </div>
          <apx-chart
            [series]="revenueChart().series"
            [chart]="revenueChart().chart"
            [xaxis]="revenueChart().xaxis"
            [colors]="revenueChart().colors"
            [plotOptions]="revenueChart().plotOptions"
            [dataLabels]="revenueChart().dataLabels"
            [grid]="revenueChart().grid"
          />
        </div>

        <!-- Top Customers -->
        <div class="widget-card">
          <div class="widget-header">
            <h3 class="chart-title">Top Customers</h3>
            <a routerLink="/customers/list" class="btn btn-ghost btn-sm">View All</a>
          </div>
          <div class="top-list">
            @for (c of topCustomers(); track c.id; let i = $index) {
              <div class="top-item">
                <div class="top-rank">{{ i + 1 }}</div>
                <div class="top-avatar">{{ c.firstName[0] }}{{ c.lastName[0] }}</div>
                <div class="top-info">
                  <div class="top-name">{{ c.firstName }} {{ c.lastName }}</div>
                  <div class="top-sub">{{ c.region }} · {{ c.totalOrders }} orders</div>
                </div>
                <div class="top-amount">GHS {{ c.totalSpent.toLocaleString('en-GH', {maximumFractionDigits: 0}) }}</div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Recent Orders + Status Breakdown -->
      <div class="chart-row">
        <div class="widget-card" style="flex:1">
          <div class="widget-header">
            <h3 class="chart-title">Recent Orders</h3>
            <a routerLink="/customers/orders" class="btn btn-ghost btn-sm">View All</a>
          </div>
          <table class="mini-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Produce</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              @for (o of recentOrders(); track o.id) {
                <tr>
                  <td style="font-weight:600;color:var(--color-primary)">{{ o.orderCode || o.id }}</td>
                  <td>{{ o.customerName }}</td>
                  <td>{{ o.produce }}</td>
                  <td style="font-weight:600">GHS {{ o.totalAmount.toLocaleString('en-GH', {maximumFractionDigits: 0}) }}</td>
                  <td><span class="badge" [class]="orderBadge(o.status)">{{ o.status }}</span></td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <div class="widget-card" style="min-width:220px;max-width:260px;flex-shrink:0">
          <h3 class="chart-title" style="margin-bottom:16px">Status Breakdown</h3>
          @for (s of statusStats(); track s.label) {
            <div class="status-row">
              <div class="status-dot" [style.background]="s.color"></div>
              <div class="status-label">{{ s.label }}</div>
              <div class="status-bar-wrap">
                <div class="status-bar" [style.width.%]="s.pct" [style.background]="s.color"></div>
              </div>
              <div class="status-count">{{ s.count }}</div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 14px;
      margin-bottom: 20px;
    }

    .kpi-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border-light);
      border-radius: var(--radius-lg);
      padding: 16px;
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }

    .kpi-icon {
      width: 44px; height: 44px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      span { font-size: 22px; font-variation-settings: 'FILL' 1; }
    }

    .kpi-value { font-size: 1.5rem; font-weight: 800; color: var(--color-text-primary); line-height: 1; }
    .kpi-label { font-size: 0.75rem; color: var(--color-text-muted); margin: 4px 0 6px; }
    .kpi-delta {
      display: flex; align-items: center; gap: 2px;
      font-size: 0.6875rem; font-weight: 600; color: var(--color-text-muted);
      span { font-size: 14px; }
      &.positive { color: #16a34a; }
      &.negative { color: #dc2626; }
    }

    .chart-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .chart-card {
      flex: 1;
      background: var(--color-surface);
      border: 1px solid var(--color-border-light);
      border-radius: var(--radius-lg);
      padding: 20px;
      min-width: 0;
    }

    .widget-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border-light);
      border-radius: var(--radius-lg);
      padding: 20px;
    }

    .chart-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .widget-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .chart-title { font-size: 0.9375rem; font-weight: 700; color: var(--color-text-primary); }
    .chart-subtitle { font-size: 0.75rem; color: var(--color-text-muted); margin-top: 2px; }

    .top-list { display: flex; flex-direction: column; gap: 10px; }
    .top-item { display: flex; align-items: center; gap: 10px; }
    .top-rank { width: 20px; font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); text-align: center; flex-shrink: 0; }
    .top-avatar {
      width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
      background: linear-gradient(135deg, var(--color-primary-dark), var(--color-primary-light));
      color: white; font-size: 0.75rem; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
    }
    .top-info { flex: 1; min-width: 0; }
    .top-name { font-size: 0.875rem; font-weight: 600; color: var(--color-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .top-sub { font-size: 0.6875rem; color: var(--color-text-muted); }
    .top-amount { font-size: 0.8125rem; font-weight: 700; color: var(--color-primary); white-space: nowrap; }

    .mini-table {
      width: 100%; border-collapse: collapse;
      th { font-size: 0.75rem; font-weight: 600; color: var(--color-text-muted); padding: 8px; text-align: left; border-bottom: 1px solid var(--color-border-light); }
      td { font-size: 0.8125rem; padding: 10px 8px; border-bottom: 1px solid var(--color-border-light); color: var(--color-text-secondary); }
      tr:last-child td { border-bottom: none; }
    }

    .status-row { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-size: 0.8125rem; }
    .status-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .status-label { width: 80px; color: var(--color-text-secondary); flex-shrink: 0; }
    .status-bar-wrap { flex: 1; height: 6px; background: var(--color-border-light); border-radius: 99px; overflow: hidden; }
    .status-bar { height: 100%; border-radius: 99px; transition: width 0.5s ease; }
    .status-count { width: 28px; text-align: right; font-weight: 700; color: var(--color-text-primary); }
  `]
})
export class CustomerDashboardComponent implements OnInit {
  protected readonly store = inject(CustomerStore);

  readonly kpis = computed(() => {
    const d = this.store.dashboardSummary();
    if (d) {
      return [
        { label: 'Total Customers', value: d.kpis.totalCustomers.toLocaleString(), icon: 'people', color: '#1a7a4a', bg: 'rgba(26,122,74,0.1)', delta: 12 },
        { label: 'Active Buyers', value: d.kpis.activeCustomers.toLocaleString(), icon: 'person_check', color: '#0284c7', bg: 'rgba(2,132,199,0.1)', delta: 8 },
        { label: 'Pending Verify', value: d.kpis.pendingVerification.toLocaleString(), icon: 'pending', color: '#d97706', bg: 'rgba(217,119,6,0.1)', delta: -3 },
        { label: 'Total Revenue', value: d.kpis.totalRevenue ? 'GHS ' + (d.kpis.totalRevenue / 1000).toFixed(0) + 'K' : 'GHS 0K', icon: 'payments', color: '#7c3aed', bg: 'rgba(124,58,237,0.1)', delta: 18 },
        { label: 'Avg Rating', value: d.kpis.avgRating.toFixed(1) + ' ★', icon: 'star', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', delta: 2 },
        { label: 'Total Orders', value: d.kpis.totalOrders.toLocaleString(), icon: 'shopping_bag', color: '#059669', bg: 'rgba(5,150,105,0.1)', delta: 21 },
      ];
    }
    const s = this.store.customerSummary();
    const m = this.store.ordersMeta();
    return [
      { label: 'Total Customers', value: s.total.toLocaleString(), icon: 'people', color: '#1a7a4a', bg: 'rgba(26,122,74,0.1)', delta: 12 },
      { label: 'Active Buyers', value: (s.active + s.verified).toLocaleString(), icon: 'person_check', color: '#0284c7', bg: 'rgba(2,132,199,0.1)', delta: 8 },
      { label: 'Pending Verify', value: s.pending.toLocaleString(), icon: 'pending', color: '#d97706', bg: 'rgba(217,119,6,0.1)', delta: -3 },
      { label: 'Total Revenue', value: '—', icon: 'payments', color: '#7c3aed', bg: 'rgba(124,58,237,0.1)', delta: 18 },
      { label: 'Avg Rating', value: '—', icon: 'star', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', delta: 2 },
      { label: 'Total Orders', value: m.total.toLocaleString(), icon: 'shopping_bag', color: '#059669', bg: 'rgba(5,150,105,0.1)', delta: 21 },
    ];
  });

  readonly topCustomers = computed(() => {
    const d = this.store.dashboardSummary();
    if (d) {
      return d.topCustomers.map(c => {
        const parts = c.fullName.split(' ');
        return { ...c, firstName: parts[0] ?? c.fullName, lastName: parts.slice(1).join(' ') };
      });
    }
    return [...this.store.customers()]
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 7);
  });

  readonly recentOrders = computed(() => {
    const d = this.store.dashboardSummary();
    if (d) return d.recentOrders;
    return [...this.store.orders()]
      .sort((a, b) => b.orderDate.localeCompare(a.orderDate))
      .slice(0, 7);
  });

  readonly statusStats = computed(() => {
    const d = this.store.dashboardSummary();
    const sb = d?.statusBreakdown ?? this.store.customerSummary();
    const total = (d?.kpis.totalCustomers ?? this.store.customerSummary().total) || 1;
    return [
      { label: 'Active', count: sb.active, color: '#16a34a', pct: Math.round(sb.active / total * 100) },
      { label: 'Verified', count: sb.verified, color: '#0284c7', pct: Math.round(sb.verified / total * 100) },
      { label: 'Pending', count: sb.pending, color: '#d97706', pct: Math.round(sb.pending / total * 100) },
      { label: 'Suspended', count: sb.suspended, color: '#dc2626', pct: Math.round(sb.suspended / total * 100) },
      { label: 'Rejected', count: sb.rejected, color: '#94a3b8', pct: Math.round(sb.rejected / total * 100) },
    ];
  });

  readonly tierChart = computed(() => {
    const d = this.store.dashboardSummary();
    const tb = d?.tierBreakdown ?? { bronze: 0, silver: 0, gold: 0, platinum: 0 };
    return {
      series: [tb.bronze, tb.silver, tb.gold, tb.platinum],
      chart: { type: 'donut' as const, height: 200 },
      labels: ['Bronze', 'Silver', 'Gold', 'Platinum'],
      colors: ['#b45309', '#94a3b8', '#f59e0b', '#7c3aed'],
      legend: { position: 'bottom' as const, fontSize: '12px' },
      dataLabels: { enabled: false },
      plotOptions: { pie: { donut: { size: '70%' } } },
    };
  });

  private static readonly MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  readonly growthChart = computed(() => {
    const d = this.store.dashboardSummary();
    const data = d?.monthlyGrowth ?? [0,0,0,0,0,0,0,0,0,0,0,0];
    return {
      series: [{ name: 'New Customers', data }],
      chart: { type: 'area' as const, height: 200, toolbar: { show: false } },
      stroke: { curve: 'smooth' as const, width: 2.5 },
      fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.05, stops: [0, 100] } },
      colors: ['#1a7a4a'],
      xaxis: { categories: CustomerDashboardComponent.MONTHS, labels: { style: { fontSize: '11px' } } },
      dataLabels: { enabled: false },
      grid: { borderColor: 'var(--color-border-light)', strokeDashArray: 4 },
      tooltip: { theme: 'light' },
    };
  });

  readonly revenueChart = computed(() => {
    const d = this.store.dashboardSummary();
    const data = d?.monthlyRevenue ?? [0,0,0,0,0,0,0,0,0,0,0,0];
    return {
      series: [{ name: 'Revenue (GHS)', data }],
      chart: { type: 'bar' as const, height: 200, toolbar: { show: false } },
      colors: ['#1a7a4a'],
      xaxis: { categories: CustomerDashboardComponent.MONTHS, labels: { style: { fontSize: '11px' } } },
      plotOptions: { bar: { borderRadius: 4, columnWidth: '60%' } },
      dataLabels: { enabled: false },
      grid: { borderColor: 'var(--color-border-light)', strokeDashArray: 4 },
    };
  });

  orderBadge(status: string): string {
    const map: Record<string, string> = {
      pending: 'badge--warning', confirmed: 'badge--info', processing: 'badge--info',
      delivered: 'badge--success', cancelled: 'badge--error',
    };
    return map[status] ?? 'badge--neutral';
  }

  ngOnInit(): void {
    this.store.loadDashboard();
    this.store.loadCustomers({});
    this.store.loadOrders({});
  }
}
