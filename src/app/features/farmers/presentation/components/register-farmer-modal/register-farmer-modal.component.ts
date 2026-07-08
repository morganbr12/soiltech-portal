import { Component, inject, output, signal, computed, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FarmerStore } from '../../../store/farmer.store';
import { CreateFarmerRequest } from '../../../domain/farmer.model';
import { LbcService } from '../../../../lbc/services/lbc.service';
import { AgentService } from '../../../../agents/services/agent.service';

interface LbcOption   { id: string; name: string; code: string; }
interface AgentOption { id: string; fullName: string; agentCode: string; }

const GHANA_REGIONS = [
  'Greater Accra', 'Ashanti', 'Western', 'Eastern', 'Central',
  'Northern', 'Upper East', 'Upper West', 'Volta', 'Oti',
  'Ahafo', 'Bono East', 'North East', 'Savannah', 'Western North', 'Bono',
];

const CROP_TYPES = ['Cocoa', 'Coffee', 'Cashew', 'Shea', 'Maize', 'Cassava', 'Oil Palm', 'Rubber'];

@Component({
  selector: 'app-register-farmer-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="backdrop" (click)="onBackdropClick($event)">
      <aside class="drawer" (click)="$event.stopPropagation()" role="dialog" aria-modal="true" aria-labelledby="modal-title">

        <div class="drawer-header">
          <div class="drawer-title-group">
            <div class="drawer-icon">
              <span class="material-symbols-rounded">person_add</span>
            </div>
            <div>
              <h2 class="drawer-title" id="modal-title">Register Farmer</h2>
              <p class="drawer-subtitle">Add a new farmer to the system</p>
            </div>
          </div>
          <button class="close-btn" (click)="closed.emit()" aria-label="Close">
            <span class="material-symbols-rounded">close</span>
          </button>
        </div>

        <form class="drawer-body" [formGroup]="form" (ngSubmit)="onSubmit()">

          <!-- Name row -->
          <div class="field-row">
            <div class="field-group">
              <label class="field-label required" for="rf-firstName">First Name</label>
              <input id="rf-firstName" class="field-input" type="text" formControlName="firstName"
                placeholder="e.g. Kwame" [class.invalid]="invalid('firstName')">
              @if (invalid('firstName')) { <span class="field-error">First name is required</span> }
            </div>
            <div class="field-group">
              <label class="field-label required" for="rf-lastName">Last Name</label>
              <input id="rf-lastName" class="field-input" type="text" formControlName="lastName"
                placeholder="e.g. Mensah" [class.invalid]="invalid('lastName')">
              @if (invalid('lastName')) { <span class="field-error">Last name is required</span> }
            </div>
          </div>

          <!-- Phone + Email -->
          <div class="field-row">
            <div class="field-group">
              <label class="field-label required" for="rf-phone">Phone</label>
              <input id="rf-phone" class="field-input" type="tel" formControlName="phone"
                placeholder="+233 XX XXX XXXX" [class.invalid]="invalid('phone')">
              @if (invalid('phone')) { <span class="field-error">Phone is required</span> }
            </div>
            <div class="field-group">
              <label class="field-label" for="rf-email">Email <span class="field-optional">(optional)</span></label>
              <input id="rf-email" class="field-input" type="email" formControlName="email"
                placeholder="farmer@example.com" [class.invalid]="invalid('email')">
              @if (invalid('email')) { <span class="field-error">Enter a valid email</span> }
            </div>
          </div>

          <!-- National ID -->
          <div class="field-group">
            <label class="field-label required" for="rf-nationalId">National ID</label>
            <input id="rf-nationalId" class="field-input" type="text" formControlName="nationalId"
              placeholder="e.g. GHA-1234567890" [class.invalid]="invalid('nationalId')">
            @if (invalid('nationalId')) { <span class="field-error">National ID is required</span> }
          </div>

          <!-- LBC searchable dropdown -->
          <div class="field-group">
            <label class="field-label required">LBC</label>
            <div class="searchable-select" [class.open]="showLbcDropdown()" (click)="$event.stopPropagation()">
              <button type="button" class="select-trigger" [class.invalid]="invalid('lbcId')" (click)="toggleLbcDropdown()">
                <span [class.placeholder]="!selectedLbc()">
                  {{ selectedLbc() ? selectedLbc()!.name + ' · ' + selectedLbc()!.code : 'Select LBC…' }}
                </span>
                <span class="material-symbols-rounded">{{ showLbcDropdown() ? 'expand_less' : 'expand_more' }}</span>
              </button>
              @if (showLbcDropdown()) {
                <div class="select-panel">
                  <div class="select-search-wrap">
                    <span class="material-symbols-rounded search-icon">search</span>
                    <input class="select-search-input" [value]="lbcSearch()" (input)="onLbcSearch($event)"
                      placeholder="Search by name or code…" autofocus>
                  </div>
                  <div class="select-list">
                    @if (lbcsLoading()) {
                      <div class="select-status"><span class="spinner-sm"></span> Loading…</div>
                    } @else if (filteredLbcs().length === 0) {
                      <div class="select-status">No LBCs found</div>
                    } @else {
                      @for (lbc of filteredLbcs(); track lbc.id) {
                        <button type="button" class="select-item" [class.selected]="selectedLbc()?.id === lbc.id" (click)="selectLbc(lbc)">
                          <span class="select-item-main">{{ lbc.name }}</span>
                          <span class="select-item-sub">{{ lbc.code }}</span>
                        </button>
                      }
                    }
                  </div>
                </div>
              }
            </div>
            @if (invalid('lbcId')) { <span class="field-error">LBC is required</span> }
          </div>

          <!-- Agent searchable dropdown -->
          <div class="field-group">
            <label class="field-label required">Agent</label>
            <div class="searchable-select" [class.open]="showAgentDropdown()" (click)="$event.stopPropagation()">
              <button type="button" class="select-trigger" [class.invalid]="invalid('agentId')" (click)="toggleAgentDropdown()">
                <span [class.placeholder]="!selectedAgent()">
                  {{ selectedAgent() ? selectedAgent()!.fullName + ' · ' + selectedAgent()!.agentCode : 'Select Agent…' }}
                </span>
                <span class="material-symbols-rounded">{{ showAgentDropdown() ? 'expand_less' : 'expand_more' }}</span>
              </button>
              @if (showAgentDropdown()) {
                <div class="select-panel">
                  <div class="select-search-wrap">
                    <span class="material-symbols-rounded search-icon">search</span>
                    <input class="select-search-input" [value]="agentSearch()" (input)="onAgentSearch($event)"
                      placeholder="Search by name or code…" autofocus>
                  </div>
                  <div class="select-list">
                    @if (agentsLoading()) {
                      <div class="select-status"><span class="spinner-sm"></span> Loading…</div>
                    } @else if (filteredAgents().length === 0) {
                      <div class="select-status">No agents found</div>
                    } @else {
                      @for (agent of filteredAgents(); track agent.id) {
                        <button type="button" class="select-item" [class.selected]="selectedAgent()?.id === agent.id" (click)="selectAgent(agent)">
                          <span class="select-item-main">{{ agent.fullName }}</span>
                          <span class="select-item-sub">{{ agent.agentCode }}</span>
                        </button>
                      }
                    }
                  </div>
                </div>
              }
            </div>
            @if (invalid('agentId')) { <span class="field-error">Agent is required</span> }
          </div>

          <!-- Region + District -->
          <div class="field-row">
            <div class="field-group">
              <label class="field-label required" for="rf-region">Region</label>
              <select id="rf-region" class="field-input" formControlName="region" [class.invalid]="invalid('region')">
                <option value="" disabled>Select region</option>
                @for (r of regions; track r) { <option [value]="r">{{ r }}</option> }
              </select>
              @if (invalid('region')) { <span class="field-error">Region is required</span> }
            </div>
            <div class="field-group">
              <label class="field-label required" for="rf-district">District</label>
              <input id="rf-district" class="field-input" type="text" formControlName="district"
                placeholder="e.g. Kumasi Metro" [class.invalid]="invalid('district')">
              @if (invalid('district')) { <span class="field-error">District is required</span> }
            </div>
          </div>

          <!-- Crop types -->
          <div class="field-group">
            <label class="field-label">Crop Types</label>
            <div class="crop-grid">
              @for (crop of crops; track crop) {
                <label class="crop-chip" [class.selected]="isCropSelected(crop)">
                  <input type="checkbox" [checked]="isCropSelected(crop)" (change)="toggleCrop(crop)">
                  {{ crop }}
                </label>
              }
            </div>
          </div>

          @if (errorMsg()) {
            <div class="form-error-banner">
              <span class="material-symbols-rounded">error</span>{{ errorMsg() }}
            </div>
          }

        </form>

        <div class="drawer-footer">
          <button type="button" class="btn btn-ghost" (click)="closed.emit()" [disabled]="isSaving()">Cancel</button>
          <button type="button" class="btn btn-primary" (click)="onSubmit()" [disabled]="isSaving()">
            @if (isSaving()) { <span class="btn-spinner"></span> Registering… }
            @else { <span class="material-symbols-rounded">person_add</span> Register Farmer }
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
    .drawer-icon { width: 44px; height: 44px; border-radius: var(--radius-md); background: rgba(26,122,74,0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0; span { font-size: 22px; color: var(--color-primary); font-variation-settings: 'FILL' 1; } }
    .drawer-title { font-size: 1.125rem; font-weight: 700; color: var(--color-text-primary); margin: 0; }
    .drawer-subtitle { font-size: 0.8125rem; color: var(--color-text-muted); margin: 2px 0 0; }
    .close-btn { width: 36px; height: 36px; border: none; border-radius: var(--radius-sm); background: transparent; color: var(--color-text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background var(--transition-fast); span { font-size: 20px; } &:hover { background: var(--color-border-light); color: var(--color-text-primary); } }
    .drawer-body { flex: 1; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 20px; }
    .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .field-group { display: flex; flex-direction: column; gap: 6px; }
    .field-label { font-size: 0.8125rem; font-weight: 600; color: var(--color-text-secondary); &.required::after { content: ' *'; color: var(--color-error); } }
    .field-optional { font-weight: 400; color: var(--color-text-muted); font-size: 0.75rem; }
    .field-input { padding: 10px 14px; border: 1.5px solid var(--color-border); border-radius: var(--radius-sm); font-size: 0.9375rem; font-family: inherit; color: var(--color-text-primary); background: var(--color-surface); outline: none; width: 100%; box-sizing: border-box; transition: border-color var(--transition-fast), box-shadow var(--transition-fast); &::placeholder { color: var(--color-text-muted); } &:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(26,122,74,0.12); } &.invalid { border-color: var(--color-error); &:focus { box-shadow: 0 0 0 3px rgba(220,38,38,0.12); } } }
    select.field-input { cursor: pointer; appearance: auto; }
    .field-error { font-size: 0.75rem; color: var(--color-error); font-weight: 500; }
    .searchable-select { position: relative; }
    .select-trigger { width: 100%; padding: 10px 14px; border: 1.5px solid var(--color-border); border-radius: var(--radius-sm); font-size: 0.9375rem; font-family: inherit; color: var(--color-text-primary); background: var(--color-surface); cursor: pointer; display: flex; align-items: center; justify-content: space-between; gap: 8px; text-align: left; transition: border-color var(--transition-fast), box-shadow var(--transition-fast); .material-symbols-rounded { font-size: 18px; color: var(--color-text-muted); flex-shrink: 0; } &.invalid { border-color: var(--color-error); } }
    .searchable-select.open .select-trigger { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(26,122,74,0.12); }
    .placeholder { color: var(--color-text-muted); }
    .select-panel { position: absolute; top: calc(100% + 4px); left: 0; right: 0; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); box-shadow: var(--shadow-xl); z-index: 200; overflow: hidden; animation: dd-in 120ms cubic-bezier(0.16,1,0.3,1); }
    @keyframes dd-in { from { opacity: 0; transform: translateY(-4px) scale(0.98); } to { opacity: 1; transform: none; } }
    .select-search-wrap { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-bottom: 1px solid var(--color-border-light); .search-icon { font-size: 18px; color: var(--color-text-muted); } }
    .select-search-input { flex: 1; border: none; outline: none; font-size: 0.875rem; font-family: inherit; color: var(--color-text-primary); background: transparent; &::placeholder { color: var(--color-text-muted); } }
    .select-list { max-height: 210px; overflow-y: auto; padding: 4px; }
    .select-status { padding: 16px; text-align: center; font-size: 0.875rem; color: var(--color-text-muted); display: flex; align-items: center; justify-content: center; gap: 8px; }
    .select-item { width: 100%; padding: 8px 12px; border: none; background: transparent; cursor: pointer; text-align: left; border-radius: 6px; transition: background var(--transition-fast); display: flex; align-items: center; justify-content: space-between; gap: 8px; &:hover { background: var(--color-surface-2); } &.selected { background: rgba(26,122,74,0.08); } }
    .select-item-main { font-size: 0.875rem; font-weight: 500; color: var(--color-text-primary); }
    .select-item-sub { font-size: 0.75rem; color: var(--color-text-muted); flex-shrink: 0; }
    .spinner-sm { display: inline-block; width: 12px; height: 12px; border: 2px solid var(--color-border); border-top-color: var(--color-primary); border-radius: 50%; animation: spin 0.65s linear infinite; }
    .crop-grid { display: flex; flex-wrap: wrap; gap: 8px; }
    .crop-chip { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border: 1.5px solid var(--color-border); border-radius: 99px; font-size: 0.8125rem; font-weight: 500; color: var(--color-text-secondary); cursor: pointer; transition: all var(--transition-fast); user-select: none; input[type="checkbox"] { display: none; } &.selected { border-color: var(--color-primary); background: rgba(26,122,74,0.08); color: var(--color-primary); } &:hover { border-color: var(--color-primary); } }
    .form-error-banner { display: flex; align-items: center; gap: 8px; padding: 12px 14px; background: rgba(220,38,38,0.08); border: 1px solid rgba(220,38,38,0.2); border-radius: var(--radius-sm); color: var(--color-error); font-size: 0.875rem; span { font-size: 18px; font-variation-settings: 'FILL' 1; } }
    .drawer-footer { display: flex; align-items: center; justify-content: flex-end; gap: 10px; padding: 16px 24px; border-top: 1px solid var(--color-border-light); flex-shrink: 0; }
    .btn-spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.35); border-top-color: white; border-radius: 50%; animation: spin 0.65s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `],
})
export class RegisterFarmerModalComponent implements OnInit {
  readonly closed     = output<void>();
  readonly registered = output<void>();

  private readonly lbcService   = inject(LbcService);
  private readonly agentService = inject(AgentService);
  readonly store   = inject(FarmerStore);
  readonly regions = GHANA_REGIONS;
  readonly crops   = CROP_TYPES;
  readonly isSaving = signal(false);
  readonly errorMsg = signal('');

  readonly lbcs            = signal<LbcOption[]>([]);
  readonly lbcsLoading     = signal(false);
  readonly lbcSearch       = signal('');
  readonly selectedLbc     = signal<LbcOption | null>(null);
  readonly showLbcDropdown = signal(false);

  readonly filteredLbcs = computed(() => {
    const q = this.lbcSearch().toLowerCase();
    if (!q) return this.lbcs();
    return this.lbcs().filter(l =>
      l.name.toLowerCase().includes(q) || l.code.toLowerCase().includes(q)
    );
  });

  readonly agents             = signal<AgentOption[]>([]);
  readonly agentsLoading      = signal(false);
  readonly agentSearch        = signal('');
  readonly selectedAgent      = signal<AgentOption | null>(null);
  readonly showAgentDropdown  = signal(false);

  readonly filteredAgents = computed(() => {
    const q = this.agentSearch().toLowerCase();
    if (!q) return this.agents();
    return this.agents().filter(a =>
      a.fullName.toLowerCase().includes(q) || a.agentCode.toLowerCase().includes(q)
    );
  });

  selectedCrops: string[] = [];

  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    firstName:  ['', Validators.required],
    lastName:   ['', Validators.required],
    phone:      ['', Validators.required],
    email:      ['', Validators.email],
    nationalId: ['', Validators.required],
    lbcId:      ['', Validators.required],
    agentId:    ['', Validators.required],
    region:     ['', Validators.required],
    district:   ['', Validators.required],
  });

  @HostListener('document:click')
  closeDropdowns(): void {
    this.showLbcDropdown.set(false);
    this.showAgentDropdown.set(false);
  }

  ngOnInit(): void {
    this.lbcsLoading.set(true);
    this.lbcService.list({ limit: 200 }).subscribe({
      next: (res) => {
        this.lbcs.set(res.data.map(l => ({ id: l.id, name: l.name, code: l.code })));
        this.lbcsLoading.set(false);
      },
      error: () => this.lbcsLoading.set(false),
    });

    this.agentsLoading.set(true);
    this.agentService.list({ limit: 200 }).subscribe({
      next: (res) => {
        this.agents.set(res.data.map(a => ({ id: a.id, fullName: a.fullName, agentCode: a.agentCode })));
        this.agentsLoading.set(false);
      },
      error: () => this.agentsLoading.set(false),
    });
  }

  toggleLbcDropdown(): void {
    this.showLbcDropdown.update(v => !v);
    this.showAgentDropdown.set(false);
    this.lbcSearch.set('');
  }

  toggleAgentDropdown(): void {
    this.showAgentDropdown.update(v => !v);
    this.showLbcDropdown.set(false);
    this.agentSearch.set('');
  }

  selectLbc(lbc: LbcOption): void {
    this.selectedLbc.set(lbc);
    this.showLbcDropdown.set(false);
    this.form.patchValue({ lbcId: lbc.id });
  }

  selectAgent(agent: AgentOption): void {
    this.selectedAgent.set(agent);
    this.showAgentDropdown.set(false);
    this.form.patchValue({ agentId: agent.id });
  }

  onLbcSearch(e: Event): void {
    this.lbcSearch.set((e.target as HTMLInputElement).value);
  }

  onAgentSearch(e: Event): void {
    this.agentSearch.set((e.target as HTMLInputElement).value);
  }

  invalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  isCropSelected(crop: string): boolean {
    return this.selectedCrops.includes(crop);
  }

  toggleCrop(crop: string): void {
    if (this.isCropSelected(crop)) {
      this.selectedCrops = this.selectedCrops.filter(c => c !== crop);
    } else {
      this.selectedCrops = [...this.selectedCrops, crop];
    }
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
    const payload: CreateFarmerRequest = {
      firstName:  v.firstName!,
      lastName:   v.lastName!,
      phone:      v.phone!,
      email:      v.email || undefined,
      nationalId: v.nationalId!,
      lbcId:      v.lbcId!,
      agentId:    v.agentId!,
      region:     v.region!,
      district:   v.district!,
      cropTypes:  this.selectedCrops,
    };

    this.store.create(payload, {
      onSuccess: () => { this.isSaving.set(false); this.registered.emit(); this.closed.emit(); },
      onError:   (msg) => { this.isSaving.set(false); this.errorMsg.set(msg); },
    });
  }
}
