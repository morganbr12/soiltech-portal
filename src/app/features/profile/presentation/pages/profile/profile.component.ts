import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppStore } from '../../../../../core/state/app.store';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { ROLE_LABELS } from '../../../../../core/enums/roles.enum';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  template: `
    <div class="page-container">
      <app-page-header
        title="My Profile"
        subtitle="Manage your account information and security settings"
        icon="person"
        [breadcrumbs]="[{ label: 'Home', url: '/dashboard' }, { label: 'Profile' }]"
      />

      <div style="display:grid;grid-template-columns:280px 1fr;gap:20px;align-items:start">

        <!-- Profile card -->
        <div class="card" style="padding:24px;text-align:center">
          <div style="position:relative;width:80px;height:80px;margin:0 auto 16px">
            <img
              [src]="'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user()?.firstName"
              [alt]="store.userFullName()"
              style="width:80px;height:80px;border-radius:20px;border:3px solid rgba(26,122,74,0.2)"
            />
            <button style="position:absolute;bottom:-4px;right:-4px;width:26px;height:26px;background:var(--color-primary);color:white;border:2px solid var(--color-surface);border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center">
              <span class="material-symbols-rounded" style="font-size:14px">edit</span>
            </button>
          </div>
          <h2 style="font-size:1.125rem;font-weight:700;color:var(--color-text-primary)">{{ store.userFullName() }}</h2>
          <p style="font-size:0.8125rem;color:var(--color-text-muted);margin-top:4px">{{ user()?.email }}</p>
          <div style="margin:12px auto 0;display:inline-block">
            <span class="badge badge--primary">{{ formatRole(user()?.role) }}</span>
          </div>

          <div style="margin-top:20px;padding-top:20px;border-top:1px solid var(--color-border-light);text-align:left">
            @for (info of profileMeta; track info.label) {
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
                <span class="material-symbols-rounded" style="font-size:16px;color:var(--color-text-muted)">{{ info.icon }}</span>
                <div>
                  <div style="font-size:0.6875rem;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:0.05em">{{ info.label }}</div>
                  <div style="font-size:0.875rem;color:var(--color-text-primary);font-weight:500">{{ info.value }}</div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Edit form -->
        <div style="display:flex;flex-direction:column;gap:16px">
          <div class="card" style="padding:24px">
            <h3 style="font-size:1rem;font-weight:700;color:var(--color-text-primary);margin-bottom:20px">Personal Information</h3>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
              <div class="form-group">
                <label class="form-label">First Name</label>
                <input type="text" class="settings-input" [value]="user()?.firstName" style="width:100%;padding:10px 12px;border:1.5px solid var(--color-border);border-radius:8px;background:var(--color-surface);font-size:0.9375rem;color:var(--color-text-primary);font-family:inherit;outline:none">
              </div>
              <div class="form-group">
                <label class="form-label">Last Name</label>
                <input type="text" class="settings-input" [value]="user()?.lastName" style="width:100%;padding:10px 12px;border:1.5px solid var(--color-border);border-radius:8px;background:var(--color-surface);font-size:0.9375rem;color:var(--color-text-primary);font-family:inherit;outline:none">
              </div>
              <div class="form-group">
                <label class="form-label">Email Address</label>
                <input type="email" class="settings-input" [value]="user()?.email" style="width:100%;padding:10px 12px;border:1.5px solid var(--color-border);border-radius:8px;background:var(--color-surface);font-size:0.9375rem;color:var(--color-text-primary);font-family:inherit;outline:none">
              </div>
              <div class="form-group">
                <label class="form-label">Phone Number</label>
                <input type="tel" class="settings-input" [value]="user()?.phone" style="width:100%;padding:10px 12px;border:1.5px solid var(--color-border);border-radius:8px;background:var(--color-surface);font-size:0.9375rem;color:var(--color-text-primary);font-family:inherit;outline:none">
              </div>
            </div>
            <button class="btn btn-primary btn-sm" style="margin-top:8px">Save Changes</button>
          </div>

          <div class="card" style="padding:24px">
            <h3 style="font-size:1rem;font-weight:700;color:var(--color-text-primary);margin-bottom:20px">Change Password</h3>
            <div style="display:flex;flex-direction:column;gap:14px;max-width:400px">
              <div class="form-group">
                <label class="form-label">Current Password</label>
                <input type="password" placeholder="••••••••" style="width:100%;padding:10px 12px;border:1.5px solid var(--color-border);border-radius:8px;background:var(--color-surface);font-size:0.9375rem;color:var(--color-text-primary);font-family:inherit;outline:none">
              </div>
              <div class="form-group">
                <label class="form-label">New Password</label>
                <input type="password" placeholder="Min. 8 characters" style="width:100%;padding:10px 12px;border:1.5px solid var(--color-border);border-radius:8px;background:var(--color-surface);font-size:0.9375rem;color:var(--color-text-primary);font-family:inherit;outline:none">
              </div>
              <div class="form-group">
                <label class="form-label">Confirm New Password</label>
                <input type="password" placeholder="••••••••" style="width:100%;padding:10px 12px;border:1.5px solid var(--color-border);border-radius:8px;background:var(--color-surface);font-size:0.9375rem;color:var(--color-text-primary);font-family:inherit;outline:none">
              </div>
            </div>
            <button class="btn btn-secondary btn-sm" style="margin-top:8px">Update Password</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent {
  readonly store = inject(AppStore);
  readonly user = this.store.user;

  get profileMeta() {
    const u = this.user();
    return [
      { label: 'Region', icon: 'location_on', value: u?.region ?? '—' },
      { label: 'Phone', icon: 'phone', value: u?.phone ?? '—' },
      { label: 'Joined', icon: 'calendar_today', value: u ? new Date(u.createdAt).toLocaleDateString('en-GH', { day: '2-digit', month: 'short', year: 'numeric' }) : '—' },
      { label: 'Last Login', icon: 'login', value: u?.lastLogin ? new Date(u.lastLogin).toLocaleDateString('en-GH') : '—' },
    ];
  }

  formatRole(role?: string): string {
    return role ? ROLE_LABELS[role as keyof typeof ROLE_LABELS] ?? role : '';
  }
}
