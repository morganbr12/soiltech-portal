import { Component, inject, output, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { UserRole, ROLE_LABELS } from '../../../../../core/enums/roles.enum';
import { PortalUser } from '../../../domain/user.model';
import { LbcService } from '../../../../../features/lbc/services/lbc.service';
import { Lbc } from '../../../../../features/lbc/domain/lbc.model';
import { GHANA_REGIONS } from '../../../../../core/constants/app.constants';

@Component({
  selector: 'app-add-user-drawer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="backdrop" (click)="closed.emit()">
      <aside class="drawer" (click)="$event.stopPropagation()" role="dialog" aria-modal="true" aria-labelledby="add-user-title">

        <!-- Header -->
        <div class="drawer-header">
          <div class="drawer-title-group">
            <div class="drawer-icon">
              <span class="material-symbols-rounded">person_add</span>
            </div>
            <div>
              <h2 class="drawer-title" id="add-user-title">Add User</h2>
              <p class="drawer-sub">Create a new portal account</p>
            </div>
          </div>
          <button class="close-btn" (click)="closed.emit()" aria-label="Close">
            <span class="material-symbols-rounded">close</span>
          </button>
        </div>

        <!-- Body -->
        <div class="drawer-body">
          <form [formGroup]="form" (ngSubmit)="submit()" id="add-user-form">

            <div class="form-group">
              <label class="form-label">Full Name <span class="required">*</span></label>
              <input class="form-input" formControlName="fullName" placeholder="e.g. Kwame Asante" [class.invalid]="touched('fullName')" />
              @if (touched('fullName')) { <span class="form-error">Required</span> }
            </div>

            <div class="form-group">
              <label class="form-label">Email Address <span class="required">*</span></label>
              <input class="form-input" type="email" formControlName="email" placeholder="user@soiltech.com" [class.invalid]="touched('email')" />
              @if (touched('email')) { <span class="form-error">Valid email required</span> }
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Role <span class="required">*</span></label>
                <select class="form-input" formControlName="adminRole" [class.invalid]="touched('adminRole')">
                  <option value="">Select a role…</option>
                  @for (entry of roleOptions; track entry.value) {
                    <option [value]="entry.value">{{ entry.label }}</option>
                  }
                </select>
                @if (touched('adminRole')) { <span class="form-error">Required</span> }
              </div>
              <div class="form-group">
                <label class="form-label">Region <span class="optional">(optional)</span></label>
                <select class="form-input" formControlName="region">
                  <option value="">Select region…</option>
                  @for (r of regions; track r) {
                    <option [value]="r">{{ r }}</option>
                  }
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">
                LBC
                @if (isLbcManager) { <span class="required">*</span> }
                @else { <span class="optional">(optional)</span> }
              </label>
              <select class="form-input" formControlName="lbcId" [disabled]="lbcsLoading()" [class.invalid]="touched('lbcId')">
                <option value="">{{ lbcsLoading() ? 'Loading LBCs…' : 'Select LBC…' }}</option>
                @for (lbc of lbcs(); track lbc.id) {
                  <option [value]="lbc.id">{{ lbc.name }} — {{ lbc.region }}</option>
                }
              </select>
              @if (touched('lbcId')) { <span class="form-error">Required for LBC Manager</span> }
            </div>

            <div class="form-group">
              <label class="form-label">Phone <span class="optional">(optional)</span></label>
              <input class="form-input" type="tel" formControlName="phone" placeholder="+233 XX XXX XXXX" />
            </div>

            <div class="form-group">
              <label class="form-label">Password <span class="required">*</span></label>
              <div class="input-with-action">
                <input class="form-input" [type]="showPassword() ? 'text' : 'password'" formControlName="password" placeholder="Min. 8 characters" [class.invalid]="touched('password')" />
                <button type="button" class="eye-btn" (click)="togglePassword()" tabindex="-1">
                  <span class="material-symbols-rounded">{{ showPassword() ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
              @if (touched('password')) { <span class="form-error">Min. 8 characters required</span> }
              <button type="button" class="generate-btn" (click)="generatePassword()">
                <span class="material-symbols-rounded">auto_fix_high</span> Generate strong password
              </button>
            </div>

          </form>
        </div>

        <!-- Footer -->
        <div class="drawer-footer">
          <button class="btn btn-primary" type="submit" form="add-user-form" [disabled]="saving()">
            @if (saving()) {
              <span class="material-symbols-rounded spinning">progress_activity</span> Creating…
            } @else {
              <span class="material-symbols-rounded">person_add</span> Add User
            }
          </button>
          <button class="btn btn-ghost" type="button" (click)="closed.emit()" [disabled]="saving()">Cancel</button>
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
      width: 480px; max-width: 95vw;
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
      padding: 24px;
      display: flex; flex-direction: column; gap: 4px;
    }

    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
    .form-label { font-size: 0.8125rem; font-weight: 600; color: var(--color-text-secondary); }
    .required { color: var(--color-error); }
    .optional { font-weight: 400; color: var(--color-text-muted); }

    .form-input {
      width: 100%; padding: 9px 12px;
      border: 1.5px solid var(--color-border);
      border-radius: 8px;
      font-size: 0.875rem; font-family: inherit;
      background: var(--color-surface);
      color: var(--color-text-primary);
      outline: none; transition: border-color 0.15s;
      box-sizing: border-box;
      &:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(26,122,74,0.1); }
      &.invalid { border-color: var(--color-error); }
      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }
    select.form-input { cursor: pointer; }
    .form-error { font-size: 0.75rem; color: var(--color-error); }

    .input-with-action { position: relative; display: flex; align-items: center; }
    .input-with-action .form-input { padding-right: 40px; }
    .eye-btn {
      position: absolute; right: 10px;
      background: none; border: none; cursor: pointer; padding: 0;
      color: var(--color-text-muted); display: flex; align-items: center;
      &:hover { color: var(--color-text-primary); }
      span { font-size: 18px; }
    }

    .generate-btn {
      display: inline-flex; align-items: center; gap: 5px;
      font-size: 0.75rem; font-weight: 600;
      color: var(--color-primary);
      background: none; border: none; cursor: pointer;
      padding: 4px 0; font-family: inherit;
      &:hover { text-decoration: underline; }
      span { font-size: 14px; }
    }

    .drawer-footer {
      padding: 16px 24px;
      border-top: 1px solid var(--color-border-light);
      display: flex; gap: 8px; align-items: center;
      flex-shrink: 0;
    }
    .btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 9px 18px; border-radius: 8px; border: none;
      font-size: 0.875rem; font-weight: 600; cursor: pointer;
      font-family: inherit; transition: opacity 0.15s;
      span { font-size: 18px; font-variation-settings: 'FILL' 1; }
      &:hover:not(:disabled) { opacity: 0.85; }
      &:disabled { opacity: 0.55; cursor: not-allowed; }
    }
    .btn-primary { background: var(--color-primary); color: white; }
    .btn-ghost {
      background: var(--color-bg-subtle); color: var(--color-text-secondary);
      border: 1px solid var(--color-border-light);
    }

    @keyframes spin { to { transform: rotate(360deg); } }
    .spinning { animation: spin 0.8s linear infinite; }
  `],
})
export class AddUserDrawerComponent implements OnInit {
  private readonly svc    = inject(UserService);
  private readonly lbcSvc = inject(LbcService);
  private readonly fb     = inject(FormBuilder);

  readonly closed  = output<void>();
  readonly created = output<PortalUser>();

  readonly saving      = signal(false);
  readonly showPassword = signal(false);
  readonly lbcs        = signal<Lbc[]>([]);
  readonly lbcsLoading = signal(false);

  readonly regions     = GHANA_REGIONS;
  readonly roleOptions = Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label }));

  readonly form = this.fb.nonNullable.group({
    fullName:  ['', Validators.required],
    email:     ['', [Validators.required, Validators.email]],
    adminRole: ['', Validators.required],
    region:    [''],
    lbcId:     [''],
    phone:     [''],
    password:  ['', [Validators.required, Validators.minLength(8)]],
  });

  get isLbcManager(): boolean {
    return this.form.get('adminRole')?.value === UserRole.LBC_MANAGER;
  }

  ngOnInit(): void {
    this.lbcsLoading.set(true);
    this.lbcSvc.list({ limit: 200 }).subscribe({
      next: res => { this.lbcs.set(res.data); this.lbcsLoading.set(false); },
      error: ()  => this.lbcsLoading.set(false),
    });

    // Toggle lbcId required based on role
    this.form.get('adminRole')!.valueChanges.subscribe(role => {
      const lbcCtrl = this.form.get('lbcId')!;
      if (role === UserRole.LBC_MANAGER) {
        lbcCtrl.setValidators(Validators.required);
      } else {
        lbcCtrl.clearValidators();
        lbcCtrl.setValue('');
      }
      lbcCtrl.updateValueAndValidity();
    });
  }

  togglePassword(): void { this.showPassword.set(!this.showPassword()); }

  touched(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c.touched);
  }

  generatePassword(): void {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$!';
    const pwd = Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    this.form.get('password')!.setValue(pwd);
    this.showPassword.set(true);
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.saving.set(true);
    const { fullName, email, adminRole, region, lbcId, phone, password } = this.form.getRawValue();

    this.svc.create({
      fullName, email, password,
      adminRole: adminRole as UserRole,
      region:    region    || undefined,
      lbcId:     lbcId     || undefined,
      phone:     phone     || undefined,
    }).subscribe({
      next: user => {
        this.saving.set(false);
        this.created.emit(user);
      },
      error: () => this.saving.set(false),
    });
  }
}
