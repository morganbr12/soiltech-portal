import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MOCK_VEHICLES, MOCK_AGENTS } from '../../../../../shared/data/mock-data';
import { VehicleStatus } from '../../../../../core/enums/status.enum';

type Vehicle = typeof MOCK_VEHICLES[number];

@Component({
  selector: 'app-tracking-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container" style="height:calc(100vh - 64px);display:flex;flex-direction:column;padding:0">

      <!-- Header bar -->
      <div style="padding:16px 24px;border-bottom:1px solid var(--color-border-light);background:var(--color-surface)">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
          <div>
            <h1 style="font-size:1.25rem;font-weight:700;color:var(--color-text-primary)">Live Tracking</h1>
            <p style="font-size:0.8125rem;color:var(--color-text-muted)">Real-time GPS tracking of vehicles and drivers</p>
          </div>
          <div style="display:flex;gap:8px;align-items:center">
            <div style="display:flex;align-items:center;gap:6px;font-size:0.8125rem">
              <span style="width:8px;height:8px;border-radius:50%;background:#16a34a;display:inline-block;animation:pulse 2s infinite"></span>
              <span style="color:var(--color-text-secondary)">Live</span>
            </div>
            @for (stat of vehicleStats; track stat.label) {
              <div style="display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:8px;border:1px solid var(--color-border-light);background:var(--color-surface-2)">
                <span class="material-symbols-rounded" style="font-size:16px" [style.color]="stat.color">{{ stat.icon }}</span>
                <span style="font-size:0.875rem;font-weight:600;color:var(--color-text-primary)">{{ stat.value }}</span>
                <span style="font-size:0.75rem;color:var(--color-text-muted)">{{ stat.label }}</span>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Main tracking area -->
      <div style="flex:1;display:flex;overflow:hidden">

        <!-- Vehicle List Sidebar -->
        <div style="width:320px;border-right:1px solid var(--color-border-light);background:var(--color-surface);overflow-y:auto;flex-shrink:0">
          <div style="padding:12px;border-bottom:1px solid var(--color-border-light);position:sticky;top:0;background:var(--color-surface);z-index:1">
            <div style="display:flex;align-items:center;gap:8px;background:var(--color-surface-2);border:1px solid var(--color-border-light);border-radius:8px;padding:7px 10px">
              <span class="material-symbols-rounded" style="font-size:16px;color:var(--color-text-muted)">search</span>
              <input type="text" placeholder="Search vehicles..." style="border:none;background:transparent;outline:none;font-size:0.875rem;color:var(--color-text-primary);width:100%">
            </div>
          </div>

          <div style="padding:8px">
            @for (v of vehicles(); track v.id) {
              <div
                class="vehicle-card"
                [class.active]="selectedVehicle()?.id === v.id"
                (click)="selectVehicle(v)"
              >
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
                  <div [style.background]="getStatusBg(v.status)" style="width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
                    <span class="material-symbols-rounded" [style.color]="getStatusColor(v.status)" style="font-size:18px;font-variation-settings:'FILL' 1">local_shipping</span>
                  </div>
                  <div style="flex:1;min-width:0">
                    <div style="font-weight:600;font-size:0.875rem;color:var(--color-text-primary)">{{ v.plateNumber }}</div>
                    <div style="font-size:0.75rem;color:var(--color-text-muted)">{{ v.make }} {{ v.model }}</div>
                  </div>
                  <span class="badge" [class]="getStatusBadge(v.status)">{{ v.status.replace('_',' ') }}</span>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:var(--color-text-muted)">
                  <span>{{ v.region }}</span>
                  <span>{{ v.fuelLevel }}% fuel</span>
                  <span>{{ v.capacityKg / 1000 }}t cap.</span>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Map Placeholder -->
        <div style="flex:1;position:relative;background:linear-gradient(135deg,#e8f5e9,#c8e6c9);overflow:hidden">
          <!-- Simulated map UI -->
          <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px">
            <div style="text-align:center;background:rgba(255,255,255,0.9);backdrop-filter:blur(8px);padding:24px 32px;border-radius:16px;border:1px solid rgba(255,255,255,0.5)">
              <span class="material-symbols-rounded" style="font-size:48px;color:#1a7a4a;font-variation-settings:'FILL' 1">map</span>
              <h3 style="font-size:1.125rem;font-weight:700;color:#0f172a;margin-top:8px">Google Maps Integration</h3>
              <p style="font-size:0.875rem;color:#475569;margin-top:4px;max-width:320px">
                Live vehicle tracking, route polylines, driver markers, geofencing, and traffic layers.<br>
                <strong>Add your Google Maps API key to enable.</strong>
              </p>
              <div style="display:flex;gap:8px;margin-top:16px;justify-content:center;flex-wrap:wrap">
                @for (v of onRouteVehicles; track v.id) {
                  <div style="padding:4px 10px;background:#dcfce7;color:#15803d;border-radius:99px;font-size:0.75rem;font-weight:600">{{ v.plateNumber }}</div>
                }
              </div>
            </div>
          </div>

          <!-- Map controls overlay -->
          <div style="position:absolute;top:16px;right:16px;display:flex;flex-direction:column;gap:8px">
            @for (ctrl of mapControls; track ctrl.label) {
              <button style="width:36px;height:36px;background:white;border:none;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.15);cursor:pointer;display:flex;align-items:center;justify-content:center" [title]="ctrl.label">
                <span class="material-symbols-rounded" style="font-size:18px;color:#475569">{{ ctrl.icon }}</span>
              </button>
            }
          </div>

          <!-- Vehicle detail panel -->
          @if (selectedVehicle()) {
            <div style="position:absolute;bottom:16px;left:16px;width:300px;background:white;border-radius:12px;padding:16px;box-shadow:0 8px 24px rgba(0,0,0,0.15);animation:slideInUp 0.2s ease">
              <div style="font-weight:700;font-size:1rem;color:#0f172a;margin-bottom:4px">{{ selectedVehicle()?.plateNumber }}</div>
              <div style="font-size:0.8125rem;color:#64748b;margin-bottom:12px">{{ selectedVehicle()?.make }} {{ selectedVehicle()?.model }} • {{ selectedVehicle()?.year }}</div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:0.8125rem">
                <div style="background:#f8fafb;border-radius:8px;padding:8px">
                  <div style="color:#94a3b8;margin-bottom:2px">Status</div>
                  <div style="font-weight:600;color:#0f172a">{{ selectedVehicle()?.status }}</div>
                </div>
                <div style="background:#f8fafb;border-radius:8px;padding:8px">
                  <div style="color:#94a3b8;margin-bottom:2px">Fuel</div>
                  <div style="font-weight:600;color:#0f172a">{{ selectedVehicle()?.fuelLevel }}%</div>
                </div>
                <div style="background:#f8fafb;border-radius:8px;padding:8px">
                  <div style="color:#94a3b8;margin-bottom:2px">Region</div>
                  <div style="font-weight:600;color:#0f172a">{{ selectedVehicle()?.region }}</div>
                </div>
                <div style="background:#f8fafb;border-radius:8px;padding:8px">
                  <div style="color:#94a3b8;margin-bottom:2px">Capacity</div>
                  <div style="font-weight:600;color:#0f172a">{{ selectedVehicle()?.capacityKg }}kg</div>
                </div>
              </div>
              <button (click)="selectedVehicle.set(null)" style="position:absolute;top:12px;right:12px;background:none;border:none;cursor:pointer;color:#94a3b8">
                <span class="material-symbols-rounded" style="font-size:18px">close</span>
              </button>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .vehicle-card {
      padding: 12px;
      border-radius: 10px;
      cursor: pointer;
      transition: all var(--transition-fast);
      border: 1px solid transparent;
      margin-bottom: 4px;

      &:hover { background: var(--color-surface-2); }
      &.active {
        background: rgba(26,122,74,0.08);
        border-color: rgba(26,122,74,0.2);
      }
    }
  `]
})
export class TrackingMapComponent implements OnInit, OnDestroy {
  readonly vehicles = signal(MOCK_VEHICLES);
  readonly selectedVehicle = signal<typeof MOCK_VEHICLES[number] | null>(null);

  private interval?: ReturnType<typeof setInterval>;

  readonly vehicleStats = [
    { label: 'On Route', value: MOCK_VEHICLES.filter(v => v.status === VehicleStatus.ON_ROUTE).length, icon: 'local_shipping', color: '#0284c7' },
    { label: 'Available', value: MOCK_VEHICLES.filter(v => v.status === VehicleStatus.AVAILABLE).length, icon: 'check_circle', color: '#16a34a' },
    { label: 'Maintenance', value: MOCK_VEHICLES.filter(v => v.status === VehicleStatus.MAINTENANCE).length, icon: 'build', color: '#d97706' },
    { label: 'Offline', value: MOCK_VEHICLES.filter(v => v.status === VehicleStatus.OFFLINE).length, icon: 'power_off', color: '#94a3b8' },
  ];

  readonly onRouteVehicles = MOCK_VEHICLES.filter(v => v.status === VehicleStatus.ON_ROUTE).slice(0, 6);

  readonly mapControls = [
    { label: 'Zoom In', icon: 'add' },
    { label: 'Zoom Out', icon: 'remove' },
    { label: 'Traffic', icon: 'traffic' },
    { label: 'Satellite', icon: 'satellite' },
    { label: 'Clusters', icon: 'bubble_chart' },
  ];

  getStatusColor(status: string): string {
    const map: Record<string, string> = { on_route: '#0284c7', available: '#16a34a', maintenance: '#d97706', offline: '#94a3b8' };
    return map[status] ?? '#94a3b8';
  }

  getStatusBg(status: string): string {
    const map: Record<string, string> = { on_route: 'rgba(2,132,199,0.1)', available: 'rgba(22,163,74,0.1)', maintenance: 'rgba(217,119,6,0.1)', offline: 'rgba(148,163,184,0.1)' };
    return map[status] ?? 'rgba(148,163,184,0.1)';
  }

  getStatusBadge(status: string): string {
    const map: Record<string, string> = { on_route: 'badge--info', available: 'badge--success', maintenance: 'badge--warning', offline: 'badge--neutral' };
    return map[status] ?? 'badge--neutral';
  }

  selectVehicle(v: typeof MOCK_VEHICLES[number]): void {
    this.selectedVehicle.set(this.selectedVehicle()?.id === v.id ? null : v);
  }

  ngOnInit(): void {
    // Simulate live position updates
    this.interval = setInterval(() => {
      this.vehicles.update(veh => veh.map(v =>
        v.status === VehicleStatus.ON_ROUTE
          ? { ...v, lat: v.lat + (Math.random() - 0.5) * 0.01, lng: v.lng + (Math.random() - 0.5) * 0.01 }
          : v
      ));
    }, 5000);
  }

  ngOnDestroy(): void {
    if (this.interval) clearInterval(this.interval);
  }
}
