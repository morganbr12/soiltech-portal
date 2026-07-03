import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BreadcrumbItem } from '../../../core/models/api.model';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-header-comp">
      @if (breadcrumbs.length) {
        <nav class="breadcrumb" aria-label="Breadcrumb">
          @for (crumb of breadcrumbs; track crumb.label; let last = $last) {
            @if (crumb.url && !last) {
              <a [routerLink]="crumb.url" class="bc-link">{{ crumb.label }}</a>
              <span class="bc-sep material-symbols-rounded">chevron_right</span>
            } @else {
              <span class="bc-current">{{ crumb.label }}</span>
            }
          }
        </nav>
      }
      <div class="header-main">
        <div class="header-text">
          <div class="title-row">
            @if (icon) {
              <div class="header-icon">
                <span class="material-symbols-rounded">{{ icon }}</span>
              </div>
            }
            <h1 class="page-title">{{ title }}</h1>
            @if (badge != null) {
              <span class="title-badge">{{ badge }}</span>
            }
          </div>
          @if (subtitle) {
            <p class="page-subtitle">{{ subtitle }}</p>
          }
        </div>
        <div class="header-actions">
          <ng-content />
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header-comp { margin-bottom: 24px; }

    .breadcrumb {
      display: flex; align-items: center; gap: 2px;
      font-size: 0.8125rem; color: var(--color-text-muted); margin-bottom: 10px;
    }

    .bc-link { color: var(--color-text-secondary); text-decoration: none; &:hover { color: var(--color-primary); } }
    .bc-sep { font-size: 14px; }
    .bc-current { color: var(--color-text-primary); font-weight: 500; }

    .header-main { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
    .header-text { flex: 1; }

    .title-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 4px; }

    .header-icon {
      width: 40px; height: 40px;
      background: rgba(26,122,74,0.1);
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      span { font-size: 22px; color: var(--color-primary); font-variation-settings: 'FILL' 1; }
    }

    .page-title { font-size: 1.5rem; font-weight: 700; color: var(--color-text-primary); letter-spacing: -0.02em; }
    .page-subtitle { font-size: 0.875rem; color: var(--color-text-secondary); }

    .title-badge {
      background: var(--color-primary);
      color: white;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 2px 10px;
      border-radius: 99px;
    }

    .header-actions { display: flex; gap: 8px; flex-shrink: 0; align-items: center; }
  `]
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() icon = '';
  @Input() badge: number | string | null = null;
  @Input() breadcrumbs: BreadcrumbItem[] = [];
}
