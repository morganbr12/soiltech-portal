import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, finalize, EMPTY } from 'rxjs';
import { DashboardService } from '../services/dashboard.service';
import { DashboardData } from '../domain/dashboard.model';

interface DashboardState {
  data: DashboardData | null;
  isLoading: boolean;
}

export const DashboardStore = signalStore(
  { providedIn: 'root' },
  withState<DashboardState>({ data: null, isLoading: false }),
  withMethods((store, svc = inject(DashboardService)) => ({
    load: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() =>
          svc.getSummary().pipe(
            tap(data => patchState(store, { data })),
            catchError(() => EMPTY),
            finalize(() => patchState(store, { isLoading: false }))
          )
        )
      )
    ),
  }))
);
