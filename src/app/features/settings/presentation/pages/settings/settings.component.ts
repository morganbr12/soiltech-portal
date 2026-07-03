import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { ThemeService } from '../../../../../core/services/theme.service';
import { inject } from '@angular/core';
import { AppStore } from '../../../../../core/state/app.store';

interface SettingsTab {
  id: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  template: `
    <div class="page-container">
      <app-page-header
        title="Settings"
        subtitle="Configure system settings, roles, regions, and notification templates"
        icon="settings"
        [breadcrumbs]="[{ label: 'Home', url: '/dashboard' }, { label: 'Settings' }]"
      />

      <div class="settings-layout">
        <!-- Sidebar tabs -->
        <div class="settings-nav">
          @for (tab of tabs; track tab.id) {
            <button class="settings-tab" [class.active]="activeTab() === tab.id" (click)="activeTab.set(tab.id)">
              <span class="material-symbols-rounded">{{ tab.icon }}</span>
              {{ tab.label }}
            </button>
          }
        </div>

        <!-- Content -->
        <div class="settings-content">
          @switch (activeTab()) {
            @case ('general') {
              <div class="settings-section">
                <h3>General Settings</h3>
                <div class="settings-group">
                  <label class="form-label">Portal Name</label>
                  <input type="text" class="settings-input" value="SoilTech Portal" />
                </div>
                <div class="settings-group">
                  <label class="form-label">Default Currency</label>
                  <select class="settings-input">
                    <option>GHS (₵) — Ghana Cedi</option>
                    <option>USD ($)</option>
                  </select>
                </div>
                <div class="settings-group">
                  <label class="form-label">Timezone</label>
                  <select class="settings-input">
                    <option>Africa/Accra (GMT+0)</option>
                  </select>
                </div>
                <div class="settings-group">
                  <label class="settings-toggle-label">
                    <div>
                      <span>Dark Mode</span>
                      <span class="settings-desc">Switch between light and dark interface</span>
                    </div>
                    <div class="toggle" [class.on]="store.theme() === 'dark'" (click)="themeService.toggle()">
                      <div class="toggle-knob"></div>
                    </div>
                  </label>
                </div>
                <div class="settings-group">
                  <label class="settings-toggle-label">
                    <div>
                      <span>Email Notifications</span>
                      <span class="settings-desc">Receive alerts and reports via email</span>
                    </div>
                    <div class="toggle on"><div class="toggle-knob"></div></div>
                  </label>
                </div>
                <button class="btn btn-primary btn-sm" style="margin-top:8px">Save Changes</button>
              </div>
            }

            @case ('roles') {
              <div class="settings-section">
                <h3>Roles & Permissions</h3>
                <p style="color:var(--color-text-secondary);font-size:0.875rem;margin-bottom:20px">Configure what each role can access in the portal.</p>
                <div class="role-grid">
                  @for (role of roleList; track role.name) {
                    <div class="role-card">
                      <div class="role-header">
                        <div class="role-icon">
                          <span class="material-symbols-rounded">{{ role.icon }}</span>
                        </div>
                        <div>
                          <div class="role-name">{{ role.name }}</div>
                          <div class="role-count">{{ role.users }} users</div>
                        </div>
                      </div>
                      <div class="role-perms">{{ role.desc }}</div>
                      <button class="btn btn-secondary btn-sm" style="margin-top:12px;width:100%">Configure</button>
                    </div>
                  }
                </div>
              </div>
            }

            @case ('regions') {
              <div class="settings-section">
                <h3>Regions & Districts</h3>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
                  @for (region of regions; track region) {
                    <div style="display:flex;align-items:center;justify-content:space-between;padding:12px;border:1px solid var(--color-border-light);border-radius:10px;background:var(--color-surface-2)">
                      <div style="display:flex;align-items:center;gap:8px">
                        <span style="width:8px;height:8px;border-radius:50%;background:var(--color-primary)"></span>
                        <span style="font-size:0.875rem;font-weight:500">{{ region }}</span>
                      </div>
                      <button class="btn btn-ghost btn-sm">
                        <span class="material-symbols-rounded" style="font-size:16px">edit</span>
                      </button>
                    </div>
                  }
                </div>
              </div>
            }

            @case ('crops') {
              <div class="settings-section">
                <h3>Crop Types & Pricing</h3>
                <div class="pricing-table">
                  <div class="pricing-header">
                    <span>Crop</span><span>Grade A</span><span>Grade B</span><span>Grade C</span><span>Actions</span>
                  </div>
                  @for (crop of cropPricing; track crop.name) {
                    <div class="pricing-row">
                      <span style="font-weight:600">{{ crop.name }}</span>
                      <span style="color:var(--color-primary);font-weight:600">₵{{ crop.gradeA }}/kg</span>
                      <span style="color:var(--color-text-secondary)">₵{{ crop.gradeB }}/kg</span>
                      <span style="color:var(--color-text-muted)">₵{{ crop.gradeC }}/kg</span>
                      <button class="btn btn-ghost btn-sm">Edit</button>
                    </div>
                  }
                </div>
              </div>
            }

            @default {
              <div class="settings-section">
                <h3>Coming Soon</h3>
                <p style="color:var(--color-text-muted)">This settings section is under development.</p>
              </div>
            }
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-layout { display: flex; gap: 24px; }

    .settings-nav {
      width: 220px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .settings-tab {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      background: transparent;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--color-text-secondary);
      font-family: inherit;
      transition: all var(--transition-fast);
      text-align: left;

      span { font-size: 18px; }

      &:hover { background: var(--color-surface-2); color: var(--color-text-primary); }
      &.active { background: rgba(26,122,74,0.1); color: var(--color-primary); font-weight: 600; }
    }

    .settings-content {
      flex: 1;
      background: var(--color-surface);
      border: 1px solid var(--color-border-light);
      border-radius: var(--radius-lg);
      padding: 24px;
    }

    .settings-section h3 { font-size: 1.125rem; font-weight: 700; color: var(--color-text-primary); margin-bottom: 20px; }

    .settings-group { margin-bottom: 20px; }
    .settings-input {
      width: 100%; padding: 10px 12px;
      border: 1.5px solid var(--color-border);
      border-radius: 8px; font-size: 0.9375rem;
      background: var(--color-surface); color: var(--color-text-primary); font-family: inherit;
      &:focus { outline: none; border-color: var(--color-primary); }
    }

    .settings-toggle-label {
      display: flex; align-items: center; justify-content: space-between;
      cursor: pointer; padding: 12px 0;
      border-bottom: 1px solid var(--color-border-light);

      span:first-child { display: block; font-size: 0.9375rem; font-weight: 500; color: var(--color-text-primary); }
    }

    .settings-desc { font-size: 0.8125rem; color: var(--color-text-muted); display: block; margin-top: 2px; }

    .toggle {
      width: 44px; height: 24px;
      background: var(--color-border);
      border-radius: 99px;
      position: relative;
      transition: background var(--transition-fast);
      flex-shrink: 0;

      &.on { background: var(--color-primary); }
    }

    .toggle-knob {
      position: absolute; top: 2px; left: 2px;
      width: 20px; height: 20px; border-radius: 50%; background: white;
      transition: transform var(--transition-fast);
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      .on & { transform: translateX(20px); }
    }

    .role-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; }

    .role-card {
      padding: 16px;
      border: 1px solid var(--color-border-light);
      border-radius: 12px;
      background: var(--color-surface-2);
    }

    .role-header { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
    .role-icon { width: 36px; height: 36px; background: rgba(26,122,74,0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; span { font-size: 18px; color: var(--color-primary); } }
    .role-name { font-weight: 600; font-size: 0.9375rem; color: var(--color-text-primary); }
    .role-count { font-size: 0.75rem; color: var(--color-text-muted); }
    .role-perms { font-size: 0.8125rem; color: var(--color-text-secondary); line-height: 1.4; }

    .pricing-table { border: 1px solid var(--color-border-light); border-radius: 10px; overflow: hidden; }
    .pricing-header, .pricing-row {
      display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
      gap: 12px; padding: 10px 16px; align-items: center;
    }
    .pricing-header { background: var(--color-surface-2); font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
    .pricing-row { border-top: 1px solid var(--color-border-light); font-size: 0.875rem; }
  `]
})
export class SettingsComponent {
  readonly themeService = inject(ThemeService);
  readonly store = inject(AppStore);

