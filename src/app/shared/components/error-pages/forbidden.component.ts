import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="error-page">
      <div class="error-content animate-scale-in">
        <div class="error-emoji">🔒</div>
        <h1 class="error-code">403</h1>
        <h2 class="error-title">Access Denied</h2>
        <p class="error-desc">You don't have permission to access this area. Contact your system administrator to request access.</p>
        <a routerLink="/dashboard" class="btn btn-primary">
          <span class="material-symbols-rounded">home</span>
          Back to Dashboard
        </a>
      </div>
    </div>
  `,
  styles: [`
    .error-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--color-bg); }
    .error-content { text-align: center; padding: 32px; }
    .error-emoji { font-size: 64px; margin-bottom: 16px; }
    .error-code { font-size: 6rem; font-weight: 900; color: #dc2626; letter-spacing: -0.05em; line-height: 1; }
    .error-title { font-size: 1.5rem; font-weight: 700; color: var(--color-text-primary); margin: 8px 0; }
    .error-desc { color: var(--color-text-secondary); margin-bottom: 24px; max-width: 360px; margin-left: auto; margin-right: auto; }
  `]
})
export class ForbiddenComponent {}
