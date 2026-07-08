import { Component, Input, Output, EventEmitter, HostListener, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Column<T = Record<string, unknown>> {
  key: keyof T | string;
  label: string;
  width?: string;
  sortable?: boolean;
  type?: 'text' | 'number' | 'date' | 'status' | 'currency' | 'badge' | 'avatar' | 'actions';
  format?: (value: unknown, row: T) => string;
  statusMap?: Record<string, { label: string; class: string }>;
  align?: 'left' | 'center' | 'right';
}

export interface TableAction<T = Record<string, unknown>> {
  label: string;
  icon: string;
  color?: string;
  condition?: (row: T) => boolean;
  handler: (row: T) => void;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="data-table-wrapper">
      <!-- Toolbar -->
      <div class="table-toolbar">
        <div class="toolbar-left">
          @if (_searchable) {
            <div class="table-search" [class.focused]="searchFocused">
              <span class="material-symbols-rounded">search</span>
              <input
                type="text"
                [placeholder]="_searchPlaceholder"
                [(ngModel)]="searchQuery"
                (input)="onSearch()"
                (focus)="searchFocused = true"
                (blur)="searchFocused = false"
                class="search-field"
              />
              @if (searchQuery) {
                <button (click)="clearSearch()" class="clear-search">
                  <span class="material-symbols-rounded">close</span>
                </button>
              }
            </div>
          }
          @if (selectedRows().length > 0) {
            <div class="bulk-actions animate-fade-in">
              <span class="bulk-count">{{ selectedRows().length }} selected</span>
              <ng-content select="[bulk-actions]" />
            </div>
          }
        </div>
        <div class="toolbar-right">
          <span class="row-count">{{ filteredData().length }} records</span>
          <ng-content select="[toolbar-actions]" />
        </div>
      </div>

      <!-- Table -->
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              @if (_selectable) {
                <th class="th-check">
                  <input type="checkbox" (change)="toggleSelectAll($event)" [checked]="allSelected()" />
                </th>
              }
              @for (col of _columns; track col.key) {
                <th [style.width]="col.width" [class.sortable]="col.sortable" [class.text-center]="col.align === 'center'" [class.text-right]="col.align === 'right'" (click)="col.sortable && sort(colKey(col))">
                  <span>{{ col.label }}</span>
                  @if (col.sortable) {
                    <span class="sort-icon material-symbols-rounded">
                      {{ sortKey() === col.key ? (sortDir() === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more' }}
                    </span>
                  }
                </th>
              }
              @if (_actions.length) {
                <th class="th-actions"></th>
              }
            </tr>
          </thead>
          <tbody>
            @if (_loading) {
              @for (row of skeletonRows; track row) {
                <tr class="skeleton-row">
                  @if (_selectable) { <td><div class="skeleton" style="width:16px;height:16px;border-radius:4px"></div></td> }
                  @for (col of _columns; track col.key) {
                    <td><div class="skeleton" style="width:60%;height:16px"></div></td>
                  }
                  @if (_actions.length) { <td><div class="skeleton" style="width:32px;height:32px;border-radius:8px;margin:0 auto"></div></td> }
                </tr>
              }
            } @else if (pagedData().length === 0) {
              <tr class="empty-row">
                <td [attr.colspan]="_columns.length + (_selectable ? 1 : 0) + (_actions.length ? 1 : 0)">
                  <div class="empty-state">
                    <span class="material-symbols-rounded empty-icon">inbox</span>
                    <p>No records found</p>
                    @if (searchQuery) {
                      <button class="btn btn-ghost btn-sm" (click)="clearSearch()">Clear search</button>
                    }
                  </div>
                </td>
              </tr>
            } @else {
              @for (row of pagedData(); track getRowKey(row)) {
                <tr [class.selected]="isSelected(row)" (click)="onRowClick.emit(row)">
                  @if (_selectable) {
                    <td class="td-check" (click)="$event.stopPropagation()">
                      <input type="checkbox" [checked]="isSelected(row)" (change)="toggleRow(row)" />
                    </td>
                  }
                  @for (col of _columns; track col.key) {
                    <td [class.text-center]="col.align === 'center'" [class.text-right]="col.align === 'right'" [class.td-currency]="col.type === 'currency'">
                      @switch (col.type) {
                        @case ('status') {
                          @if (col.statusMap) {
                            <span class="badge" [class]="col.statusMap[getCellValue(row, colKey(col))]?.class ?? 'badge--neutral'">
                              {{ col.statusMap[getCellValue(row, colKey(col))]?.label ?? getCellValue(row, colKey(col)) }}
                            </span>
                          }
                        }
                        @case ('currency') {
                          <span class="currency-cell">₵{{ formatCurrency(getCellValue(row, colKey(col))) }}</span>
                        }
                        @case ('date') {
                          <span class="date-cell">{{ formatDate(getCellValue(row, colKey(col))) }}</span>
                        }
                        @case ('avatar') {
                          <div class="avatar-cell">
                            <div class="table-avatar">{{ getInitials(getCellValue(row, colKey(col))) }}</div>
                            <span>{{ getCellValue(row, colKey(col)) }}</span>
                          </div>
                        }
                        @default {
                          {{ col.format ? col.format(getCell(row, colKey(col)), row) : getCellValue(row, colKey(col)) }}
                        }
                      }
                    </td>
                  }
                  @if (_actions.length) {
                    <td class="td-actions" (click)="$event.stopPropagation()">
                      <div class="menu-wrapper">
                        <button class="menu-trigger" [class.active]="openMenuKey() === getRowKey(row)" (click)="toggleMenu(getRowKey(row), $event)" title="Actions">
                          <span class="dots"><span></span><span></span><span></span></span>
                        </button>
                        @if (openMenuKey() === getRowKey(row)) {
                          <div class="action-dropdown"
                            [style.top.px]="menuPosition().top"
                            [style.right.px]="menuPosition().right">
                            @for (action of _actions; track action.label; let last = $last) {
                              @if (!action.condition || action.condition(row)) {
                                @if (action.color) {
                                  <div class="dropdown-divider"></div>
                                }
                                <button class="dropdown-item" [class.dropdown-item--danger]="!!action.color" (click)="runAction(action, row)">
                                  <span class="material-symbols-rounded">{{ action.icon }}</span>
                                  {{ action.label }}
                                </button>
                              }
                            }
                          </div>
                        }
                      </div>
                    </td>
                  }
                </tr>
              }
            }
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      @if (!_loading && filteredData().length > _pageSize) {
        <div class="table-pagination">
          <div class="pagination-info">
            Showing {{ (currentPage() - 1) * _pageSize + 1 }}–{{ min(currentPage() * _pageSize, filteredData().length) }} of {{ filteredData().length }}
          </div>
          <div class="pagination-controls">
            <button class="page-btn" [disabled]="currentPage() === 1" (click)="goToPage(currentPage() - 1)">
              <span class="material-symbols-rounded">chevron_left</span>
            </button>
            @for (page of pageNumbers(); track page) {
              <button class="page-btn" [class.active]="page === currentPage()" (click)="goToPage(page)">{{ page }}</button>
            }
            <button class="page-btn" [disabled]="currentPage() === totalPages()" (click)="goToPage(currentPage() + 1)">
              <span class="material-symbols-rounded">chevron_right</span>
            </button>
          </div>
          <div class="pagination-size">
            <select [(ngModel)]="pageSizeValue" (change)="onPageSizeChange()">
              <option [ngValue]="10">10 / page</option>
              <option [ngValue]="25">25 / page</option>
              <option [ngValue]="50">50 / page</option>
            </select>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .data-table-wrapper { background: var(--color-surface); border-radius: var(--radius-lg); border: 1px solid var(--color-border-light); overflow: hidden; }
    .table-toolbar { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid var(--color-border-light); gap: 12px; flex-wrap: wrap; }
    .toolbar-left, .toolbar-right { display: flex; align-items: center; gap: 10px; }
    .table-search {
      display: flex; align-items: center; gap: 8px; background: var(--color-surface-2);
      border: 1px solid var(--color-border-light); border-radius: 8px; padding: 6px 10px;
      span { font-size: 16px; color: var(--color-text-muted); }
      &.focused { border-color: var(--color-primary); background: var(--color-surface); }
    }
    .search-field { border: none; background: transparent; outline: none; font-size: 0.875rem; color: var(--color-text-primary); font-family: inherit; width: 200px; &::placeholder { color: var(--color-text-muted); } }
    .clear-search { background: none; border: none; cursor: pointer; padding: 0; span { font-size: 16px; color: var(--color-text-muted); } }
    .row-count { font-size: 0.8125rem; color: var(--color-text-muted); }
    .bulk-count { font-size: 0.8125rem; font-weight: 600; color: var(--color-primary); }
    .table-scroll { overflow-x: auto; }
    .data-table {
      width: 100%; border-collapse: collapse; font-size: 0.875rem;
      thead tr { background: var(--color-surface-2); }
      th {
        padding: 11px 14px; text-align: left; font-size: 0.75rem; font-weight: 700;
        color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em;
        white-space: nowrap; border-bottom: 1px solid var(--color-border-light);
        &.sortable { cursor: pointer; user-select: none; &:hover { color: var(--color-text-primary); } }
      }
      td { padding: 13px 14px; color: var(--color-text-primary); border-bottom: 1px solid var(--color-border-light); vertical-align: middle; }
      tr:last-child td { border-bottom: none; }
      tr:hover td { background: rgba(26,122,74,0.03); }
      tr.selected td { background: rgba(26,122,74,0.06); }
    }
    .sort-icon { font-size: 14px; vertical-align: middle; margin-left: 4px; }
    .th-check, .td-check { width: 40px; }
    .th-actions, .td-actions { width: 52px; text-align: center; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .currency-cell { font-weight: 600; color: var(--color-primary); }
    .date-cell { color: var(--color-text-secondary); white-space: nowrap; }
    .avatar-cell { display: flex; align-items: center; gap: 10px; font-weight: 500; }
    .table-avatar {
      width: 32px; height: 32px; border-radius: 8px;
      background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
      color: white; font-size: 0.75rem; font-weight: 700;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .menu-wrapper { position: relative; display: inline-flex; justify-content: center; }
    .menu-trigger {
      width: 32px; height: 32px; border-radius: 8px; border: none; background: transparent;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: background var(--transition-fast);
      &:hover, &.active { background: var(--color-border-light); }
    }
    .dots {
      display: flex; flex-direction: column; align-items: center; gap: 3.5px; pointer-events: none;
      span {
        display: block; width: 4px; height: 4px; border-radius: 50%;
        background: var(--color-text-muted); transition: background var(--transition-fast);
      }
    }
    .menu-trigger:hover .dots span,
    .menu-trigger.active .dots span { background: var(--color-text-primary); }
    .action-dropdown {
      position: fixed;
      top: 0;
      right: 0;
      min-width: 168px;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-xl);
      z-index: 200;
      overflow: hidden;
      animation: dropdown-in 120ms cubic-bezier(0.16, 1, 0.3, 1);
      padding: 4px;
    }
    @keyframes dropdown-in {
      from { opacity: 0; transform: translateY(-6px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    .dropdown-divider { height: 1px; background: var(--color-border-light); margin: 4px 0; }
    .dropdown-item {
      display: flex; align-items: center; gap: 10px;
      width: 100%; padding: 9px 12px;
      border: none; background: transparent; cursor: pointer;
      font-size: 0.875rem; font-family: inherit; font-weight: 500;
      color: var(--color-text-primary);
      text-align: left; border-radius: 8px;
      transition: background var(--transition-fast);
      span { font-size: 17px; font-variation-settings: 'FILL' 0; flex-shrink: 0; color: var(--color-text-muted); }
      &:hover { background: var(--color-surface-2); }
      &--danger { color: var(--color-error); span { color: var(--color-error); } &:hover { background: rgba(220,38,38,0.06); } }
    }
    .empty-row td { padding: 48px; }
    .empty-state { display: flex; flex-direction: column; align-items: center; gap: 8px; color: var(--color-text-muted); }
    .empty-icon { font-size: 40px; }
    .skeleton-row td { border-bottom: 1px solid var(--color-border-light); padding: 13px 14px; }
    .table-pagination { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-top: 1px solid var(--color-border-light); flex-wrap: wrap; gap: 12px; }
    .pagination-info { font-size: 0.8125rem; color: var(--color-text-muted); }
    .pagination-controls { display: flex; gap: 4px; align-items: center; }
    .page-btn {
      min-width: 32px; height: 32px; border-radius: 6px; border: 1px solid var(--color-border-light);
      background: var(--color-surface); cursor: pointer; font-size: 0.8125rem; color: var(--color-text-secondary);
      display: flex; align-items: center; justify-content: center; padding: 0 6px; transition: all var(--transition-fast);
      span { font-size: 16px; }
      &:hover:not(:disabled) { border-color: var(--color-primary); color: var(--color-primary); background: rgba(26,122,74,0.05); }
      &.active { background: var(--color-primary); color: white; border-color: var(--color-primary); font-weight: 600; }
      &:disabled { opacity: 0.4; cursor: not-allowed; }
    }
    .pagination-size select { border: 1px solid var(--color-border-light); border-radius: 6px; padding: 4px 8px; font-size: 0.8125rem; background: var(--color-surface); color: var(--color-text-primary); cursor: pointer; }
  `]
})
export class DataTableComponent<T extends Record<string, unknown>> {
  readonly skeletonRows = [1, 2, 3, 4, 5];

  @Input() set data(v: T[]) { this._dataArr.set(v); }
  @Input() set columns(v: Column<T>[]) { this._columns = v; }
  @Input() set actions(v: TableAction<T>[]) { this._actions = v; }
  @Input() set loading(v: boolean) { this._loading = v; }
  @Input() set selectable(v: boolean) { this._selectable = v; }
  @Input() set searchable(v: boolean) { this._searchable = v; }
  @Input() set searchPlaceholder(v: string) { this._searchPlaceholder = v; }
  @Input() set rowKey(v: string) { this._rowKey = v; }

  @Output() onRowClick = new EventEmitter<T>();
  @Output() onSelectionChange = new EventEmitter<T[]>();

  private readonly _dataArr = signal<T[]>([]);
  _columns: Column<T>[] = [];
  _actions: TableAction<T>[] = [];
  _loading = false;
  _selectable = false;
  _searchable = true;
  _searchPlaceholder = 'Search...';
  _rowKey = 'id';
  _pageSize = 25;

  searchQuery = '';
  searchFocused = false;
  pageSizeValue = 25;

  readonly sortKey = signal('');
  readonly sortDir = signal<'asc' | 'desc'>('asc');
  readonly currentPage = signal(1);
  readonly selectedRows = signal<T[]>([]);
  readonly openMenuKey = signal('');
  readonly menuPosition = signal({ top: 0, right: 0 });

  readonly filteredData = computed(() => {
    let result = [...this._dataArr()];
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(row =>
        Object.values(row).some(v => String(v).toLowerCase().includes(q))
      );
    }
    const key = this.sortKey();
    if (key) {
      const dir = this.sortDir() === 'asc' ? 1 : -1;
      result.sort((a, b) => {
        const av = a[key] as string | number;
        const bv = b[key] as string | number;
        return av < bv ? -dir : av > bv ? dir : 0;
      });
    }
    return result;
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filteredData().length / this._pageSize)));

  readonly pagedData = computed(() => {
    const start = (this.currentPage() - 1) * this._pageSize;
    return this.filteredData().slice(start, start + this._pageSize);
  });

  readonly pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  });

  readonly allSelected = computed(() =>
    this.pagedData().length > 0 &&
    this.pagedData().every(r => this.isSelected(r))
  );

  min(a: number, b: number): number { return Math.min(a, b); }

  toggleMenu(key: string, e: MouseEvent): void {
    e.stopPropagation();
    if (this.openMenuKey() === key) {
      this.openMenuKey.set('');
      return;
    }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    this.menuPosition.set({ top: rect.bottom + 6, right: window.innerWidth - rect.right });
    this.openMenuKey.set(key);
  }

  runAction(action: TableAction<T>, row: T): void {
    this.openMenuKey.set('');
    action.handler(row);
  }

  @HostListener('document:click')
  closeMenu(): void {
    this.openMenuKey.set('');
  }

  onSearch(): void { this.currentPage.set(1); }
  clearSearch(): void { this.searchQuery = ''; this.currentPage.set(1); }

  sort(key: string): void {
    if (this.sortKey() === key) {
      this.sortDir.update(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortKey.set(key);
      this.sortDir.set('asc');
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) this.currentPage.set(page);
  }

  onPageSizeChange(): void {
    this._pageSize = +this.pageSizeValue;
    this.currentPage.set(1);
  }

  isSelected(row: T): boolean {
    return this.selectedRows().some(r => r[this._rowKey] === row[this._rowKey]);
  }

  toggleRow(row: T): void {
    this.selectedRows.update(rows =>
      this.isSelected(row)
        ? rows.filter(r => r[this._rowKey] !== row[this._rowKey])
        : [...rows, row]
    );
    this.onSelectionChange.emit(this.selectedRows());
  }

  toggleSelectAll(e: Event): void {
    const checked = (e.target as HTMLInputElement).checked;
    this.selectedRows.update(rows => {
      if (checked) {
        const newRows = this.pagedData().filter(r => !this.isSelected(r));
        return [...rows, ...newRows];
      }
      return rows.filter(r => !this.pagedData().some(p => p[this._rowKey] === r[this._rowKey]));
    });
  }

  colKey(col: Column<T>): string {
    return String(col.key);
  }

  getCell(row: T, key: string): unknown {
    return (row as Record<string, unknown>)[key];
  }

  getCellValue(row: T, key: string): string {
    const val = (row as Record<string, unknown>)[key];
    return val != null ? String(val) : '';
  }

  getRowKey(row: T): string {
    return String(row[this._rowKey]);
  }

  formatDate(val: string): string {
    if (!val || val === 'null' || val === 'undefined') return '—';
    try {
      return new Date(val).toLocaleDateString('en-GH', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return '—'; }
  }

  formatCurrency(val: string): string {
    const n = parseFloat(val);
    return isNaN(n) ? '0.00' : n.toLocaleString('en-GH', { minimumFractionDigits: 2 });
  }

  getInitials(name: string): string {
    return name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() ?? '?';
  }
}
