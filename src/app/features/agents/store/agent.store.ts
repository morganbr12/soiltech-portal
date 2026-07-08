import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { inject, computed } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, finalize, timeout, EMPTY } from 'rxjs';
import { AgentService } from '../services/agent.service';
import { Agent, AgentListResponse, AgentQueryParams, CreateAgentRequest } from '../domain/agent.model';

type StoreCallbacks = { onSuccess: () => void; onError: (msg: string) => void };
type HttpErr = { error?: { message?: string }; message?: string };

interface AgentState {
  agents: Agent[];
  total: number;
  totalActive: number;
  totalInactive: number;
  totalSuspended: number;
  isLoading: boolean;
  error: string | null;
  selectedIds: string[];
}

export const AgentStore = signalStore(
  { providedIn: 'root' },
  withState<AgentState>({
    agents: [],
    total: 0,
    totalActive: 0,
    totalInactive: 0,
    totalSuspended: 0,
    isLoading: false,
    error: null,
    selectedIds: [],
  }),
  withComputed((store) => ({
    regions: computed(() => [...new Set(store.agents().map(a => a.region))].sort()),
  })),
  withMethods((store, service = inject(AgentService)) => ({
    load: rxMethod<AgentQueryParams>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(params =>
          service.list(params).pipe(
            timeout(20000),
            tap((res: AgentListResponse) => {
              patchState(store, {
                agents: res.data ?? [],
                total: res.summary?.total ?? res.data?.length ?? 0,
                totalActive: res.summary?.active ?? 0,
                totalInactive: res.summary?.inactive ?? 0,
                totalSuspended: res.summary?.suspended ?? 0,
              });
            }),
            catchError((err: { message?: string }) => {
              const msg = (err as { error?: { message?: string } })?.error?.message
                ?? err?.message
                ?? 'Failed to load agents';
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

    create(payload: CreateAgentRequest, callbacks: StoreCallbacks): void {
      service.create(payload).subscribe({
        next: () => callbacks.onSuccess(),
        error: (err: HttpErr) => callbacks.onError(
          err?.error?.message ?? err?.message ?? 'Registration failed. Please try again.'
        ),
      });
    },

    updateOne(id: string, payload: Partial<CreateAgentRequest>, callbacks: StoreCallbacks): void {
      service.update(id, payload).subscribe({
        next: updated => {
          patchState(store, {
            agents: store.agents().map(a => a.id === id ? { ...a, ...updated } : a),
          });
          callbacks.onSuccess();
        },
        error: (err: HttpErr) => callbacks.onError(
          err?.error?.message ?? err?.message ?? 'Update failed. Please try again.'
        ),
      });
    },

    deleteOne(id: string, callbacks: StoreCallbacks): void {
      service.delete(id).subscribe({
        next: () => {
          const removed = store.agents().find(a => a.id === id);
          patchState(store, {
            agents: store.agents().filter(a => a.id !== id),
            total: Math.max(0, store.total() - 1),
            totalActive: removed?.status === 'active' ? Math.max(0, store.totalActive() - 1) : store.totalActive(),
            totalInactive: removed?.status === 'inactive' ? Math.max(0, store.totalInactive() - 1) : store.totalInactive(),
            totalSuspended: removed?.status === 'suspended' ? Math.max(0, store.totalSuspended() - 1) : store.totalSuspended(),
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
