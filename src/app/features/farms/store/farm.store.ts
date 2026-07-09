import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { inject, computed } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, finalize, EMPTY } from 'rxjs';
import { FarmService } from '../services/farm.service';
import { Farm, FarmListMeta, FarmQueryParams } from '../domain/farm.model';

interface FarmState {
  farms: Farm[];
  meta: FarmListMeta;
  isLoading: boolean;
}

const defaultMeta: FarmListMeta = { page: 1, perPage: 20, total: 0, totalPages: 0 };

export const FarmStore = signalStore(
  { providedIn: 'root' },
  withState<FarmState>({
    farms: [],
    meta: defaultMeta,
    isLoading: false,
  }),
  withComputed((store) => ({
    regions:   computed(() => [...new Set(store.farms().map(f => f.region))].filter(Boolean).sort()),
    cropTypes: computed(() => [...new Set(store.farms().map(f => f.cropType))].filter(Boolean).sort()),
  })),
  withMethods((store, svc = inject(FarmService)) => ({
    load: rxMethod<FarmQueryParams>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(params =>
          svc.list(params).pipe(
            tap(res => patchState(store, { farms: res.data, meta: res.meta })),
            catchError(() => EMPTY),
            finalize(() => patchState(store, { isLoading: false })),
          )
        ),
      )
    ),
  })),
);
