import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgApexchartsModule } from 'ng-apexcharts';
import { AppStore } from '../../../../../core/state/app.store';
import { DashboardStore } from '../../../store/dashboard.store';
import { KpiCard } from '../../../domain/dashboard.model';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, NgApexchartsModule],
  template: `
    <div class="page-container">

      <!-- Page Header -->
      <div class="dash-header">
        <div>
          <h1 class="dash-title">
            Good {{ greeting() }}, {{ store.user()?.firstName ?? 'Admin' }} 👋
          </h1>
          <p class="dash-subtitle">
            Here's what's happening across your agricultural supply chain today.
            <span class="dash-date">{{ today() }}</span>
          </p>
        </div>
        <div class="dash-actions">
          <button class="btn btn-secondary btn-sm">
            <span class="material-symbols-rounded">download</span>
            Export Report
          </button>
          <button class="btn btn-primary btn-sm">
            <span class="material-symbols-rounded">add</span>
            Quick Action
          </button>
        </div>
      </div>

      <!-- KPI Grid -->
      <div class="kpi-grid stagger-children animate-slide-up">
        @for (kpi of kpis(); track kpi.id) {
          <a [routerLink]="kpi.route" class="kpi-card animate-slide-up">
            <div class="kpi-card__header">
              <div class="kpi-icon" [style.background]="kpi.bgColor">
                <span class="material-symbols-rounded" [style.color]="kpi.color">{{ kpi.icon }}</span>
              </div>
              <div class="kpi-trend" [class.up]="kpi.trend > 0" [class.down]="kpi.trend < 0">
                <span class="material-symbols-rounded">
                  {{ kpi.trend > 0 ? 'trending_up' : kpi.trend < 0 ? 'trending_down' : 'remove' }}
                </span>
                {{ kpi.trend > 0 ? '+' : '' }}{{ kpi.trend }}%
              </div>
            </div>
            <div class="kpi-card__body">
              <div class="kpi-value">{{ kpi.value }}</div>
              <div class="kpi-label">{{ kpi.title }}</div>
              <div class="kpi-trend-label">{{ kpi.trendLabel }}</div>
            </div>
          </a>
        }
      </div>

      <!-- Charts Row -->
      <div class="charts-grid">

        <!-- Collection Trend -->
        <div class="card chart-card chart-card--wide">
          <div class="chart-header">
            <div>
              <h3 class="chart-title">Produce Collection Trends</h3>
              <p class="chart-subtitle">Monthly collection by crop type (tonnes)</p>
            </div>
            <div class="chart-controls">
              <select class="chart-select">
                <option>2026</option>
                <option>2025</option>
              </select>
            </div>
          </div>
          <apx-chart
            [series]="collectionChart().series"
            [chart]="collectionChart().chart"
            [xaxis]="collectionChart().xaxis"
            [colors]="collectionChart().colors"
            [stroke]="collectionChart().stroke"
            [fill]="collectionChart().fill"
            [legend]="collectionChart().legend"
            [grid]="collectionChart().grid"
            [tooltip]="collectionChart().tooltip"
          />
        </div>

        <!-- Delivery Status -->
        <div class="card chart-card">
          <div class="chart-header">
            <div>
              <h3 class="chart-title">Delivery Status</h3>
              <p class="chart-subtitle">Today's distribution</p>
            </div>
          </div>
          <apx-chart
            [series]="donutChart().series"
            [chart]="donutChart().chart"
            [labels]="donutChart().labels"
            [colors]="donutChart().colors"
            [legend]="donutChart().legend"
            [plotOptions]="donutChart().plotOptions"
            [stroke]="donutChart().stroke"
          />
        </div>

      </div>

      <!-- Revenue + Activity + Regions -->
      <div class="bottom-grid">

        <!-- Revenue Chart -->
        <div class="card chart-card">
          <div class="chart-header">
            <div>
              <h3 class="chart-title">Revenue vs Target</h3>
              <p class="chart-subtitle">2026 Monthly performance (₵)</p>
            </div>
          </div>
          <apx-chart
            [series]="revenueChart().series"
            [chart]="revenueChart().chart"
            [xaxis]="revenueChart().xaxis"
            [colors]="revenueChart().colors"
            [stroke]="revenueChart().stroke"
            [fill]="revenueChart().fill"
            [markers]="revenueChart().markers"
            [grid]="revenueChart().grid"
            [yaxis]="revenueChart().yaxis"
            [tooltip]="revenueChart().tooltip"
          />
        </div>

        <!-- Regional Table -->
        <div class="card region-card">
          <div class="chart-header">
            <div>
              <h3 class="chart-title">Regional Overview</h3>
              <p class="chart-subtitle">Performance by region</p>
            </div>
            <a routerLink="/reports" class="view-all-link">View all →</a>
          </div>
          <div class="region-table">
            <div class="region-row region-row--header">
              <span>Region</span>
              <span>Farmers</span>
              <span>Produce</span>
              <span>Revenue</span>
            </div>
            @for (r of regionData(); track r.region) {
              <div class="region-row">
                <span class="region-name">
                  <div class="region-dot"></div>
                  {{ r.region }}
                </span>
                <span>{{ r.farmers | number }}</span>
                <span>{{ r.produce }}t</span>
                <span class="revenue-cell">₵{{ r.revenue | number }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Activity Feed -->
        <div class="card activity-card">
          <div class="chart-header">
            <div>
              <h3 class="chart-title">Recent Activity</h3>
              <p class="chart-subtitle">Live operations feed</p>
            </div>
            <button class="view-all-link">View all →</button>
          </div>
          <div class="activity-list">
            @for (activity of activities(); track activity.id) {
              <div class="activity-item">
                <div class="activity-icon" [style.background]="activity.iconColor + '20'">
                  <span class="material-symbols-rounded" [style.color]="activity.iconColor">{{ activity.icon }}</span>
                </div>
                <div class="activity-content">
                  <div class="activity-title">{{ activity.title }}</div>
                  <div class="activity-desc">{{ activity.description }}</div>
                  <div class="activity-meta">
                    {{ activity.time }}
                    @if (activity.user) {
                      <span class="activity-user">· {{ activity.user }}</span>
                    }
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
    .dash-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 24px;
      gap: 16px;
      flex-wrap: wrap;
    }

    .dash-title { font-size: 1.5rem; font-weight: 700; color: var(--color-text-primary); }
    .dash-subtitle { font-size: 0.875rem; color: var(--color-text-secondary); margin-top: 4px; }
    .dash-date { font-weight: 600; color: var(--color-text-primary); }
    .dash-actions { display: flex; gap: 8px; flex-shrink: 0; }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .kpi-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border-light);
      border-radius: var(--radius-lg);
      padding: 20px;
      text-decoration: none;
      transition: all var(--transition-base);
      display: block;

      &:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); border-color: var(--color-border); }
    }

    .kpi-card__header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .kpi-icon {
      width: 44px; height: 44px;
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      span { font-size: 22px; font-variation-settings: 'FILL' 1, 'wght' 400; }
    }

    .kpi-trend {
      display: flex;
      align-items: center;
      gap: 3px;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 99px;

      span { font-size: 14px; }

      &.up { background: #dcfce7; color: #16a34a; }
      &.down { background: #fee2e2; color: #dc2626; }
    }

    .kpi-value {
      font-size: 1.75rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      color: var(--color-text-primary);
      line-height: 1;
      margin-bottom: 6px;
    }

    .kpi-label { font-size: 0.875rem; font-weight: 600; color: var(--color-text-secondary); margin-bottom: 2px; }
    .kpi-trend-label { font-size: 0.75rem; color: var(--color-text-muted); }

    .charts-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 16px;
      margin-bottom: 16px;

      @media (max-width: 1100px) { grid-template-columns: 1fr; }
    }

    .chart-card {
      padding: 20px;
      &--wide { }
    }

    .chart-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .chart-title { font-size: 1rem; font-weight: 700; color: var(--color-text-primary); }
    .chart-subtitle { font-size: 0.8125rem; color: var(--color-text-muted); margin-top: 2px; }

    .chart-select {
      border: 1px solid var(--color-border);
      border-radius: 8px;
      padding: 4px 8px;
      font-size: 0.8125rem;
      background: var(--color-surface-2);
      color: var(--color-text-primary);
      cursor: pointer;
    }

    .bottom-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;

      @media (max-width: 1280px) { grid-template-columns: 1fr 1fr; }
      @media (max-width: 900px) { grid-template-columns: 1fr; }
    }

    .region-card, .activity-card { padding: 20px; }

    .region-table { font-size: 0.8125rem; }

    .region-row {
      display: grid;
      grid-template-columns: 1.5fr 1fr 1fr 1fr;
      gap: 8px;
      padding: 8px 0;
      border-bottom: 1px solid var(--color-border-light);
      align-items: center;

      &--header {
        font-weight: 700;
        font-size: 0.75rem;
        color: var(--color-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding-bottom: 8px;
      }
    }

    .region-name {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--color-text-primary);
      font-weight: 500;
    }

    .region-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      background: var(--color-primary);
      flex-shrink: 0;
    }

    .revenue-cell { color: var(--color-primary); font-weight: 600; }
    .view-all-link { font-size: 0.8125rem; color: var(--color-primary); text-decoration: none; background: none; border: none; cursor: pointer; font-family: inherit; }

    .activity-list { display: flex; flex-direction: column; gap: 0; height: 320px; overflow-y: auto; &::-webkit-scrollbar { width: 4px; } &::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 99px; } }

    .activity-item {
      display: flex;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid var(--color-border-light);

      &:last-child { border-bottom: none; padding-bottom: 0; }
    }

    .activity-icon {
      width: 36px; height: 36px;
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      span { font-size: 18px; font-variation-settings: 'FILL' 1; }
    }

    .activity-content { flex: 1; min-width: 0; }
    .activity-title { font-size: 0.875rem; font-weight: 600; color: var(--color-text-primary); margin-bottom: 2px; }
    .activity-desc { font-size: 0.8125rem; color: var(--color-text-secondary); margin-bottom: 4px; line-height: 1.4; }
    .activity-meta { font-size: 0.75rem; color: var(--color-text-muted); }
    .activity-user { color: var(--color-primary); font-weight: 500; }
  `]
})
export class DashboardComponent implements OnInit {
  readonly store     = inject(AppStore);
  readonly dashStore = inject(DashboardStore);

