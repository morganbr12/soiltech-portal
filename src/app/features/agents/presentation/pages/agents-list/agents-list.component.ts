import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { DataTableComponent, Column, TableAction } from '../../../../../shared/components/data-table/data-table.component';
import { MOCK_AGENTS } from '../../../../../shared/data/mock-data';
import { EntityStatus } from '../../../../../core/enums/status.enum';

type Agent = typeof MOCK_AGENTS[number];

@Component({
  selector: 'app-agents-list',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, DataTableComponent],
  template: `
    <div class="page-container">
      <app-page-header
        title="Agent Management"
        subtitle="Track and manage all LBC field agents across regions"
        icon="badge"
        [badge]="agents().length"
        [breadcrumbs]="[{ label: 'Home', url: '/dashboard' }, { label: 'Agents' }]"
      >
        <button class="btn btn-secondary btn-sm">
          <span class="material-symbols-rounded">location_on</span> Map View
        </button>
        <button class="btn btn-primary btn-sm">
          <span class="material-symbols-rounded">add</span> Add Agent
        </button>
      </app-page-header>

      <div class="quick-stats stagger-children" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;margin-bottom:20px">
        @for (s of stats; track s.label) {
          <div class="quick-stat animate-slide-up" style="background:var(--color-surface);border:1px solid var(--color-border-light);border-radius:var(--radius-md);padding:14px;display:flex;align-items:center;gap:12px">
            <div style="width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0" [style.background]="s.bg">
              <span class="material-symbols-rounded" [style.color]="s.color" style="font-size:20px;font-variation-settings:'FILL' 1">{{ s.icon }}</span>
            </div>
            <div>
              <div style="font-size:1.375rem;font-weight:700;color:var(--color-text-primary);line-height:1">{{ s.value }}</div>
              <div style="font-size:0.75rem;color:var(--color-text-muted);margin-top:2px">{{ s.label }}</div>
            </div>
          </div>
        }
      </div>

      <app-data-table
        [data]="agents()"
        [columns]="columns"
        [actions]="actions"
        [loading]="loading()"
        [selectable]="true"
        [searchable]="true"
        searchPlaceholder="Search agents by name, ID, LBC, region..."
      >
        <div toolbar-actions>
          <button class="btn btn-ghost btn-sm">
            <span class="material-symbols-rounded">download</span> Export
          </button>
        </div>
      </app-data-table>
    </div>
  `
})
export class AgentsListComponent implements OnInit {
  readonly agents = signal(MOCK_AGENTS as Agent[]);
  readonly loading = signal(false);

  readonly stats = [
    { label: 'Total Agents', value: MOCK_AGENTS.length, icon: 'badge', color: '#0284c7', bg: 'rgba(2,132,199,0.1)' },
    { label: 'Active', value: MOCK_AGENTS.filter(a => a.status === EntityStatus.ACTIVE).length, icon: 'check_circle', color: '#16a34a', bg: 'rgba(22,163,74,0.1)' },
    { label: 'Inactive', value: MOCK_AGENTS.filter(a => a.status === EntityStatus.INACTIVE).length, icon: 'circle', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
    { label: 'Avg. Farmers', value: Math.round(MOCK_AGENTS.reduce((s, a) => s + a.farmersCount, 0) / MOCK_AGENTS.length), icon: 'groups', color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
  ];

  readonly columns: Column<Agent>[] = [
    { key: 'id', label: 'Agent ID', width: '130px', sortable: true },
    { key: 'fullName', label: 'Name', type: 'avatar', sortable: true },
    { key: 'phone', label: 'Phone' },
    { key: 'lbcName', label: 'LBC', sortable: true },
    { key: 'region', label: 'Region', sortable: true },
    { key: 'farmersCount', label: 'Farmers', align: 'center', sortable: true },
    { key: 'farmsCount', label: 'Farms', align: 'center', sortable: true },
    { key: 'produceCollected', label: 'Produce (t)', align: 'right', sortable: true },
    {
      key: 'status', label: 'Status', type: 'status',
      statusMap: {
        [EntityStatus.ACTIVE]: { label: 'Active', class: 'badge--success' },
        [EntityStatus.INACTIVE]: { label: 'Inactive', class: 'badge--neutral' },
      }
    },
    { key: 'lastSeen', label: 'Last Seen', type: 'date', sortable: true },
  ];

  readonly actions: TableAction<Agent>[] = [
    { label: 'View Profile', icon: 'visibility', handler: (row) => console.log('view', row.id) },
    { label: 'Track Location', icon: 'location_on', color: '#0284c7', handler: (row) => console.log('track', row.id) },
    { label: 'Transfer Agent', icon: 'swap_horiz', handler: (row) => console.log('transfer', row.id) },
  ];

  ngOnInit(): void {
    this.loading.set(true);
    setTimeout(() => this.loading.set(false), 700);
  }
}
