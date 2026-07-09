import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProduceStore } from '../../../store/produce.store';
import { ProduceListing, ProduceStatus } from '../../../domain/produce.model';

@Component({
  selector: 'app-view-produce-drawer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="backdrop" (click)="closed.emit()">
      <aside class="drawer" (click)="$event.stopPropagation()" role="dialog" aria-modal="true" aria-labelledby="produce-drawer-title">

        <!-- Header -->
        <div class="drawer-header">
          <div class="drawer-title-group">
            <div class="drawer-icon">
              <span class="material-symbols-rounded">eco</span>
            </div>
            <div>
              <h2 class="drawer-title" id="produce-drawer-title">Produce Details</h2>
              <p class="drawer-sub">{{ listing().cropType }}{{ listing().cropVariety ? ' · ' + listing().cropVariety : '' }}</p>
            </div>
          </div>
          <button class="close-btn" (click)="closed.emit()" aria-label="Close">
            <span class="material-symbols-rounded">close</span>
          </button>
        </div>

        <!-- Body -->
        <div class="drawer-body">

          <!-- Status + Grade -->
          <div class="top-row">
            <span class="badge" [ngClass]="statusClass(listing().status)">
              <span class="material-symbols-rounded badge-icon">{{ statusIcon(listing().status) }}</span>
              {{ statusLabel(listing().status) }}
            </span>
            <span class="grade-chip">Grade {{ listing().grade }}</span>
          </div>

          <!-- Quantities -->
          <div class="card-grid">
            <div class="info-card highlight">
              <span class="card-label">Total Quantity</span>
              <span class="card-value">{{ listing().totalQuantityKg | number:'1.0-1' }} <small>kg</small></span>
            </div>
            <div class="info-card">
              <span class="card-label">Available</span>
              <span class="card-value avail">{{ listing().availableQuantityKg | number:'1.0-1' }} <small>kg</small></span>
            </div>
            <div class="info-card">
              <span class="card-label">Price / kg</span>
              <span class="card-value price">GHS {{ listing().pricePerKg | number:'1.2-2' }}</span>
            </div>
            <div class="info-card">
              <span class="card-label">Est. Value</span>
              <span class="card-value">GHS {{ (listing().totalQuantityKg * listing().pricePerKg) | number:'1.0-0' }}</span>
            </div>
          </div>

          <!-- People -->
          <div class="section">
            <div class="section-title">Parties</div>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Farmer</span>
                <span class="detail-value">{{ listing().farmerName }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Agent</span>
                <span class="detail-value">{{ listing().agentName }}</span>
              </div>
              <div class="detail-item full">
                <span class="detail-label">LBC</span>
                <span class="detail-value">{{ listing().lbcName }}</span>
              </div>
            </div>
          </div>

          <!-- Location -->
          <div class="section">
            <div class="section-title">Location</div>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Region</span>
                <span class="detail-value">{{ listing().region }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">District</span>
                <span class="detail-value">{{ listing().district || '—' }}</span>
              </div>
            </div>
          </div>

          <!-- Photos -->
          @if (listing().photos.length) {
            <div class="section">
              <div class="section-title">Photos</div>
              <div class="photos-grid">
                @for (photo of listing().photos; track photo) {
                  <div class="photo-thumb" (click)="openPhoto(photo)">
                    <img [src]="photo" [alt]="listing().cropType" loading="lazy">
                    <div class="photo-overlay"><span class="material-symbols-rounded">open_in_full</span></div>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Timeline -->
          <div class="section">
            <div class="section-title">Timeline</div>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Collected</span>
                <span class="detail-value">{{ listing().collectedAt | date:'mediumDate' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Created</span>
                <span class="detail-value">{{ listing().createdAt | date:'mediumDate' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Last Updated</span>
                <span class="detail-value">{{ listing().updatedAt | date:'medium' }}</span>
              </div>
            </div>
          </div>

        </div>

        <!-- Footer -->
        <div class="drawer-footer">
          @if (listing().status === ProduceStatus.PENDING_APPROVAL) {
            <button class="btn btn-success" (click)="approve()" [disabled]="busy()">
              @if (busy() === 'approve') {
                <span class="material-symbols-rounded spinning">progress_activity</span> Approving…
              } @else {
                <span class="material-symbols-rounded">check_circle</span> Approve Listing
              }
            </button>
            <button class="btn btn-danger" (click)="reject()" [disabled]="busy()">
              @if (busy() === 'reject') {
                <span class="material-symbols-rounded spinning">progress_activity</span> Rejecting…
              } @else {
                <span class="material-symbols-rounded">cancel</span> Reject
              }
            </button>
          }
          <button class="btn btn-ghost" (click)="closed.emit()">Close</button>
        </div>

      </aside>
    </div>
  `,
  styles: [`
    .backdrop {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.45);
      z-index: 1000;
      display: flex; justify-content: flex-end;
      animation: fadeIn 0.15s ease;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    .drawer {
      width: 500px; max-width: 95vw;
      height: 100vh;
      background: var(--color-surface);
      display: flex; flex-direction: column;
      box-shadow: -4px 0 24px rgba(0,0,0,0.15);
      animation: slideIn 0.2s ease;
    }
    @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }

    .drawer-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 20px 24px;
      border-bottom: 1px solid var(--color-border-light);
      flex-shrink: 0;
    }
    .drawer-title-group { display: flex; align-items: center; gap: 12px; }
    .drawer-icon {
      width: 42px; height: 42px; border-radius: 10px;
      background: rgba(26,122,74,0.1);
      display: flex; align-items: center; justify-content: center;
      span { font-size: 22px; color: var(--color-primary); font-variation-settings: 'FILL' 1; }
    }
    .drawer-title { font-size: 1.125rem; font-weight: 700; color: var(--color-text-primary); margin: 0; }
    .drawer-sub   { font-size: 0.8125rem; color: var(--color-text-muted); margin: 2px 0 0; }
    .close-btn {
      width: 34px; height: 34px; border-radius: 8px; border: none;
      background: var(--color-bg-subtle); cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      color: var(--color-text-secondary);
      &:hover { background: var(--color-border-light); }
      span { font-size: 18px; }
    }

    .drawer-body {
      flex: 1; overflow-y: auto;
      padding: 20px 24px;
      display: flex; flex-direction: column; gap: 20px;
    }

    /* Status + grade top row */
    .top-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .badge {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 4px 10px; border-radius: 99px;
      font-size: 0.8125rem; font-weight: 600;
    }
    .badge-icon { font-size: 14px; font-variation-settings: 'FILL' 1; }
    .badge--success { background: rgba(22,163,74,0.12); color: #16a34a; }
    .badge--warning { background: rgba(217,119,6,0.12); color: #d97706; }
    .badge--info    { background: rgba(2,132,199,0.12); color: #0284c7; }
    .badge--error   { background: rgba(220,38,38,0.12); color: #dc2626; }
    .badge--neutral { background: var(--color-bg-subtle); color: var(--color-text-muted); }
    .grade-chip {
      padding: 4px 10px; border-radius: 99px; border: 1px solid var(--color-border);
      font-size: 0.8125rem; font-weight: 600; color: var(--color-text-secondary);
    }

    /* Info cards */
    .card-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .info-card {
      background: var(--color-bg-subtle);
      border: 1px solid var(--color-border-light);
      border-radius: 10px; padding: 14px;
      display: flex; flex-direction: column; gap: 4px;
      &.highlight { background: rgba(26,122,74,0.06); border-color: rgba(26,122,74,0.2); }
    }
    .card-label { font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted); font-weight: 600; }
    .card-value {
      font-size: 1.25rem; font-weight: 700; color: var(--color-text-primary);
      small { font-size: 0.75rem; font-weight: 500; color: var(--color-text-muted); }
      &.avail { color: var(--color-primary); }
      &.price  { color: #7c3aed; }
    }

    /* Sections */
    .section { display: flex; flex-direction: column; gap: 10px; }
    .section-title {
      font-size: 0.75rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.06em; color: var(--color-text-muted);
      padding-bottom: 6px;
      border-bottom: 1px solid var(--color-border-light);
    }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .detail-item { display: flex; flex-direction: column; gap: 2px; &.full { grid-column: 1/-1; } }
    .detail-label { font-size: 0.75rem; color: var(--color-text-muted); }
    .detail-value { font-size: 0.875rem; font-weight: 500; color: var(--color-text-primary); }

    /* Photos */
    .photos-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
    .photo-thumb {
      aspect-ratio: 1; border-radius: 8px; overflow: hidden; position: relative; cursor: pointer;
      background: var(--color-bg-subtle);
      img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .photo-overlay {
        position: absolute; inset: 0;
        background: rgba(0,0,0,0); display: flex; align-items: center; justify-content: center;
        transition: background 0.15s;
        span { color: white; font-size: 20px; opacity: 0; transition: opacity 0.15s; }
      }
      &:hover .photo-overlay { background: rgba(0,0,0,0.35); }
      &:hover .photo-overlay span { opacity: 1; }
    }

    /* Footer */
    .drawer-footer {
      padding: 16px 24px;
      border-top: 1px solid var(--color-border-light);
      display: flex; gap: 8px; align-items: center; flex-wrap: wrap;
      flex-shrink: 0;
    }
    .btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 8px 16px; border-radius: 8px; border: none;
      font-size: 0.875rem; font-weight: 600; cursor: pointer;
      font-family: inherit; transition: opacity 0.15s;
      span { font-size: 18px; font-variation-settings: 'FILL' 1; }
      &:hover:not(:disabled) { opacity: 0.85; }
      &:disabled { opacity: 0.55; cursor: not-allowed; }
    }
    .btn-success { background: #16a34a; color: white; }
    .btn-danger  { background: #dc2626; color: white; }
    .btn-ghost {
      background: var(--color-bg-subtle); color: var(--color-text-secondary);
      border: 1px solid var(--color-border-light);
      margin-left: auto;
    }

    @keyframes spin { to { transform: rotate(360deg); } }
    .spinning { animation: spin 0.8s linear infinite; }
  `]
})
export class ViewProduceDrawerComponent {
  private readonly store = inject(ProduceStore);

  readonly listing = input.required<ProduceListing>();

  readonly closed  = output<void>();
  readonly updated = output<void>();

  readonly busy = signal<'approve' | 'reject' | false>(false);

  protected readonly ProduceStatus = ProduceStatus;

  approve(): void {
    this.busy.set('approve');
    this.store.approve(
      this.listing().id,
      () => { this.busy.set(false); this.updated.emit(); this.closed.emit(); },
      () =>   this.busy.set(false),
    );
  }

  reject(): void {
    this.busy.set('reject');
    this.store.reject(
      this.listing().id,
      () => { this.busy.set(false); this.updated.emit(); this.closed.emit(); },
      () =>   this.busy.set(false),
    );
  }

  openPhoto(url: string): void {
    window.open(url, '_blank', 'noopener');
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      PENDING_APPROVAL: 'Pending Review',
      AVAILABLE:        'Available',
      RESERVED:         'Reserved',
      SOLD_OUT:         'Sold Out',
      UNLISTED:         'Unlisted',
    };
    return map[status] ?? status;
  }

  statusIcon(status: string): string {
    const map: Record<string, string> = {
      PENDING_APPROVAL: 'pending',
      AVAILABLE:        'check_circle',
      RESERVED:         'lock',
      SOLD_OUT:         'inventory',
      UNLISTED:         'visibility_off',
    };
    return map[status] ?? 'help';
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      PENDING_APPROVAL: 'badge--warning',
      AVAILABLE:        'badge--success',
      RESERVED:         'badge--info',
      SOLD_OUT:         'badge--error',
      UNLISTED:         'badge--neutral',
    };
    return map[status] ?? 'badge--neutral';
  }
}
