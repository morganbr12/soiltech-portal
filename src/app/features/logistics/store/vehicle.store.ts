import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { inject, computed } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, finalize, EMPTY, forkJoin } from 'rxjs';
import { VehicleService, VehicleKpis } from '../services/vehicle.service';
import { Vehicle, VehicleListMeta, VehicleQueryParams, CreateVehiclePayload } from '../domain/vehicle.model';

interface VehicleState {
  vehicles: Vehicle[];
  meta: VehicleListMeta;
  kpis: VehicleKpis | null;
  isLoading: boolean;
  isSaving: boolean;
}

const defaultMeta: VehicleListMeta = { page: 1, perPage: 20, total: 0, totalPages: 0 };
const defaultKpis: VehicleKpis = { totalVehicles: 0, available: 0, onRoute: 0, maintenance: 0, inactive: 0 };

export const VehicleStore = signalStore(
  { providedIn: 'root' },
  withState<VehicleState>({
    vehicles: [],
    meta: defaultMeta,
    kpis: null,
    isLoading: false,
    isSaving: false,
  }),
  withComputed((store) => ({
    regions: computed(() => [...new Set(store.vehicles().map(v => v.region))].filter(Boolean).sort()),
    types:   computed(() => [...new Set(store.vehicles().map(v => v.vehicleType))].filter(Boolean).sort()),
  })),
  withMethods((store, svc = inject(VehicleService)) => ({
    loadAll: rxMethod<VehicleQueryParams>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(params =>
          forkJoin({
            list: svc.list(params),
            kpis: svc.getKpis(),
          }).pipe(
            tap(({ list, kpis }) => patchState(store, { vehicles: list.data, meta: list.meta, kpis })),
            catchError(() => EMPTY),
            finalize(() => patchState(store, { isLoading: false }))
          )
        )
      )
    ),
    load: rxMethod<VehicleQueryParams>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(params =>
          svc.list(params).pipe(
            tap(res => patchState(store, { vehicles: res.data, meta: res.meta })),
            catchError(() => EMPTY),
            finalize(() => patchState(store, { isLoading: false }))
          )
        )
      )
    ),
    create: rxMethod<{ payload: CreateVehiclePayload; onSuccess: (v: Vehicle) => void }>(
      pipe(
        tap(() => patchState(store, { isSaving: true })),
        switchMap(({ payload, onSuccess }) =>
          svc.create(payload).pipe(
            tap(vehicle => {
              patchState(store, { vehicles: [vehicle, ...store.vehicles()] });
              onSuccess(vehicle);
            }),
            catchError(() => EMPTY),
            finalize(() => patchState(store, { isSaving: false }))
          )
        )
      )
    ),
  }))
);
