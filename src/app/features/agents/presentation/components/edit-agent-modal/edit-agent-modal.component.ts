import { Component, inject, input, output, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AgentStore } from '../../../store/agent.store';
import { Agent, CreateAgentRequest } from '../../../domain/agent.model';

const GHANA_REGIONS = [
  'Greater Accra', 'Ashanti', 'Western', 'Eastern', 'Central',
  'Northern', 'Upper East', 'Upper West', 'Volta', 'Oti',
  'Ahafo', 'Bono East', 'North East', 'Savannah', 'Western North', 'Bono',
];

@Component({
  selector: 'app-edit-agent-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="backdrop" (click)="onBackdropClick($event)">
      <aside class="drawer" (click)="$event.stopPropagation()" role="dialog" aria-modal="true" aria-labelledby="edit-agent-title">

        <div class="drawer-header">
          <div class="drawer-title-group">
            <div class="drawer-icon">
              <span class="material-symbols-rounded">edit</span>
            </div>
            <div>
              <h2 class="drawer-title" id="edit-agent-title">Edit Agent</h2>
              <p class="drawer-subtitle">{{ agent().fullName }}</p>
            </div>
          </div>
          <button class="close-btn" (click)="closed.emit()" aria-label="Close">
            <span class="material-symbols-rounded">close</span>
          </button>
        </div>

        <form class="drawer-body" [formGroup]="form" (ngSubmit)="onSubmit()">

          <div class="field-row">
            <div class="field-group">
              <label class="field-label required" for="ea-firstName">First Name</label>
              <input id="ea-firstName" class="field-input" type="text" formControlName="firstName"
                [class.invalid]="invalid('firstName')">
              @if (invalid('firstName')) { <span class="field-error">First name is required</span> }
            </div>
            <div class="field-group">
              <label class="field-label required" for="ea-lastName">Last Name</label>
              <input id="ea-lastName" class="field-input" type="text" formControlName="lastName"
                [class.invalid]="invalid('lastName')">
              @if (invalid('lastName')) { <span class="field-error">Last name is required</span> }
            </div>
          </div>

          <div class="field-row">
            <div class="field-group">
              <label class="field-label required" for="ea-phone">Phone</label>
              <input id="ea-phone" class="field-input" type="tel" formControlName="phone"
                [class.invalid]="invalid('phone')">
              @if (invalid('phone')) { <span class="field-error">Phone is required</span> }
            </div>
            <div class="field-group">
              <label class="field-label required" for="ea-email">Email</label>
              <input id="ea-email" class="field-input" type="email" formControlName="email"
                [class.invalid]="invalid('email')">
              @if (invalid('email')) { <span class="field-error">Valid email is required</span> }
            </div>
          </div>

          <div class="field-group">
            <label class="field-label required" for="ea-lbcId">LBC ID</label>
            <input id="ea-lbcId" class="field-input" type="text" formControlName="lbcId"
              [class.invalid]="invalid('lbcId')">
            @if (invalid('lbcId')) { <span class="field-error">LBC ID is required</span> }
          </div>

          <div class="field-row">
            <div class="field-group">
              <label class="field-label required" for="ea-region">Region</label>
              <select id="ea-region" class="field-input" formControlName="region" [class.invalid]="invalid('region')">
                <option value="" disabled>Select region</option>
                @for (r of regions; track r) {
                  <option [value]="r">{{ r }}</option>
                }
              </select>
              @if (invalid('region')) { <span class="field-error">Region is required</span> }
            </div>
            <div class="field-group">
              <label class="field-label required" for="ea-district">District</label>
              <input id="ea-district" class="field-input" type="text" formControlName="district"
                [class.invalid]="invalid('district')">
              @if (invalid('district')) { <span class="field-error">District is required</span> }
            </div>
          </div>

          @if (errorMsg()) {
            <div class="form-error-banner">
              <span class="material-symbols-rounded">error</span>
              {{ errorMsg() }}
            </div>
          }
        </form>

        <div class="drawer-footer">
          <button type="button" class="btn btn-ghost" (click)="closed.emit()" [disabled]="isSaving()">Cancel</button>
          <button type="button" class="btn btn-primary" (click)="onSubmit()" [disabled]="isSaving()">
            @if (isSaving()) { <span class="btn-spinner"></span> Saving… }
            @else { <span class="material-symbols-rounded">save</span> Save Changes }
          </button>
        </div>

      </aside>
    </div>
  `,
  styles: [`
    .backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.45); backdrop-filter: blur(2px); z-index: 1000; display: flex; justify-content: flex-end; animation: fade-in var(--transition-fast) ease; }
    @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
    .drawer { width: 520px; max-width: 100vw; height: 100%; background: var(--color-surface); display: flex; flex-direction: column; box-shadow: var(--shadow-xl); animation: slide-in var(--transition-base) cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
    .drawer-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid var(--color-border-light); flex-shrink: 0; }
    .drawer-title-group { display: flex; align-items: center; gap: 14px; }
    .drawer-icon { width: 44px; height: 44px; border-radius: var(--radius-md); background: rgba(2,132,199,0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0; span { font-size: 22px; color: #0284c7; font-variation-settings: 'FILL' 1; } }
    .drawer-title { font-size: 1.125rem; font-weight: 700; color: var(--color-text-primary); margin: 0; }
    .drawer-subtitle { font-size: 0.8125rem; color: var(--color-text-muted); margin: 2px 0 0; }
    .close-btn { width: 36px; height: 36px; border: none; border-radius: var(--radius-sm); background: transparent; color: var(--color-text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background var(--transition-fast), color var(--transition-fast); span { font-size: 20px; } &:hover { background: var(--color-border-light); color: var(--color-text-primary); } }
    .drawer-body { flex: 1; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 20px; }
    .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .field-group { display: flex; flex-direction: column; gap: 6px; }
    .field-label { font-size: 0.8125rem; font-weight: 600; color: var(--color-text-secondary); &.required::after { content: ' *'; color: var(--color-error); } }
    .field-input { padding: 10px 14px; border: 1.5px solid var(--color-border); border-radius: var(--radius-sm); font-size: 0.9375rem; font-family: inherit; color: var(--color-text-primary); background: var(--color-surface); outline: none; width: 100%; box-sizing: border-box; transition: border-color var(--transition-fast), box-shadow var(--transition-fast); &::placeholder { color: var(--color-text-muted); } &:focus { border-color: #0284c7; box-shadow: 0 0 0 3px rgba(2,132,199,0.12); } &.invalid { border-color: var(--color-error); &:focus { box-shadow: 0 0 0 3px rgba(220,38,38,0.12); } } }
    select.field-input { cursor: pointer; appearance: auto; }
    .field-error { font-size: 0.75rem; color: var(--color-error); font-weight: 500; }
    .form-error-banner { display: flex; align-items: center; gap: 8px; padding: 12px 14px; background: rgba(220,38,38,0.08); border: 1px solid rgba(220,38,38,0.2); border-radius: var(--radius-sm); color: var(--color-error); font-size: 0.875rem; span { font-size: 18px; font-variation-settings: 'FILL' 1; } }
    .drawer-footer { display: flex; align-items: center; justify-content: flex-end; gap: 10px; padding: 16px 24px; border-top: 1px solid var(--color-border-light); flex-shrink: 0; }
    .btn-spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.35); border-top-color: white; border-radius: 50%; animation: spin 0.65s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `],
})
export class EditAgentModalComponent implements OnInit {
  readonly agent = input.required<Agent>();
  readonly closed = output<void>();
  readonly updated = output<void>();

  readonly store = inject(AgentStore);
  readonly regions = GHANA_REGIONS;
  readonly isSaving = signal(false);
  readonly errorMsg = signal('');

  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    firstName: ['', Validators.required],
    lastName:  ['', Validators.required],
    phone:     ['', Validators.required],
    email:     ['', [Validators.required, Validators.email]],
    lbcId:     ['', Validators.required],
    region:    ['', Validators.required],
    district:  ['', Validators.required],
  });

  ngOnInit(): void {
    const a = this.agent();
    this.form.patchValue({
      firstName: a.firstName, lastName: a.lastName,
      phone: a.phone, email: a.email,
      lbcId: a.lbcId, region: a.region, district: a.district,
    });
  }

  invalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  onBackdropClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('backdrop')) this.closed.emit();
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.isSaving()) return;

    this.isSaving.set(true);
    this.errorMsg.set('');

    const v = this.form.getRawValue();
    const payload: Partial<CreateAgentRequest> = {
      firstName: v.firstName!, lastName: v.lastName!,
      fullName: `${v.firstName!} ${v.lastName!}`,
      phone: v.phone!, email: v.email!,
      lbcId: v.lbcId!, region: v.region!, district: v.district!,
    };

    this.store.updateOne(this.agent().id, payload, {
      onSuccess: () => { this.isSaving.set(false); this.updated.emit(); this.closed.emit(); },
      onError: (msg) => { this.isSaving.set(false); this.errorMsg.set(msg); },
    });
  }
}