  readonly activeTab = signal('general');

  readonly tabs: SettingsTab[] = [
    { id: 'general', label: 'General', icon: 'settings' },
    { id: 'roles', label: 'Roles & Permissions', icon: 'security' },
    { id: 'regions', label: 'Regions', icon: 'map' },
    { id: 'crops', label: 'Crops & Pricing', icon: 'eco' },
    { id: 'notifications', label: 'Notifications', icon: 'notifications' },
    { id: 'integrations', label: 'Integrations', icon: 'integration_instructions' },
    { id: 'system', label: 'System Config', icon: 'dns' },
  ];

  readonly regions = [
    'Greater Accra', 'Ashanti', 'Western', 'Eastern', 'Central',
    'Northern', 'Upper East', 'Upper West', 'Volta', 'Brong-Ahafo',
    'Western North', 'Bono', 'Bono East', 'Ahafo', 'Savannah', 'North East', 'Oti',
  ];

  readonly roleList = [
    { name: 'Super Admin', icon: 'admin_panel_settings', users: 3, desc: 'Full system access — all modules and settings' },
    { name: 'Operations Manager', icon: 'manage_accounts', users: 8, desc: 'Manage LBCs, agents, produce and logistics' },
    { name: 'Finance Manager', icon: 'account_balance', users: 5, desc: 'Payments, wallets, reports and financial analytics' },
    { name: 'Warehouse Manager', icon: 'warehouse', users: 12, desc: 'Warehouse operations, inventory and stock reports' },
    { name: 'Logistics Manager', icon: 'local_shipping', users: 6, desc: 'Fleet, drivers, routes and delivery management' },
    { name: 'QA Officer', icon: 'verified', users: 9, desc: 'Produce quality inspection and compliance' },
    { name: 'Auditor', icon: 'history', users: 4, desc: 'Read-only audit logs and compliance reports' },
    { name: 'Analyst', icon: 'analytics', users: 7, desc: 'Dashboard and analytics — read only access' },
  ];

  readonly cropPricing = [
    { name: 'Cocoa', gradeA: '8.50', gradeB: '7.20', gradeC: '5.80' },
    { name: 'Coffee', gradeA: '12.00', gradeB: '10.50', gradeC: '8.00' },
    { name: 'Cashew', gradeA: '6.75', gradeB: '5.50', gradeC: '4.20' },
    { name: 'Shea', gradeA: '5.20', gradeB: '4.10', gradeC: '3.00' },
    { name: 'Maize', gradeA: '2.80', gradeB: '2.20', gradeC: '1.60' },
  ];
}
