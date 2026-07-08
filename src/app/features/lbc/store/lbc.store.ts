import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { inject, computed } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY } from 'rxjs';
import { LbcService } from '../services/lbc.service';
import { Lbc, LbcListResponse, LbcQueryParams } from '../domain/lbc.model';
import { EntityStatus } from '../../../core/enums/status.enum';

interface LbcState {
  lbcs: Lbc[];
  total: number;
  totalActive: number;
  totalPending: number;
  totalSuspended: number;
  isLoading: boolean;
  error: string | null;
  selectedIds: string[];
}

export const LbcStore = signalStore(
  { providedIn: 'root' },
  withState<LbcState>({
    lbcs: [],
    total: 0,
    totalActive: 0,
    totalPending: 0,
    totalSuspended: 0,
    isLoading: false,
    error: null,
    selectedIds: [],
  }),
  withComputed((store) => ({
    totalInactive: computed(() => store.total() - store.totalActive() - store.totalPending() - store.totalSuspended()),
    regions: computed(() => [...new Set(store.lbcs().map(l => l.region))].sort()),
  })),
  withMethods((store, service = inject(LbcService)) => ({
    load: rxMethod<LbcQueryParams>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(params =>
          service.list(params).pipe(
            tap((res: LbcListResponse) => patchState(store, {
              lbcs: res.data,
              total: res.total,
              totalActive: res.active,
              totalPending: res.pending,
              totalSuspended: res.suspended,
              isLoading: false,
            })),
            catchError((err: Error) => {
              patchState(store, { isLoading: false, error: err.message });
              return EMPTY;
            })
          )
        )
      )
    ),

    suspendOne(id: string): void {
      service.suspend(id).subscribe({
        next: updated => patchState(store, {
          lbcs: store.lbcs().map(l => l.id === id ? updated : l),
          totalActive: store.totalActive() - 1,
          totalSuspended: store.totalSuspended() + 1,
        }),
      });
    },

    bulkSuspend(ids: string[]): void {
      service.bulkSuspend(ids).subscribe({
        next: result => {
          const succeeded = new Set(result.succeeded);
          patchState(store, {
            lbcs: store.lbcs().map(l => succeeded.has(l.id) ? { ...l, status: EntityStatus.SUSPENDED } : l),
            selectedIds: [],
          });
        },
      });
    },

    exportCsv(params: { status?: string; region?: string; ids?: string[] } = {}): void {
      service.export(params).subscribe(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'lbcs.csv';
        a.click();
        URL.revokeObjectURL(url);
      });
    },

    setSelectedIds(ids: string[]): void {
      patchState(store, { selectedIds: ids });
    },
  }))
);
