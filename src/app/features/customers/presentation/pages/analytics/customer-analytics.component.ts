import { Component, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { CustomerStore } from '../../../store/customer.store';
import { CustomerTier } from '../../../domain/customer.model';

@Component({
  selector: 'app-customer-analytics',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule, PageHeaderComponent],
  template: `
    <div class="page-container">
      <app-page-header
        title="Customer Analytics"
        subtitle="Deep insights into buyer behaviour, retention, and growth"
        icon="insights"
        [breadcrumbs]="[{ label: 'Home', url: '/dashboard' }, { label: 'Customers', url: '/customers' }, { label: 'Analytics' }]"
      >
        <button class="btn btn-secondary btn-sm">
          <span class="material-symbols-rounded">download</span> Export Report
        </button>
      </app-page-header>

      <!-- KPI Row -->
      <div class="kpi-grid stagger-children">
        @for (kpi of kpis; track kpi.label) {
          <div class="kpi-card animate-slide-up">
            <div class="kpi-icon" [style.background]="kpi.bg">
              <span class="material-symbols-rounded" [style.color]="kpi.color">{{ kpi.icon }}</span>
            </div>
            <div class="kpi-body">
              <div class="kpi-value">{{ kpi.value }}</div>
              <div class="kpi-label">{{ kpi.label }}</div>
              <div class="kpi-trend" [style.color]="kpi.trendColor">
                <span class="material-symbols-rounded">{{ kpi.trendIcon }}</span> {{ kpi.trend }}
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Charts Row 1 -->
      <div class="chart-row">
        <div class="chart-card">
          <h3 class="chart-title">Monthly Active vs Churned Customers</h3>
          <apx-chart
            [series]="retentionChart.series"
            [chart]="retentionChart.chart"
            [xaxis]="retentionChart.xaxis"
            [stroke]="retentionChart.stroke"
            [fill]="retentionChart.fill"
            [colors]="retentionChart.colors"
            [dataLabels]="retentionChart.dataLabels"
            [grid]="retentionChart.grid"
            [legend]="retentionChart.legend"
          />
        </div>
        <div class="chart-card" style="max-width:360px;flex-shrink:0">
          <h3 class="chart-title">Customer Tier Distribution</h3>
          <apx-chart
            [series]="tierChart().series"
            [chart]="tierChart().chart"
            [labels]="tierChart().labels"
            [colors]="tierChart().colors"
            [legend]="tierChart().legend"
            [dataLabels]="tierChart().dataLabels"
            [plotOptions]="tierChart().plotOptions"
          />
          <div class="tier-legend">
            @for (t of tierLegend(); track t.label) {
              <div class="tier-row">
                <div class="tier-dot" [style.background]="t.color"></div>
                <span class="tier-label">{{ t.label }}</span>
                <span class="tier-count">{{ t.count }}</span>
                <span class="tier-pct">{{ t.pct }}%</span>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Charts Row 2 -->
      <div class="chart-row">
        <div class="chart-card">
          <h3 class="chart-title">Customer Spend Cohorts (GHS)</h3>
          <apx-chart
            [series]="cohortChart.series"
            [chart]="cohortChart.chart"
            [xaxis]="cohortChart.xaxis"
            [colors]="cohortChart.colors"
            [plotOptions]="cohortChart.plotOptions"
            [dataLabels]="cohortChart.dataLabels"
            [grid]="cohortChart.grid"
          />
        </div>
        <div class="chart-card">
          <h3 class="chart-title">Order Frequency Distribution</h3>
          <apx-chart
            [series]="freqChart.series"
            [chart]="freqChart.chart"
            [xaxis]="freqChart.xaxis"
            [colors]="freqChart.colors"
            [plotOptions]="freqChart.plotOptions"
            [dataLabels]="freqChart.dataLabels"
            [grid]="freqChart.grid"
          />
        </div>
      </div>

      <!-- Regional Analysis -->
      <div class="chart-card" style="margin-bottom:16px">
        <h3 class="chart-title" style="margin-bottom:16px">Regional Customer Performance</h3>
        <div class="region-table">
          <table class="mini-table">
            <thead>
              <tr>
                <th>Region</th>
                <th>Customers</th>
                <th>Orders</th>
                <th>Revenue (GHS)</th>
                <th>Avg Order Value</th>
                <th>Retention</th>
              </tr>
            </thead>
            <tbody>
              @for (r of regionalData; track r.region) {
                <tr>
                  <td style="font-weight:600">{{ r.region }}</td>
                  <td>{{ r.customers }}</td>
                  <td>{{ r.orders }}</td>
                  <td style="font-weight:600;color:var(--color-primary)">{{ r.revenue.toLocaleString('en-GH') }}</td>
                  <td>{{ r.avgOrder.toLocaleString('en-GH', {maximumFractionDigits: 0}) }}</td>
                  <td>
                    <div style="display:flex;align-items:center;gap:6px">
                      <div style="flex:1;height:6px;background:var(--color-border-light);border-radius:99px">
                        <div [style.width.%]="r.retention" [style.background]="r.retention > 70 ? '#16a34a' : r.retention > 50 ? '#d97706' : '#dc2626'" style="height:100%;border-radius:99px"></div>
                      </div>
                      <span style="font-size:0.75rem;font-weight:600">{{ r.retention }}%</span>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Churn Prediction -->
      <div class="chart-card">
        <h3 class="chart-title">Churn Risk Radar</h3>
        <apx-chart
          [series]="churnChart.series"
          [chart]="churnChart.chart"
          [xaxis]="churnChart.xaxis"
          [colors]="churnChart.colors"
          [stroke]="churnChart.stroke"
          [fill]="churnChart.fill"
          [dataLabels]="churnChart.dataLabels"
          [grid]="churnChart.grid"
        />
      </div>
    </div>
  `,
  styles: [`
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 14px; margin-bottom: 20px; }
    .kpi-card { background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: var(--radius-lg); padding: 16px; display: flex; gap: 12px; align-items: flex-start; }
    .kpi-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; span { font-size: 22px; font-variation-settings: 'FILL' 1; } }
    .kpi-value { font-size: 1.5rem; font-weight: 800; color: var(--color-text-primary); line-height: 1; }
    .kpi-label { font-size: 0.75rem; color: var(--color-text-muted); margin: 4px 0 6px; }
    .kpi-trend { display: flex; align-items: center; gap: 2px; font-size: 0.6875rem; font-weight: 600; span { font-size: 14px; } }

    .chart-row { display: flex; gap: 16px; margin-bottom: 16px; align-items: flex-start; flex-wrap: wrap; }
    .chart-card { flex: 1; background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: var(--radius-lg); padding: 20px; min-width: 0; }
    .chart-title { font-size: 0.9375rem; font-weight: 700; color: var(--color-text-primary); margin-bottom: 16px; }

    .tier-legend { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
    .tier-row { display: flex; align-items: center; gap: 8px; font-size: 0.8125rem; }
    .tier-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .tier-label { flex: 1; color: var(--color-text-secondary); }
    .tier-count { font-weight: 600; color: var(--color-text-primary); }
    .tier-pct { width: 36px; text-align: right; color: var(--color-text-muted); }

    .region-table { overflow-x: auto; }
    .mini-table { width: 100%; border-collapse: collapse; th { font-size: 0.75rem; font-weight: 600; color: var(--color-text-muted); padding: 8px; text-align: left; border-bottom: 1px solid var(--color-border-light); } td { font-size: 0.8125rem; padding: 10px 8px; border-bottom: 1px solid var(--color-border-light); color: var(--color-text-secondary); } tr:last-child td { border-bottom: none; } }
  `]
})
export class CustomerAnalyticsComponent implements OnInit {
  protected readonly store = inject(CustomerStore);

