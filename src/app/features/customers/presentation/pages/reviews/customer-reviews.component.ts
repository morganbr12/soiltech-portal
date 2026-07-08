import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { DataTableComponent, Column, TableAction } from '../../../../../shared/components/data-table/data-table.component';
import { CustomerStore } from '../../../store/customer.store';
import { CustomerReview, ReviewStatus } from '../../../domain/customer.model';

type ReviewRow = CustomerReview & Record<string, unknown>;

@Component({
  selector: 'app-customer-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent, DataTableComponent],
  template: `
    <div class="page-container">
      <app-page-header
        title="Customer Reviews"
        subtitle="Moderate and manage buyer feedback and ratings"
        icon="star"
        [badge]="store.reviewSummary().pending"
        [breadcrumbs]="[{ label: 'Home', url: '/dashboard' }, { label: 'Customers', url: '/customers' }, { label: 'Reviews' }]"
      >
        <button class="btn btn-ghost btn-sm" (click)="bulkApprove()">
          <span class="material-symbols-rounded">done_all</span> Approve All Pending
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

      <!-- Rating Breakdown -->
      <div class="rating-breakdown">
        <div class="rating-summary">
          <div class="rating-big">{{ avgRating() }}</div>
          <div class="rating-stars">
            @for (s of starRange; track s) {
              <span class="material-symbols-rounded" style="color:#f59e0b;font-size:24px;font-variation-settings:'FILL' 1">star</span>
            }
          </div>
          <div class="rating-total">Based on {{ store.reviews().length }} reviews</div>
        </div>
        <div class="rating-bars">
          @for (r of ratingDist(); track r.star) {
            <div class="rating-bar-row">
              <span class="rating-bar-star">{{ r.star }} ★</span>
              <div class="rating-bar-wrap">
                <div class="rating-bar-fill" [style.width.%]="r.pct" [style.background]="r.color"></div>
              </div>
              <span class="rating-bar-count">{{ r.count }}</span>
            </div>
          }
        </div>
      </div>

      <!-- Filters -->
      <div class="filter-bar">
        <div class="filter-tabs">
          @for (tab of statusTabs(); track tab.value) {
            <button class="filter-tab" [class.active]="activeStatus() === tab.value" (click)="setStatus(tab.value)">
              {{ tab.label }} <span class="tab-count">{{ tab.count }}</span>
            </button>
          }
        </div>
        <div class="filter-right">
          <select class="filter-select" [(ngModel)]="typeFilter" (change)="doFilter()">
            <option value="">All Target Types</option>
            <option value="agent">Agent</option>
            <option value="driver">Driver</option>
            <option value="warehouse">Warehouse</option>
            <option value="produce">Produce</option>
            <option value="lbc">LBC</option>
          </select>
          <select class="filter-select" [(ngModel)]="regionFilter" (change)="doFilter()">
            <option value="">All Regions</option>
            @for (r of regions(); track r) { <option [value]="r">{{ r }}</option> }
          </select>
        </div>
      </div>

      <app-data-table
        [data]="filteredReviews()"
        [columns]="columns"
        [actions]="actions"
        [loading]="store.isLoadingReviews()"
        [selectable]="true"
        [searchable]="true"
        searchPlaceholder="Search reviews by customer, comment, target..."
      >
        <div bulk-actions>
          <button class="btn btn-ghost btn-sm" (click)="bulkApprove()">Approve Selected</button>
          <button class="btn btn-ghost btn-sm">Flag Selected</button>
        </div>
      </app-data-table>
    </div>
  `,
  styles: [`
    .quick-stats { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; margin-bottom: 20px; }
    .quick-stat { background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: var(--radius-md); padding: 14px; display: flex; align-items: center; gap: 12px; }
    .qs-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; span { font-size: 20px; font-variation-settings: 'FILL' 1; } }
    .qs-value { font-size: 1.375rem; font-weight: 700; color: var(--color-text-primary); line-height: 1; }
    .qs-label { font-size: 0.75rem; color: var(--color-text-muted); margin-top: 2px; }

    .rating-breakdown { display: flex; gap: 24px; background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: var(--radius-lg); padding: 20px; margin-bottom: 20px; align-items: center; }
    .rating-summary { text-align: center; flex-shrink: 0; }
    .rating-big { font-size: 3rem; font-weight: 800; color: var(--color-text-primary); line-height: 1; }
    .rating-stars { display: flex; justify-content: center; margin: 6px 0; }
    .rating-total { font-size: 0.75rem; color: var(--color-text-muted); }
    .rating-bars { flex: 1; display: flex; flex-direction: column; gap: 8px; }
    .rating-bar-row { display: flex; align-items: center; gap: 10px; font-size: 0.8125rem; }
    .rating-bar-star { width: 32px; color: var(--color-text-secondary); text-align: right; flex-shrink: 0; }
    .rating-bar-wrap { flex: 1; height: 8px; background: var(--color-border-light); border-radius: 99px; overflow: hidden; }
    .rating-bar-fill { height: 100%; border-radius: 99px; transition: width 0.5s ease; }
    .rating-bar-count { width: 28px; text-align: right; font-weight: 600; color: var(--color-text-primary); }

    .filter-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; gap: 12px; flex-wrap: wrap; }
    .filter-tabs { display: flex; gap: 4px; background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: 10px; padding: 4px; }
    .filter-tab { display: flex; align-items: center; gap: 6px; padding: 6px 14px; border: none; border-radius: 7px; cursor: pointer; background: transparent; font-size: 0.875rem; font-weight: 500; color: var(--color-text-secondary); transition: all var(--transition-fast); font-family: inherit; &.active { background: var(--color-primary); color: white; .tab-count { background: rgba(255,255,255,0.25); color: white; } } }
    .tab-count { background: var(--color-border-light); color: var(--color-text-muted); font-size: 0.6875rem; font-weight: 700; padding: 1px 6px; border-radius: 99px; }
    .filter-right { display: flex; gap: 8px; }
    .filter-select { border: 1px solid var(--color-border); border-radius: 8px; padding: 7px 12px; font-size: 0.875rem; background: var(--color-surface); color: var(--color-text-primary); cursor: pointer; }
  `]
})
export class CustomerReviewsComponent implements OnInit {
  protected readonly store = inject(CustomerStore);

