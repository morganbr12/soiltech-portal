import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { inject, computed } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, finalize, EMPTY } from 'rxjs';
import { ProduceService } from '../services/produce.service';
import { ProduceListing, ProduceListMeta, ProduceQueryParams } from '../domain/produce.model';

interface ProduceState {
  listings: ProduceListing[];
  meta: ProduceListMeta;
  isLoading: boolean;
}

const defaultMeta: ProduceListMeta = { page: 1, perPage: 20, total: 0, totalPages: 0 };

export const ProduceStore = signalStore(
  { providedIn: 'root' },
  withState<ProduceState>({
    listings: [],
    meta: defaultMeta,
    isLoading: false,
  }),
  withComputed((store) => ({
    regions: computed(() => [...new Set(store.listings().map(p => p.region))].filter(Boolean).sort()),
    cropTypes: computed(() => [...new Set(store.listings().map(p => p.cropType))].filter(Boolean).sort()),
  })),
  withMethods((store, svc = inject(ProduceService)) => ({
    load: rxMethod<ProduceQueryParams>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(params =>
          svc.list(params).pipe(
            tap(res => patchState(store, { listings: res.data, meta: res.meta })),
            catchError(() => EMPTY),
            finalize(() => patchState(store, { isLoading: false }))
          )
        )
      )
    ),

    approve(id: string, onSuccess: () => void, onError: (msg: string) => void): void {
      svc.approve(id).subscribe({
        next: updated => {
          patchState(store, { listings: store.listings().map(l => l.id === id ? { ...l, ...updated } : l) });
          onSuccess();
        },
        error: () => onError('Approval failed'),
      });
    },

    reject(id: string, onSuccess: () => void, onError: (msg: string) => void): void {
      svc.reject(id).subscribe({
        next: updated => {
          patchState(store, { listings: store.listings().map(l => l.id === id ? { ...l, ...updated } : l) });
          onSuccess();
        },
        error: () => onError('Rejection failed'),
      });
    },
  }))
);