  readonly kpis = [
    { label: 'Customer Lifetime Value', value: 'GHS 12,450', icon: 'person_celebrate', color: '#1a7a4a', bg: 'rgba(26,122,74,0.1)', trend: '+18% YoY', trendColor: '#16a34a', trendIcon: 'trending_up' },
    { label: 'Retention Rate', value: '74.2%', icon: 'loyalty', color: '#0284c7', bg: 'rgba(2,132,199,0.1)', trend: '+3.1% MoM', trendColor: '#16a34a', trendIcon: 'trending_up' },
    { label: 'Churn Rate', value: '8.4%', icon: 'person_off', color: '#dc2626', bg: 'rgba(220,38,38,0.1)', trend: '-1.2% MoM', trendColor: '#16a34a', trendIcon: 'trending_down' },
    { label: 'Avg Order Value', value: 'GHS 3,820', icon: 'shopping_bag', color: '#7c3aed', bg: 'rgba(124,58,237,0.1)', trend: '+9.5% MoM', trendColor: '#16a34a', trendIcon: 'trending_up' },
    { label: 'Purchase Frequency', value: '4.2x / year', icon: 'repeat', color: '#d97706', bg: 'rgba(217,119,6,0.1)', trend: '+0.8x YoY', trendColor: '#16a34a', trendIcon: 'trending_up' },
  ];

