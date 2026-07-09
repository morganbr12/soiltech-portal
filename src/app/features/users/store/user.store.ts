import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, finalize, EMPTY } from 'rxjs';
import { UserService } from '../services/user.service';
import { PortalUser, UserListMeta, UserQueryParams } from '../domain/user.model';

interface UserState {
  users: PortalUser[];
  meta: UserListMeta;
  isLoading: boolean;
}

const defaultMeta: UserListMeta = { page: 1, perPage: 20, total: 0, totalPages: 0 };

export const UserStore = signalStore(
  { providedIn: 'root' },
  withState<UserState>({
    users: [],
    meta: defaultMeta,
    isLoading: false,
  }),
  withMethods((store, svc = inject(UserService)) => ({
    load: rxMethod<UserQueryParams>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(params =>
          svc.list(params).pipe(
            tap(res => patchState(store, { users: res.data, meta: res.meta })),
            catchError(() => EMPTY),
            finalize(() => patchState(store, { isLoading: false })),
          )
        ),
      )
    ),

    prependUser(user: PortalUser): void {
      patchState(store, { users: [user, ...store.users()] });
    },
  })),
);