  readonly activeStatus = signal('all');
  typeFilter = '';
  regionFilter = '';

  readonly starRange = [1, 2, 3, 4, 5];

  readonly regions = computed(() =>
    [...new Set(this.store.reviews().map(r => r.region))].sort()
  );

  readonly avgRating = computed(() => {
    const reviews = this.store.reviews();
    if (!reviews.length) return this.store.reviewSummary().avgRating.toFixed(1);
    return (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
  });

  readonly ratingDist = computed(() => {
    const reviews = this.store.reviews();
    const total = reviews.length || 1;
    const colors: Record<number, string> = { 5: '#16a34a', 4: '#65a30d', 3: '#f59e0b', 2: '#ea580c', 1: '#dc2626' };
    return [5, 4, 3, 2, 1].map(star => {
      const count = reviews.filter(r => r.rating === star).length;
      return { star, count, pct: Math.round(count / total * 100), color: colors[star] };
    });
  });

  readonly stats = computed(() => {
    const s = this.store.reviewSummary();
    return [
      { label: 'Total Reviews', value: s.total, icon: 'reviews', color: '#1a7a4a', bg: 'rgba(26,122,74,0.1)' },
      { label: 'Approved', value: s.approved, icon: 'thumb_up', color: '#16a34a', bg: 'rgba(22,163,74,0.1)' },
      { label: 'Pending', value: s.pending, icon: 'pending', color: '#d97706', bg: 'rgba(217,119,6,0.1)' },
      { label: 'Flagged', value: s.flagged, icon: 'flag', color: '#ea580c', bg: 'rgba(234,88,12,0.1)' },
      { label: 'Avg Rating', value: this.avgRating() + ' ★', icon: 'star', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    ];
  });

  readonly statusTabs = computed(() => {
    const s = this.store.reviewSummary();
    return [
      { label: 'All', value: 'all', count: s.total },
      { label: 'Pending', value: ReviewStatus.PENDING, count: s.pending },
      { label: 'Approved', value: ReviewStatus.APPROVED, count: s.approved },
      { label: 'Flagged', value: ReviewStatus.FLAGGED, count: s.flagged },
      { label: 'Rejected', value: ReviewStatus.REJECTED, count: s.rejected },
    ];
  });

  readonly filteredReviews = computed(() => {
    let data = this.store.reviews() as ReviewRow[];
    if (this.activeStatus() !== 'all') data = data.filter(r => r.status === this.activeStatus());
    if (this.typeFilter) data = data.filter(r => r.targetType === this.typeFilter);
    if (this.regionFilter) data = data.filter(r => r.region === this.regionFilter);
    return data;
  });

  readonly columns: Column<ReviewRow>[] = [
    { key: 'id', label: 'Review ID', width: '110px' },
    { key: 'customerName', label: 'Customer', type: 'avatar', sortable: true },
    { key: 'targetType', label: 'Target Type', sortable: true },
    { key: 'targetName', label: 'Target' },
    { key: 'rating', label: 'Rating', align: 'center', format: (v) => `${'★'.repeat(Number(v))}${'☆'.repeat(5 - Number(v))}`, sortable: true },
    { key: 'comment', label: 'Comment' },
    { key: 'region', label: 'Region', sortable: true },
    { key: 'status', label: 'Status', type: 'status',
      statusMap: {
        [ReviewStatus.APPROVED]: { label: 'Approved', class: 'badge--success' },
        [ReviewStatus.PENDING]: { label: 'Pending', class: 'badge--warning' },
        [ReviewStatus.FLAGGED]: { label: 'Flagged', class: 'badge--error' },
        [ReviewStatus.REJECTED]: { label: 'Rejected', class: 'badge--neutral' },
      }
    },
    { key: 'createdAt', label: 'Date', type: 'date', sortable: true },
  ];

  readonly actions: TableAction<ReviewRow>[] = [
    { label: 'Approve', icon: 'thumb_up',
      condition: (r) => r.status === ReviewStatus.PENDING || r.status === ReviewStatus.FLAGGED,
      handler: (r) => this.approve(r) },
    { label: 'Flag', icon: 'flag', color: '#ea580c',
      condition: (r) => r.status === ReviewStatus.APPROVED,
      handler: (r) => this.flag(r) },
    { label: 'Delete', icon: 'delete', color: '#dc2626', handler: (r) => this.deleteReview(r) },
  ];

  ngOnInit(): void {
    this.store.loadReviews({});
  }

  setStatus(s: string): void { this.activeStatus.set(s); }
  doFilter(): void {}

  bulkApprove(): void {
    const pending = this.store.reviews().filter(r => r.status === ReviewStatus.PENDING);
    pending.forEach(r => this.store.approveReview(r.id, { onSuccess: () => {}, onError: (e) => console.error(e) }));
  }

  approve(r: ReviewRow): void {
    this.store.approveReview(r.id, { onSuccess: () => {}, onError: (e) => console.error(e) });
  }

  flag(r: ReviewRow): void {
    this.store.flagReview(r.id, { onSuccess: () => {}, onError: (e) => console.error(e) });
  }

  deleteReview(r: ReviewRow): void {
    this.store.deleteReview(r.id, { onSuccess: () => {}, onError: (e) => console.error(e) });
  }
}
