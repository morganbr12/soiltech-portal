import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AppStore } from '../../state/app.store';
import { ThemeService } from '../../services/theme.service';
import { SidebarComponent } from './sidebar/sidebar.component';
import { HeaderComponent } from './header/header.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent],
  template: `
    <div class="admin-layout" [class.sidebar-collapsed]="store.sidebarCollapsed()">
      <app-sidebar />

      <div class="admin-layout__main">
        <app-header />

        <main class="admin-layout__content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    .admin-layout {
      display: flex;
      height: 100vh;
      overflow: hidden;
      background: var(--color-bg);

      &__main {
        flex: 1;
        margin-left: var(--sidebar-width);
        transition: margin-left var(--transition-base);
        min-width: 0;
        display: flex;
        flex-direction: column;
        height: 100vh;
        overflow-y: auto;
      }

      &.sidebar-collapsed &__main {
        margin-left: var(--sidebar-collapsed);
      }

      &__content {
        flex: 1;
        overflow: visible;
        animation: fadeIn 0.2s ease;
      }
    }

    @media (max-width: 768px) {
      .admin-layout {
        &__main { margin-left: 0; }
        &.sidebar-collapsed &__main { margin-left: 0; }
      }
    }
  `]
})
export class AdminLayoutComponent implements OnInit {
  readonly store = inject(AppStore);
  private readonly themeService = inject(ThemeService);

  ngOnInit(): void {
    this.themeService.init();
  }
}
