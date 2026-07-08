import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { inject, computed } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, finalize, timeout, EMPTY } from 'rxjs';
import { FarmerService } from '../services/farmer.service';
import { Farmer, FarmerListResponse, FarmerQueryParams, CreateFarmerRequest } from '../domain/farmer.model';

type StoreCallbacks = { onSuccess: () => void; onError: (msg: string) => void };
type HttpErr = { error?: { message?: string }; message?: string };

interface FarmerState {
  farmers: Farmer[];
  total: number;
  totalApproved: number;
  totalPending: number;
  totalRejected: number;
  isLoading: boolean;
  error: string | null;
  selectedIds: string[];
}

export const FarmerStore = signalStore(
  { providedIn: 'root' },
  withState<FarmerState>({
    farmers: [],
    total: 0,
    totalApproved: 0,
    totalPending: 0,
    totalRejected: 0,
    isLoading: false,
    error: null,
    selectedIds: [],
  }),
  withComputed((store) => ({
    regions: computed(() => [...new Set(store.farmers().map(f => f.region))].sort()),
  })),
  withMethods((store, service = inject(FarmerService)) => ({
    load: rxMethod<FarmerQueryParams>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(params =>
          service.list(params).pipe(
            timeout(20000),
            tap((res: FarmerListResponse) => {
              patchState(store, {
                farmers: res.data ?? [],
                total: res.summary?.total ?? res.data?.length ?? 0,
                totalApproved: res.summary?.approved ?? 0,
                totalPending: res.summary?.pending ?? 0,
                totalRejected: res.summary?.rejected ?? 0,
              });
            }),
            catchError((err: { message?: string }) => {
              const msg = (err as { error?: { message?: string } })?.error?.message
                ?? err?.message
                ?? 'Failed to load farmers';
              patchState(store, { error: msg });
              return EMPTY;
            }),
            finalize(() => patchState(store, { isLoading: false }))
          )
        )
      )
    ),

    setSelectedIds(ids: string[]): void {
      patchState(store, { selectedIds: ids });
    },

    create(payload: CreateFarmerRequest, callbacks: StoreCallbacks): void {
      service.create(payload).subscribe({
        next: () => callbacks.onSuccess(),
        error: (err: HttpErr) => callbacks.onError(
          err?.error?.message ?? err?.message ?? 'Registration failed. Please try again.'
        ),
      });
    },

    updateOne(id: string, payload: Partial<CreateFarmerRequest>, callbacks: StoreCallbacks): void {
      service.update(id, payload).subscribe({
        next: updated => {
          patchState(store, {
            farmers: store.farmers().map(f => f.id === id ? { ...f, ...updated } : f),
          });
          callbacks.onSuccess();
        },
        error: (err: HttpErr) => callbacks.onError(
          err?.error?.message ?? err?.message ?? 'Update failed. Please try again.'
        ),
      });
    },

    approve(id: string, callbacks: StoreCallbacks): void {
      service.approve(id).subscribe({
        next: updated => {
          patchState(store, {
            farmers: store.farmers().map(f => f.id === id ? { ...f, ...updated } : f),
            totalApproved: store.totalApproved() + 1,
            totalPending: Math.max(0, store.totalPending() - 1),
          });
          callbacks.onSuccess();
        },
        error: (err: HttpErr) => callbacks.onError(
          err?.error?.message ?? err?.message ?? 'Approval failed. Please try again.'
        ),
      });
    },

    reject(id: string, reason: string, callbacks: StoreCallbacks): void {
      service.reject(id, reason).subscribe({
        next: updated => {
          patchState(store, {
            farmers: store.farmers().map(f => f.id === id ? { ...f, ...updated } : f),
            totalRejected: store.totalRejected() + 1,
            totalPending: Math.max(0, store.totalPending() - 1),
          });
          callbacks.onSuccess();
        },
        error: (err: HttpErr) => callbacks.onError(
          err?.error?.message ?? err?.message ?? 'Rejection failed. Please try again.'
        ),
      });
    },

    deleteOne(id: string, callbacks: StoreCallbacks): void {
      service.delete(id).subscribe({
        next: () => {
          const removed = store.farmers().find(f => f.id === id);
          patchState(store, {
            farmers: store.farmers().filter(f => f.id !== id),
            total: Math.max(0, store.total() - 1),
            totalApproved: removed?.status === 'approved' ? Math.max(0, store.totalApproved() - 1) : store.totalApproved(),
            totalPending: removed?.status === 'pending' ? Math.max(0, store.totalPending() - 1) : store.totalPending(),
            totalRejected: removed?.status === 'rejected' ? Math.max(0, store.totalRejected() - 1) : store.totalRejected(),
          });
          callbacks.onSuccess();
        },
        error: (err: HttpErr) => callbacks.onError(
          err?.error?.message ?? err?.message ?? 'Delete failed. Please try again.'
        ),
      });
    },
  }))
);
