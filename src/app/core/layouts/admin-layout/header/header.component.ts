import { Component, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppStore } from '../../../state/app.store';
import { ThemeService } from '../../../services/theme.service';
import { AuthService } from '../../../authentication/auth.service';
import { NotificationBellComponent } from '../../../../features/notifications/presentation/components/notification-bell/notification-bell.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, NotificationBellComponent],
  template: `
    <header class="header">
      <div class="header__left">
        <button class="header-btn" (click)="store.toggleSidebar()" title="Toggle Sidebar">
          <span class="material-symbols-rounded">menu</span>
        </button>

        <!-- Global Search -->
        <div class="search-box" [class.focused]="searchFocused()">
          <span class="material-symbols-rounded search-icon">search</span>
          <input
            type="text"
            class="search-input"
            placeholder="Search everything…"
            [(ngModel)]="searchQuery"
            (focus)="searchFocused.set(true)"
            (blur)="searchFocused.set(false)"
          />
          <kbd class="search-kbd">⌘K</kbd>
        </div>
      </div>

      <div class="header__right">
        <!-- Theme Toggle -->
        <button class="header-btn" (click)="themeService.toggle()" [title]="store.theme() === 'dark' ? 'Light Mode' : 'Dark Mode'">
          <span class="material-symbols-rounded">
            {{ store.theme() === 'dark' ? 'light_mode' : 'dark_mode' }}
          </span>
        </button>

        <!-- Notifications -->
        <app-notification-bell />

        <!-- Help -->
        <button class="header-btn" title="Help & Support">
          <span class="material-symbols-rounded">help_outline</span>
        </button>

        <!-- User Menu -->
        <div class="user-menu" [class.open]="userMenuOpen()">
          <button class="user-menu__trigger" (click)="toggleUserMenu()">
            <img
              [src]="'https://api.dicebear.com/7.x/avataaars/svg?seed=' + store.user()?.firstName"
              [alt]="store.userFullName()"
              class="user-avatar"
            />
            <div class="user-info">
              <span class="user-name">{{ store.userFullName() }}</span>
              <span class="user-role">{{ formatRole(store.user()?.role) }}</span>
            </div>
            <span class="material-symbols-rounded chevron">expand_more</span>
          </button>

          @if (userMenuOpen()) {
            <div class="user-menu__dropdown animate-scale-in">
              <div class="dropdown-header">
                <strong>{{ store.userFullName() }}</strong>
                <span>{{ store.user()?.email }}</span>
              </div>
              <div class="dropdown-divider"></div>
              <a routerLink="/profile" class="dropdown-item" (click)="closeUserMenu()">
                <span class="material-symbols-rounded">person</span> My Profile
              </a>
              <a routerLink="/settings" class="dropdown-item" (click)="closeUserMenu()">
                <span class="material-symbols-rounded">settings</span> Settings
              </a>
              <div class="dropdown-divider"></div>
              <button class="dropdown-item danger" (click)="logout()">
                <span class="material-symbols-rounded">logout</span> Sign Out
              </button>
            </div>
          }
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      height: var(--header-height);
      background: var(--color-surface);
      border-bottom: 1px solid var(--color-border-light);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px 0 24px;
      position: sticky;
      top: 0;
      z-index: 100;
      gap: 16px;
    }

    .header__left, .header__right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .header-btn {
      width: 36px; height: 36px;
      border-radius: 8px;
      border: none;
      background: transparent;
      color: var(--color-text-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-fast);
      flex-shrink: 0;
      position: relative;

      span { font-size: 20px; }

      &:hover { background: var(--color-surface-2); color: var(--color-text-primary); }
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--color-surface-2);
      border: 1px solid var(--color-border-light);
      border-radius: 10px;
      padding: 6px 12px;
      width: 280px;
      transition: all var(--transition-fast);

      &.focused {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px rgba(26, 122, 74, 0.1);
        background: var(--color-surface);
      }

      @media (max-width: 768px) { width: 160px; }
    }

    .search-icon { font-size: 16px; color: var(--color-text-muted); flex-shrink: 0; }

    .search-input {
      flex: 1;
      border: none;
      background: transparent;
      outline: none;
      font-size: 0.875rem;
      color: var(--color-text-primary);
      font-family: inherit;

      &::placeholder { color: var(--color-text-muted); }
    }

    .search-kbd {
      font-size: 0.6875rem;
      color: var(--color-text-muted);
      background: var(--color-border-light);
      border-radius: 4px;
      padding: 1px 5px;
      font-family: inherit;
      border: 1px solid var(--color-border);
      white-space: nowrap;
    }

    .user-menu {
      position: relative;

      &__trigger {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 8px 4px 4px;
        border: 1px solid transparent;
        border-radius: 10px;
        cursor: pointer;
        background: transparent;
        transition: all var(--transition-fast);

        &:hover, .open & {
          background: var(--color-surface-2);
          border-color: var(--color-border-light);
        }
      }

      &__dropdown {
        position: absolute;
        right: 0;
        top: calc(100% + 8px);
        width: 220px;
        background: var(--color-surface);
        border: 1px solid var(--color-border-light);
        border-radius: 12px;
        box-shadow: var(--shadow-xl);
        overflow: hidden;
        z-index: 200;
      }
    }

    .user-avatar { width: 32px; height: 32px; border-radius: 8px; }
    .user-name { font-size: 0.8125rem; font-weight: 600; color: var(--color-text-primary); display: block; }
    .user-role { font-size: 0.6875rem; color: var(--color-text-muted); display: block; }
    .user-info { text-align: left; }
    .chevron { font-size: 16px; color: var(--color-text-muted); transition: transform var(--transition-fast); .open & { transform: rotate(180deg); } }

    .dropdown-header {
      padding: 12px 16px;
      strong { font-size: 0.875rem; color: var(--color-text-primary); display: block; }
      span { font-size: 0.75rem; color: var(--color-text-muted); }
    }

    .dropdown-divider { height: 1px; background: var(--color-border-light); margin: 2px 0; }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 16px;
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      cursor: pointer;
      width: 100%;
      border: none;
      background: transparent;
      text-decoration: none;
      font-family: inherit;
      transition: background var(--transition-fast);

      span { font-size: 18px; }

      &:hover { background: var(--color-surface-2); color: var(--color-text-primary); }
      &.danger { color: var(--color-error); &:hover { background: #fee2e2; } }
    }
  `]
})
export class HeaderComponent {
  readonly store = inject(AppStore);
  readonly themeService = inject(ThemeService);
  readonly authService = inject(AuthService);

  searchQuery = '';
  readonly searchFocused = signal(false);
  readonly userMenuOpen = signal(false);

  @HostListener('document:keydown', ['$event'])
  onKeydown(e: KeyboardEvent): void {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      this.store.openCommandPalette();
    }
    if (e.key === 'Escape') {
      this.closeUserMenu();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    if (!target.closest('.user-menu')) {
      this.closeUserMenu();
    }
  }

  toggleUserMenu(): void {
    this.userMenuOpen.update(v => !v);
  }

  closeUserMenu(): void {
    this.userMenuOpen.set(false);
  }

  logout(): void {
    this.closeUserMenu();
    this.authService.logout();
  }

  formatRole(role?: string): string {
    return role?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) ?? '';
  }
}
