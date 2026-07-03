import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { MOCK_REGION_DATA, MONTHLY_COLLECTION_DATA } from '../../../../dashboard/data/dashboard.mock';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule, PageHeaderComponent],
  template: `
    <div class="page-container">
      <app-page-header
        title="Analytics"
        subtitle="Interactive charts, regional heat maps, and AI-ready analytics"
        icon="insights"
        [breadcrumbs]="[{ label: 'Home', url: '/dashboard' }, { label: 'Analytics' }]"
      >
        <button class="btn btn-secondary btn-sm">
          <span class="material-symbols-rounded">download</span> Export
        </button>
        <select class="btn btn-ghost btn-sm" style="border:1px solid var(--color-border);cursor:pointer;font-family:inherit">
          <option>Last 30 Days</option>
          <option>Last 90 Days</option>
          <option>Last 12 Months</option>
        </select>
      </app-page-header>

      <!-- Chart grid -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">

        <div class="card" style="padding:20px">
          <h3 style="font-size:1rem;font-weight:700;color:var(--color-text-primary);margin-bottom:4px">Produce by Region</h3>
          <p style="font-size:0.8125rem;color:var(--color-text-muted);margin-bottom:16px">Tonnes collected per region</p>
          <apx-chart
            [series]="barChart.series"
            [chart]="barChart.chart"
            [xaxis]="barChart.xaxis"
            [colors]="barChart.colors"
            [plotOptions]="barChart.plotOptions"
            [grid]="barChart.grid"
            [dataLabels]="barChart.dataLabels"
          />
        </div>

        <div class="card" style="padding:20px">
          <h3 style="font-size:1rem;font-weight:700;color:var(--color-text-primary);margin-bottom:4px">Farmer Growth</h3>
          <p style="font-size:0.8125rem;color:var(--color-text-muted);margin-bottom:16px">Monthly new registrations</p>
          <apx-chart
            [series]="growthChart.series"
            [chart]="growthChart.chart"
            [xaxis]="growthChart.xaxis"
            [colors]="growthChart.colors"
            [stroke]="growthChart.stroke"
            [fill]="growthChart.fill"
            [grid]="growthChart.grid"
          />
        </div>

        <div class="card" style="padding:20px">
          <h3 style="font-size:1rem;font-weight:700;color:var(--color-text-primary);margin-bottom:4px">Revenue by Crop Type</h3>
          <p style="font-size:0.8125rem;color:var(--color-text-muted);margin-bottom:16px">GHS revenue distribution</p>
          <apx-chart
            [series]="cropRevenueChart.series"
            [chart]="cropRevenueChart.chart"
            [labels]="cropRevenueChart.labels"
            [colors]="cropRevenueChart.colors"
            [legend]="cropRevenueChart.legend"
            [plotOptions]="cropRevenueChart.plotOptions"
            [stroke]="cropRevenueChart.stroke"
          />
        </div>

        <div class="card" style="padding:20px">
          <h3 style="font-size:1rem;font-weight:700;color:var(--color-text-primary);margin-bottom:4px">Agent Performance</h3>
          <p style="font-size:0.8125rem;color:var(--color-text-muted);margin-bottom:16px">Produce collected per agent (top 10)</p>
          <apx-chart
            [series]="agentChart.series"
            [chart]="agentChart.chart"
            [xaxis]="agentChart.xaxis"
            [colors]="agentChart.colors"
            [plotOptions]="agentChart.plotOptions"
            [grid]="agentChart.grid"
          />
        </div>

      </div>

      <!-- Wide chart -->
      <div class="card" style="padding:20px">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:16px">
          <div>
            <h3 style="font-size:1rem;font-weight:700;color:var(--color-text-primary)">Annual Collection Heatmap</h3>
            <p style="font-size:0.8125rem;color:var(--color-text-muted)">Daily collection volume across all LBCs (tonnes)</p>
          </div>
          <div style="background:rgba(26,122,74,0.1);border-radius:8px;padding:6px 12px;font-size:0.8125rem;color:var(--color-primary);font-weight:600">
            🤖 AI Forecast Ready
          </div>
        </div>
        <apx-chart
          [series]="heatmapChart.series"
          [chart]="heatmapChart.chart"
          [xaxis]="heatmapChart.xaxis"
          [colors]="heatmapChart.colors"
          [dataLabels]="heatmapChart.dataLabels"
          [plotOptions]="heatmapChart.plotOptions"
        />
      </div>

    </div>
  `
})
export class AnalyticsComponent {