  readonly greeting = computed(() => {
    const h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
  });

  readonly today = computed(() => dayjs().format('dddd, MMMM D, YYYY'));

  readonly kpis = computed((): KpiCard[] => {
    const k = this.dashStore.data()?.kpis;
    if (!k) return [];
    const fmt = (n: number) => n.toLocaleString('en-GH', { maximumFractionDigits: 0 });
    const ghs  = (n: number) => `₵${fmt(n)}`;
    return [
      { id: '1',  title: 'Total LBCs',        value: fmt(k.totalLbcs),                     trend: k.totalLbcsTrend,         trendLabel: 'vs last month', icon: 'business_center', color: '#1a7a4a', bgColor: 'rgba(26,122,74,0.1)',    route: '/lbc' },
      { id: '2',  title: 'Active Agents',      value: fmt(k.activeAgents),                  trend: k.activeAgentsTrend,      trendLabel: 'vs last month', icon: 'badge',           color: '#0284c7', bgColor: 'rgba(2,132,199,0.1)',    route: '/agents' },
      { id: '3',  title: 'Registered Farmers', value: fmt(k.registeredFarmers),             trend: k.registeredFarmersTrend, trendLabel: 'vs last month', icon: 'person_pin',      color: '#7c3aed', bgColor: 'rgba(124,58,237,0.1)',   route: '/farmers' },
      { id: '4',  title: 'Registered Farms',   value: fmt(k.registeredFarms),               trend: k.registeredFarmsTrend,   trendLabel: 'vs last month', icon: 'agriculture',     color: '#f59e0b', bgColor: 'rgba(245,158,11,0.1)',   route: '/farms' },
      { id: '5',  title: "Today's Collection", value: `${k.todaysCollection}t`,             trend: k.todaysCollectionTrend,  trendLabel: 'vs yesterday',  icon: 'eco',             color: '#16a34a', bgColor: 'rgba(22,163,74,0.1)',    route: '/produce' },
      { id: '6',  title: 'Vehicles on Route',  value: fmt(k.vehiclesOnRoute),               trend: k.vehiclesOnRouteTrend,   trendLabel: 'vs yesterday',  icon: 'local_shipping',  color: '#0891b2', bgColor: 'rgba(8,145,178,0.1)',    route: '/tracking' },
      { id: '7',  title: 'Drivers Online',     value: fmt(k.driversOnline),                 trend: k.driversOnlineTrend,     trendLabel: 'vs yesterday',  icon: 'drive_eta',       color: '#64748b', bgColor: 'rgba(100,116,139,0.1)', route: '/logistics' },
      { id: '8',  title: 'Deliveries Today',   value: fmt(k.deliveriesToday),               trend: k.deliveriesTodayTrend,   trendLabel: 'vs yesterday',  icon: 'inventory_2',     color: '#dc2626', bgColor: 'rgba(220,38,38,0.1)',    route: '/logistics' },
      { id: '9',  title: 'Warehouse Capacity', value: `${k.warehouseCapacity.toFixed(1)}%`, trend: k.warehouseCapacityTrend, trendLabel: 'fill rate',     icon: 'warehouse',       color: '#d97706', bgColor: 'rgba(217,119,6,0.1)',    route: '/warehouses' },
      { id: '10', title: "Today's Revenue",    value: ghs(k.todaysRevenue),                 trend: k.todaysRevenueTrend,     trendLabel: 'vs yesterday',  icon: 'payments',        color: '#1a7a4a', bgColor: 'rgba(26,122,74,0.1)',    route: '/payments' },
      { id: '11', title: 'Payments Pending',   value: ghs(k.paymentsPending),               trend: k.paymentsPendingTrend,   trendLabel: 'vs yesterday',  icon: 'pending',         color: '#f59e0b', bgColor: 'rgba(245,158,11,0.1)',   route: '/payments' },
      { id: '12', title: 'Failed Deliveries',  value: fmt(k.failedDeliveries),              trend: k.failedDeliveriesTrend,  trendLabel: 'vs yesterday',  icon: 'cancel',          color: '#dc2626', bgColor: 'rgba(220,38,38,0.1)',    route: '/logistics' },
    ];
  });

