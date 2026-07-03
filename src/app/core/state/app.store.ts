import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { computed } from '@angular/core';
import { AuthUser } from '../models/user.model';
import { Permission } from '../enums/permissions.enum';

interface AppState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  language: string;
  permissions: Permission[];
  globalSearchOpen: boolean;
  commandPaletteOpen: boolean;
  notifications: number;
}

const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  sidebarCollapsed: false,
  theme: 'light',
  language: 'en',
  permissions: [],
  globalSearchOpen: false,
  commandPaletteOpen: false,
  notifications: 0,
};

export const AppStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    userFullName: computed(() => {
      const u = store.user();
      return u ? `${u.firstName} ${u.lastName}` : '';
    }),
    hasPermission: computed(() => (permission: Permission) =>
      store.permissions().includes(permission)
    ),
  })),
  withMethods((store) => ({
    setUser(user: AuthUser | null): void {
      patchState(store, {
        user,
        isAuthenticated: !!user,
        permissions: user?.permissions ?? [],
      });
    },
    setLoading(isLoading: boolean): void {
      patchState(store, { isLoading });
    },
    toggleSidebar(): void {
      patchState(store, { sidebarCollapsed: !store.sidebarCollapsed() });
    },
    setSidebarCollapsed(collapsed: boolean): void {
      patchState(store, { sidebarCollapsed: collapsed });
    },
    setTheme(theme: 'light' | 'dark'): void {
      patchState(store, { theme });
      document.documentElement.setAttribute('data-theme', theme);
    },
    toggleTheme(): void {
      const next = store.theme() === 'light' ? 'dark' : 'light';
      patchState(store, { theme: next });
      document.documentElement.setAttribute('data-theme', next);
    },
    openCommandPalette(): void {
      patchState(store, { commandPaletteOpen: true });
    },
    closeCommandPalette(): void {
      patchState(store, { commandPaletteOpen: false });
    },
    setNotifications(count: number): void {
      patchState(store, { notifications: count });
    },
    logout(): void {
      patchState(store, { ...initialState });
    },
  }))
);