  readonly barChart = {
    series: [{ name: 'Produce (t)', data: MOCK_REGION_DATA.map(r => r.produce) }],
    chart: { type: 'bar' as const, height: 220, toolbar: { show: false }, fontFamily: 'Inter, sans-serif', background: 'transparent' },
    xaxis: { categories: MOCK_REGION_DATA.map(r => r.region), labels: { style: { fontSize: '11px', colors: '#64748b' } } },
    colors: ['#1a7a4a'],
    plotOptions: { bar: { borderRadius: 6, distributed: true } },
    grid: { borderColor: '#f1f5f9' },
    dataLabels: { enabled: false },
  };

  readonly growthChart = {
    series: [{ name: 'New Farmers', data: [820, 940, 780, 1020, 1180, 1090, 1340] }],
    chart: { type: 'area' as const, height: 220, toolbar: { show: false }, fontFamily: 'Inter, sans-serif', background: 'transparent' },
    xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'], labels: { style: { fontSize: '11px', colors: '#64748b' } } },
    colors: ['#7c3aed'],
    stroke: { curve: 'smooth' as const, width: 2 },
    fill: { type: 'gradient', gradient: { opacityFrom: 0.3, opacityTo: 0.02 } },
    grid: { borderColor: '#f1f5f9' },
  };

  readonly cropRevenueChart = {
    series: [48, 22, 18, 8, 4],
    chart: { type: 'donut' as const, height: 260, fontFamily: 'Inter, sans-serif', background: 'transparent' },
    labels: ['Cocoa', 'Coffee', 'Cashew', 'Shea', 'Others'],
    colors: ['#1a7a4a', '#0284c7', '#f59e0b', '#7c3aed', '#94a3b8'],
    legend: { position: 'bottom' as const, fontSize: '12px' },
    plotOptions: { pie: { donut: { size: '65%' } } },
    stroke: { width: 0 },
  };

  readonly agentChart = {
    series: [{ name: 'Produce (t)', data: [48, 42, 38, 36, 34, 31, 28, 26, 24, 21] }],
    chart: { type: 'bar' as const, height: 220, toolbar: { show: false }, fontFamily: 'Inter, sans-serif', background: 'transparent' },
    xaxis: { categories: ['Kofi A.', 'Ama M.', 'Kwame B.', 'Efua D.', 'Yaw O.', 'Abena K.', 'Kojo F.', 'Adwoa N.', 'Ekow T.', 'Akosua P.'], labels: { style: { fontSize: '11px' } } },
    colors: ['#0284c7'],
    plotOptions: { bar: { borderRadius: 4, horizontal: false } },
    grid: { borderColor: '#f1f5f9' },
  };

  readonly heatmapChart = {
    series: [
      { name: 'Mon', data: Array.from({ length: 24 }, () => ({ x: Math.random() * 50 + 10, y: Math.floor(Math.random() * 8 + 1) })) },
      { name: 'Tue', data: Array.from({ length: 24 }, () => ({ x: Math.random() * 60 + 10, y: Math.floor(Math.random() * 8 + 1) })) },
      { name: 'Wed', data: Array.from({ length: 24 }, () => ({ x: Math.random() * 55 + 5, y: Math.floor(Math.random() * 8 + 1) })) },
      { name: 'Thu', data: Array.from({ length: 24 }, () => ({ x: Math.random() * 70 + 15, y: Math.floor(Math.random() * 8 + 1) })) },
      { name: 'Fri', data: Array.from({ length: 24 }, () => ({ x: Math.random() * 80 + 20, y: Math.floor(Math.random() * 8 + 1) })) },
    ],
    chart: { type: 'heatmap' as const, height: 200, toolbar: { show: false }, fontFamily: 'Inter, sans-serif', background: 'transparent' },
    xaxis: { labels: { show: false } },
    colors: ['#1a7a4a'],
    dataLabels: { enabled: false },
    plotOptions: { heatmap: { radius: 4, enableShades: true, shadeIntensity: 0.5 } },
  };
}
