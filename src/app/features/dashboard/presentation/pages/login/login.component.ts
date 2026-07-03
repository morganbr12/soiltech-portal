import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../../core/authentication/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="login-page animate-fade-in">
      <div class="login-header">
        <h2 class="login-title">Welcome back</h2>
        <p class="login-subtitle">Sign in to your SoilTech Portal account</p>
      </div>

      <!-- Demo Credentials -->
      <div class="demo-creds">
        <p class="demo-label">Demo credentials:</p>
        @for (cred of demoCreds; track cred.email) {
          <button class="demo-btn" (click)="fillCred(cred)">
            <strong>{{ cred.role }}</strong> — {{ cred.email }}
          </button>
        }
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="login-form">
        @if (error()) {
          <div class="form-error animate-slide-up">
            <span class="material-symbols-rounded">error</span>
            {{ error() }}
          </div>
        }

        <div class="form-group">
          <label class="form-label">Email Address</label>
          <div class="input-wrapper" [class.error]="isFieldError('email')">
            <span class="input-icon material-symbols-rounded">mail</span>
            <input
              type="email"
              formControlName="email"
              class="form-input"
              placeholder="you@soiltech.com"
              autocomplete="email"
            />
          </div>
          @if (isFieldError('email')) {
            <p class="field-error">Please enter a valid email address</p>
          }
        </div>

        <div class="form-group">
          <div class="label-row">
            <label class="form-label">Password</label>
            <a routerLink="/auth/forgot-password" class="forgot-link">Forgot password?</a>
          </div>
          <div class="input-wrapper" [class.error]="isFieldError('password')">
            <span class="input-icon material-symbols-rounded">lock</span>
            <input
              [type]="showPassword() ? 'text' : 'password'"
              formControlName="password"
              class="form-input"
              placeholder="Enter your password"
              autocomplete="current-password"
            />
            <button type="button" class="input-toggle" (click)="togglePassword()">
              <span class="material-symbols-rounded">{{ showPassword() ? 'visibility_off' : 'visibility' }}</span>
            </button>
          </div>
          @if (isFieldError('password')) {
            <p class="field-error">Password is required</p>
          }
        </div>

        <div class="remember-row">
          <label class="checkbox-label">
            <input type="checkbox" formControlName="rememberMe" />
            <span>Remember me for 30 days</span>
          </label>
        </div>

        <button type="submit" class="submit-btn" [disabled]="loading()">
          @if (loading()) {
            <span class="spinner"></span>
            Signing in…
          } @else {
            <span class="material-symbols-rounded">login</span>
            Sign In
          }
        </button>
      </form>

      <p class="login-footer">
        Need access?
        <a href="mailto:admin@soiltech.com" class="footer-link">Contact your administrator</a>
      </p>
    </div>
  `,
  styles: [`
    .login-page { width: 100%; max-width: 400px; }

    .login-header { margin-bottom: 24px; }
    .login-title { font-size: 1.625rem; font-weight: 800; color: var(--color-text-primary); letter-spacing: -0.03em; }
    .login-subtitle { color: var(--color-text-secondary); font-size: 0.9375rem; margin-top: 4px; }

    .demo-creds {
      background: var(--color-surface-2);
      border: 1px solid var(--color-border-light);
      border-radius: 10px;
      padding: 12px;
      margin-bottom: 24px;
    }

    .demo-label { font-size: 0.75rem; font-weight: 600; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }

    .demo-btn {
      display: block;
      width: 100%;
      text-align: left;
      background: transparent;
      border: none;
      padding: 4px 0;
      font-size: 0.8125rem;
      color: var(--color-primary);
      cursor: pointer;
      font-family: inherit;

      strong { color: var(--color-text-primary); }

      &:hover { text-decoration: underline; }
    }

    .form-error {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #fee2e2;
      color: #dc2626;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 0.875rem;
      margin-bottom: 16px;

      span { font-size: 18px; }
    }

    .form-group { margin-bottom: 18px; }
    .form-label { display: block; font-size: 0.8125rem; font-weight: 600; color: var(--color-text-secondary); margin-bottom: 6px; }
    .label-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
    .forgot-link { font-size: 0.8125rem; color: var(--color-primary); text-decoration: none; &:hover { text-decoration: underline; } }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      background: var(--color-surface);
      border: 1.5px solid var(--color-border);
      border-radius: 10px;
      transition: all var(--transition-fast);

      &:focus-within {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px rgba(26,122,74,0.1);
      }

      &.error { border-color: var(--color-error); }
    }

    .input-icon { font-size: 18px; color: var(--color-text-muted); padding: 0 12px; flex-shrink: 0; }

    .form-input {
      flex: 1;
      border: none;
      background: transparent;
      outline: none;
      padding: 11px 12px 11px 0;
      font-size: 0.9375rem;
      color: var(--color-text-primary);
      font-family: inherit;
      min-width: 0;

      &::placeholder { color: var(--color-text-muted); }
    }

    .input-toggle {
      background: none;
      border: none;
      padding: 0 12px;
      cursor: pointer;
      color: var(--color-text-muted);
      display: flex;
      align-items: center;
      span { font-size: 18px; }
      &:hover { color: var(--color-text-secondary); }
    }

    .field-error { font-size: 0.75rem; color: var(--color-error); margin-top: 4px; }

    .remember-row { margin-bottom: 20px; }
    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-size: 0.875rem;
      color: var(--color-text-secondary);

      input[type=checkbox] { accent-color: var(--color-primary); width: 16px; height: 16px; cursor: pointer; }
    }

    .submit-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px;
      background: var(--color-primary);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 0.9375rem;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      transition: all var(--transition-fast);

      span { font-size: 20px; }

      &:hover:not(:disabled) {
        background: var(--color-primary-dark);
        transform: translateY(-1px);
        box-shadow: 0 6px 20px rgba(26,122,74,0.35);
      }

      &:disabled { opacity: 0.7; cursor: not-allowed; }
    }

    .spinner {
      width: 18px; height: 18px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    .login-footer { text-align: center; margin-top: 24px; font-size: 0.875rem; color: var(--color-text-muted); }
    .footer-link { color: var(--color-primary); text-decoration: none; &:hover { text-decoration: underline; } }
  `]
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly showPassword = signal(false);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    rememberMe: [false],
  });

  readonly demoCreds = [
    { role: 'Super Admin', email: 'admin@soiltech.com', password: 'demo123' },
    { role: 'Ops Manager', email: 'ops@soiltech.com', password: 'demo123' },
    { role: 'Finance Manager', email: 'finance@soiltech.com', password: 'demo123' },
  ];

  fillCred(cred: { email: string; password: string }): void {
    this.form.patchValue({ email: cred.email, password: cred.password });
  }

  isFieldError(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl.touched);
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const { email, password, rememberMe } = this.form.value;

    this.authService.login({ email: email!, password: password!, rememberMe: rememberMe! }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.message ?? 'Invalid email or password. Please try again.');
      },
    });
  }
}