  readonly activities = computed(() =>
    (this.dashStore.data()?.recentActivity ?? []).map(a => ({
      ...a, time: dayjs(a.time).fromNow(),
    }))
  );

  readonly regionData = computed(() =>
    this.dashStore.data()?.regionalOverview ?? []
  );

  readonly collectionChart = computed(() => {
    const mc = this.dashStore.data()?.monthlyCollection;
    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return {
      series: [
        { name: 'Cocoa',  data: mc?.cocoa  ?? new Array(12).fill(0) },
        { name: 'Coffee', data: mc?.coffee ?? new Array(12).fill(0) },
        { name: 'Cashew', data: mc?.cashew ?? new Array(12).fill(0) },
      ],
      chart: { type: 'area' as const, height: 240, toolbar: { show: false }, fontFamily: 'Inter, sans-serif', background: 'transparent' },
      xaxis: { categories: MONTHS, labels: { style: { fontSize: '12px', colors: '#64748b' } }, axisBorder: { show: false }, axisTicks: { show: false } },
      colors: ['#1a7a4a', '#0284c7', '#f59e0b'],
      stroke: { curve: 'smooth' as const, width: 2 },
      fill: { type: 'gradient', gradient: { opacityFrom: 0.3, opacityTo: 0.05, shadeIntensity: 1 } },
      legend: { position: 'top' as const, horizontalAlign: 'right' as const, fontSize: '12px' },
      grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
      tooltip: { theme: 'light', shared: true },
    };
  });