  readonly retentionChart = {
    series: [
      { name: 'Active Customers', data: [58, 62, 65, 70, 68, 75, 72, 78, 74, 80, 76, 82] },
      { name: 'Churned', data: [8, 7, 6, 5, 8, 4, 6, 3, 5, 4, 7, 3] },
    ],
    chart: { type: 'area' as const, height: 250, toolbar: { show: false } },
    stroke: { curve: 'smooth' as const, width: [2.5, 2] },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0.05 } },
    colors: ['#1a7a4a', '#dc2626'],
    xaxis: { categories: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], labels: { style: { fontSize: '11px' } } },
    dataLabels: { enabled: false },
    grid: { borderColor: 'var(--color-border-light)', strokeDashArray: 4 },
    legend: { position: 'top' as const },
  };

  readonly tierLegend = computed(() => {
    const customers = this.store.customers();
    const total = customers.length || 1;
    const count = (tier: CustomerTier) => customers.filter(c => c.tier === tier).length;
    return [
      { label: 'Platinum', count: count(CustomerTier.PLATINUM), color: '#7c3aed', pct: Math.round(count(CustomerTier.PLATINUM) / total * 100) },
      { label: 'Gold',     count: count(CustomerTier.GOLD),     color: '#f59e0b', pct: Math.round(count(CustomerTier.GOLD)     / total * 100) },
      { label: 'Silver',   count: count(CustomerTier.SILVER),   color: '#94a3b8', pct: Math.round(count(CustomerTier.SILVER)   / total * 100) },
      { label: 'Bronze',   count: count(CustomerTier.BRONZE),   color: '#b45309', pct: Math.round(count(CustomerTier.BRONZE)   / total * 100) },
    ];
  });

  readonly tierChart = computed(() => {
    const legend = this.tierLegend();
    return {
      series: legend.map(t => t.count),
      chart: { type: 'donut' as const, height: 220 },
      labels: legend.map(t => t.label),
      colors: legend.map(t => t.color),
      legend: { show: false },
      dataLabels: { enabled: false },
      plotOptions: { pie: { donut: { size: '72%' } } },
    };
  });

  readonly cohortChart = {
    series: [{ name: 'Customers', data: [22, 18, 15, 12, 8, 5] }],
    chart: { type: 'bar' as const, height: 220, toolbar: { show: false } },
    colors: ['#1a7a4a'],
    xaxis: { categories: ['0-500', '500-2K', '2K-10K', '10K-30K', '30K-60K', '60K+'], labels: { style: { fontSize: '11px' } } },
    plotOptions: { bar: { borderRadius: 4, columnWidth: '55%' } },
    dataLabels: { enabled: false },
    grid: { borderColor: 'var(--color-border-light)', strokeDashArray: 4 },
  };

  readonly freqChart = {
    series: [{ name: 'Customers', data: [8, 15, 20, 18, 12, 10, 7, 5, 3, 2] }],
    chart: { type: 'bar' as const, height: 220, toolbar: { show: false } },
    colors: ['#0284c7'],
    xaxis: { categories: ['1', '2-3', '4-5', '6-10', '11-20', '21-30', '31-50', '51-70', '71-100', '100+'], labels: { style: { fontSize: '11px' } } },
    plotOptions: { bar: { borderRadius: 4, columnWidth: '55%' } },
    dataLabels: { enabled: false },
    grid: { borderColor: 'var(--color-border-light)', strokeDashArray: 4 },
  };

  readonly regionalData = [
    { region: 'Ashanti', customers: 12, orders: 218, revenue: 420000, avgOrder: 1926, retention: 82 },
    { region: 'Greater Accra', customers: 10, orders: 185, revenue: 380000, avgOrder: 2054, retention: 78 },
    { region: 'Northern', customers: 8, orders: 142, revenue: 220000, avgOrder: 1549, retention: 65 },
    { region: 'Eastern', customers: 9, orders: 160, revenue: 295000, avgOrder: 1844, retention: 71 },
    { region: 'Brong-Ahafo', customers: 7, orders: 120, revenue: 185000, avgOrder: 1542, retention: 68 },
    { region: 'Western', customers: 8, orders: 130, revenue: 210000, avgOrder: 1615, retention: 74 },
    { region: 'Volta', customers: 6, orders: 98, revenue: 152000, avgOrder: 1551, retention: 60 },
    { region: 'Central', customers: 7, orders: 115, revenue: 178000, avgOrder: 1548, retention: 66 },
    { region: 'Upper East', customers: 5, orders: 80, revenue: 110000, avgOrder: 1375, retention: 55 },
    { region: 'Upper West', customers: 8, orders: 72, revenue: 98000, avgOrder: 1361, retention: 52 },
  ];

  readonly churnChart = {
    series: [{ name: 'Churn Risk Score', data: [70, 55, 40, 25, 60, 45, 80, 35] }],
    chart: { type: 'bar' as const, height: 250, toolbar: { show: false } },
    xaxis: { categories: ['Inactive 60d', 'Low Spend', 'Single Order', 'No Wallet', 'Low Rating', 'Disputed', 'No Login', 'Pending KYC'], labels: { style: { fontSize: '11px' } } },
    colors: ['#dc2626'],
    stroke: { width: 0 },
    fill: { opacity: 0.85 },
    dataLabels: { enabled: true, formatter: (val: number) => `${val}%`, style: { fontSize: '11px' } },
    grid: { borderColor: 'var(--color-border-light)', strokeDashArray: 4 },
  };

  ngOnInit(): void {
    this.store.loadCustomers({});
  }
}