  readonly donutChart = computed(() => {
    const ds = this.dashStore.data()?.deliveryStatus;
    const vals = ds
      ? [ds.delivered, ds.inTransit, ds.scheduled, ds.failed, ds.returned]
      : [0, 0, 0, 0, 0];
    const total = vals.reduce((a, b) => a + b, 0).toLocaleString();
    return {
      series: vals,
      chart: { type: 'donut' as const, height: 260, fontFamily: 'Inter, sans-serif', background: 'transparent' },
      labels: ['Delivered', 'In Transit', 'Scheduled', 'Failed', 'Returned'],
      colors: ['#16a34a', '#0284c7', '#7c3aed', '#dc2626', '#f59e0b'],
      legend: { position: 'bottom' as const, fontSize: '12px' },
      plotOptions: { pie: { donut: { size: '70%', labels: { show: true, total: { show: true, label: 'Total', formatter: () => total } } } } },
      stroke: { width: 0 },
    };
  });

  readonly revenueChart = computed(() => {
    const mr = this.dashStore.data()?.monthlyRevenue;
    return {
      series: [
        { name: 'Revenue', data: mr?.revenue ?? [] },
        { name: 'Target',  data: mr?.target  ?? [] },
      ],
      chart: { type: 'line' as const, height: 220, toolbar: { show: false }, fontFamily: 'Inter, sans-serif', background: 'transparent' },
      xaxis: { categories: mr?.months ?? [], labels: { style: { fontSize: '12px', colors: '#64748b' } }, axisBorder: { show: false }, axisTicks: { show: false } },
      colors: ['#1a7a4a', '#94a3b8'],
      stroke: { curve: 'smooth' as const, width: [3, 2], dashArray: [0, 5] },
      fill: { type: ['gradient', 'solid'], gradient: { opacityFrom: 0.15, opacityTo: 0.01 } },
      markers: { size: 4, colors: ['#1a7a4a'], strokeColors: '#ffffff', strokeWidth: 2 },
      grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
      yaxis: { labels: { formatter: (v: number) => `₵${(v / 1000).toFixed(0)}k`, style: { fontSize: '11px', colors: '#64748b' } } },
      tooltip: { theme: 'light', y: { formatter: (v: number) => `₵${v.toLocaleString()}` } },
    };
  });

  ngOnInit(): void {
    this.dashStore.load();
  }
}
